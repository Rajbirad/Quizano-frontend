import { VariableSizeList } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import '@/components/ui/ShinyText.css';
import { trackRecentTool } from '@/utils/recentTools';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, RotateCcw, Trash2, Sparkles, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';
import { getApiUrl, getAuthHeaders } from '@/lib/slides-api';
import { streamTaskStatus } from '@/lib/task-stream';
import { CreditsButton } from '@/components/CreditsButton';

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  'Auto Detect', 'English', 'Spanish', 'French', 'German', 'Italian',
  'Portuguese', 'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean',
  'Arabic', 'Hindi', 'Turkish', 'Polish', 'Swedish', 'Danish',
  'Norwegian', 'Finnish',
];


const REASON_LABELS: Record<string, string> = {
  VERB_TENSE:       'Wrong verb tense',
  SUBJECT_VERB_AGR: 'Subject-verb agreement',
  PLURAL:           'Incorrect plural',
  ARTICLE:          'Wrong article',
  SPELLING:         'Spelling error',
  PUNCTUATION:      'Punctuation error',
  WORD_ORDER:       'Wrong word order',
  MISSING_WORD:     'Missing word',
  EXTRA_WORD:       'Extra word',
  CAPITALIZATION:   'Capitalization error',
  GRAMMAR:          'Grammar error',
  COMMA:            'Comma usage',
  PREPOSITION:      'Wrong preposition',
  TENSE:            'Wrong tense',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Correction {
  id: string;
  start: number;
  end: number;
  original: string;   // text at [start,end] in the originally checked text
  replacement: string;
  type: string;
  reason_code: string;
  source?: string;
  message?: string;
}

interface Sentence {
  sentence_index: number;
  start: number;
  end: number;
  has_error: boolean;
  error_type?: string;
  confidence: number;
  corrections: Correction[];
}

interface CheckResult {
  language: string;
  wordCount: number;
  sentenceCount: number;
  errorCount: number;
  sentences: Sentence[];
}

// Diff-based history — O(1) per action instead of O(N) Set clones
type HistoryEntry =
  | { type: 'apply';  id: string }
  | { type: 'ignore'; id: string }
  | { type: 'apply_many';  ids: string[] }
  | { type: 'ignore_many'; ids: string[] };

type SentenceRange = {
  sentence_index: number;
  start: number;
  end: number;
};


function getSentenceRanges(text: string): SentenceRange[] {
  const ranges: SentenceRange[] = [];
  const regex = /[^.!?\n]+(?:[.!?]+|$)/g;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    if (!match[0].trim()) continue;
    ranges.push({
      sentence_index: index++,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  if (ranges.length === 0 && text.length > 0) {
    ranges.push({ sentence_index: 0, start: 0, end: text.length });
  }

  return ranges;
}


// ─── Re-anchor corrections after user edits ───────────────────────────────────
// 1. Compute where the edit happened and the net char delta (oldText → newText).
// 2. Shift all corrections that sit AFTER the edit point by that delta.
// 3. Validate each (now-shifted) correction by checking the original word is
//    still there. If it drifted slightly, do a ±50 local search for the nearest
//    occurrence. If not found at all, drop the correction.
function reanchorCorrections(
  oldText: string,
  newText: string,
  sentences: CheckResult['sentences'],
  appliedIds: Set<string>,
  ignoredIds: Set<string>
): CheckResult['sentences'] {
  // Find edit boundary: first char that differs from the left
  let editPos = 0;
  while (editPos < oldText.length && editPos < newText.length && oldText[editPos] === newText[editPos]) editPos++;
  const charDelta = newText.length - oldText.length; // +ve = insertion, -ve = deletion

  const WINDOW = 50;
  return sentences.map(s => {
    // Shift sentence boundaries by the same delta
    const sStart = s.start > editPos ? Math.max(0, s.start + charDelta) : s.start;
    const sEnd   = s.end   > editPos ? Math.max(0, s.end   + charDelta) : s.end;
    return {
      ...s,
      start: sStart,
      end:   sEnd,
      corrections: s.corrections
      .filter(c => !appliedIds.has(c.id) && !ignoredIds.has(c.id))
      .reduce<Correction[]>((acc, c) => {
        // For empty-original corrections (insertions / article decorators) the backend
        // sets start/end to cover the surrounding word for visual context, but original=""
        // Using original.length (=0) as span collapses start===end after shift → invisible.
        // Use the actual span from the stored positions instead.
        const span = c.original ? c.original.length : (c.end - c.start);

        // Step 1: shift position if the edit happened before this correction
        const shiftedStart = c.start > editPos ? c.start + charDelta : c.start;
        const shiftedStart2 = Math.max(0, Math.min(shiftedStart, newText.length));

        // Empty-original: just shift, no text validation needed
        if (!c.original) {
          const shiftedEnd = Math.max(shiftedStart2, Math.min(shiftedStart2 + span, newText.length));
          acc.push({ ...c, start: shiftedStart2, end: shiftedEnd });
          return acc;
        }

        const len = c.original.length;

        // Step 2: validate — word still at shifted position?
        if (newText.slice(shiftedStart2, shiftedStart2 + len) === c.original) {
          acc.push({ ...c, start: shiftedStart2, end: shiftedStart2 + len });
          return acc;
        }
        // Step 3: local nearest-occurrence search around shifted position
        const searchStart = Math.max(0, shiftedStart2 - WINDOW);
        const searchEnd   = Math.min(newText.length, shiftedStart2 + len + WINDOW);
        const region = newText.slice(searchStart, searchEnd);
        let bestIdx = -1;
        let bestDist = Infinity;
        let i = region.indexOf(c.original);
        while (i !== -1) {
          const absPos = searchStart + i;
          const dist = Math.abs(absPos - shiftedStart2);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
          i = region.indexOf(c.original, i + 1);
        }
        if (bestIdx !== -1) {
          const newStart = searchStart + bestIdx;
          acc.push({ ...c, start: newStart, end: newStart + len });
          return acc;
        }
        // Step 4: not found — drop the correction
        return acc;
      }, []),
    };
  });
}

// ─── Offset helper (O(log N) binary search) ──────────────────────────────────

type DeltaEntry = { end: number; cumDelta: number };

/** Build sorted cumulative-delta array from accepted corrections. Call once; reuse for all shifts. */
function buildDeltaMap(
  appliedCorrs: ReadonlyArray<{ start: number; end: number; replacement: string }>
): DeltaEntry[] {
  const sorted = [...appliedCorrs].sort((a, b) => a.end - b.end);
  let cum = 0;
  return sorted.map(c => {
    cum += c.replacement.length - (c.end - c.start);
    return { end: c.end, cumDelta: cum };
  });
}

/** Shift origPos using precomputed delta map. O(log N) via binary search. */
function shiftOffset(origPos: number, deltaMap: ReadonlyArray<DeltaEntry>): number {
  let lo = 0, hi = deltaMap.length - 1, delta = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (deltaMap[mid].end <= origPos) { delta = deltaMap[mid].cumDelta; lo = mid + 1; }
    else hi = mid - 1;
  }
  return origPos + delta;
}

// ─── Shared type + overlap guard ─────────────────────────────────────────────

type ActiveCorr = {
  sentenceIdx: number;
  corrId: string;
  replacement: string;
  reason_code: string;
  source?: string;
  adjStart: number;
  adjEnd: number;
};

/** Drop any corrections whose adjusted range overlaps an already-accepted one. */
function removeOverlaps(corrs: ActiveCorr[]): ActiveCorr[] {
  const res: ActiveCorr[] = [];
  let lastEnd = -1;
  for (const c of corrs) {
    if (c.adjStart >= lastEnd) {
      res.push(c);
      lastEnd = c.adjEnd;
    }
  }
  return res;
}

// ─── Memoized highlight span (only re-renders when its own props change) ─────

interface HighlightSegProps {
  corrId: string;
  text: string;
  replacement: string;
  reason_code: string;
  isActive: boolean;
  isFlashing: boolean;
  spanRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  onAccept: (id: string) => void;
}

const HighlightSpan = React.memo<HighlightSegProps>(({ corrId, text, replacement, reason_code, isActive, isFlashing, spanRefs, onAccept }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        ref={el => { if (el) spanRefs.current.set(corrId, el); else spanRefs.current.delete(corrId); }}
        className={`underline decoration-2 underline-offset-2 cursor-pointer rounded-sm transition-all duration-300
          ${ isFlashing
              ? 'bg-green-200 text-green-800 decoration-green-400 scale-105'
              : isActive
                ? 'bg-yellow-100 text-red-600 decoration-red-400'
                : 'text-red-600 decoration-red-400 hover:bg-green-100 hover:text-green-800 hover:decoration-green-500'
          }`}
        onClick={() => onAccept(corrId)}
      >
        {text}
      </span>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs max-w-xs">
      <div className="space-y-0.5">
        <p className="font-medium text-green-700">→ {replacement || '(delete)'}</p>
        <p className="text-muted-foreground">{REASON_LABELS[reason_code] ?? reason_code}</p>
        <p className="text-muted-foreground/70 text-[11px]">Click · Enter to apply · Esc to ignore</p>
      </div>
    </TooltipContent>
  </Tooltip>
));
HighlightSpan.displayName = 'HighlightSpan';

// ─── Paragraph-chunked renderer ─────────────────────────────────────────────
// Each paragraph is a separate memoized component — only re-renders when its
// own corrections or the active highlight changes, not the whole document.

interface ParagraphBlockProps {
  paraText: string;
  paraStart: number;
  corrections: ReadonlyArray<ActiveCorr>;
  activeCorrId: string | null;
  flashCorrId: string | null;
  spanRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  onAccept: (id: string) => void;
}

const ParagraphBlock = React.memo<ParagraphBlockProps>(
  ({ paraText, paraStart, corrections, activeCorrId, flashCorrId, spanRefs, onAccept }) => {
    type Seg = { text: string; corrId?: string; replacement?: string; reason_code?: string; isActive?: boolean; isFlashing?: boolean };
    const segs: Seg[] = [];
    let cursor = 0;
    for (const corr of corrections) {
      const ls = corr.adjStart - paraStart, le = corr.adjEnd - paraStart;
      const s = Math.max(ls, cursor), e = Math.max(le, s);
      if (s > cursor) segs.push({ text: paraText.slice(cursor, s) });
      if (e > s) segs.push({ text: paraText.slice(s, e), corrId: corr.corrId, replacement: corr.replacement, reason_code: corr.reason_code, isActive: activeCorrId === corr.corrId, isFlashing: flashCorrId === corr.corrId });
      cursor = e;
    }
    if (cursor < paraText.length) segs.push({ text: paraText.slice(cursor) });
    return (
      <>
        {segs.map((seg, i) =>
          seg.corrId ? (
            <HighlightSpan key={seg.corrId} corrId={seg.corrId} text={seg.text} replacement={seg.replacement!} reason_code={seg.reason_code!} isActive={seg.isActive!} isFlashing={seg.isFlashing!} spanRefs={spanRefs} onAccept={onAccept} />
          ) : (
            <React.Fragment key={i}>{seg.text}</React.Fragment>
          )
        )}
      </>
    );
  },
  (prev, next) => {
    if (prev.paraText !== next.paraText || prev.corrections !== next.corrections || prev.paraStart !== next.paraStart) return false;
    if (prev.activeCorrId === next.activeCorrId && prev.flashCorrId === next.flashCorrId) return true;
    const ids = new Set(prev.corrections.map(c => c.corrId));
    const activeChanged = prev.activeCorrId !== next.activeCorrId && (ids.has(prev.activeCorrId ?? '') || ids.has(next.activeCorrId ?? ''));
    const flashChanged  = prev.flashCorrId  !== next.flashCorrId  && (ids.has(prev.flashCorrId  ?? '') || ids.has(next.flashCorrId  ?? ''));
    return !activeChanged && !flashChanged;
  }
);
ParagraphBlock.displayName = 'ParagraphBlock';

// ─── Virtual list row ─────────────────────────────────────────────────────

interface VListItemData {
  chunks: Array<{ text: string; start: number; corrections: ReadonlyArray<ActiveCorr> }>;
  activeCorrId: string | null;
  flashCorrId: string | null;
  spanRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  onAccept: (id: string) => void;
}

const VirtualRow = React.memo<ListChildComponentProps<VListItemData>>(({ index, style, data }) => {
  const chunk = data.chunks[index];
  return (
    <div style={{ ...style, paddingLeft: 16, paddingRight: 16 }} className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      <ParagraphBlock
        paraText={chunk.text}
        paraStart={chunk.start}
        corrections={chunk.corrections}
        activeCorrId={data.activeCorrId}
        flashCorrId={data.flashCorrId}
        spanRefs={data.spanRefs}
        onAccept={data.onAccept}
      />
    </div>
  );
});
VirtualRow.displayName = 'VirtualRow';

const GrammarChecker: React.FC = () => {
  const { user } = useAuth();
  const { credits: creditsData } = useCredits();
  const [creditBalance, setCreditBalance]   = useState<number | null>(null);
  const [inputText, setInputText]           = useState('');
  const [language, setLanguage]             = useState('Auto Detect');
  const [isProcessing, setIsProcessing]     = useState(false);
  const [apiError, setApiError]             = useState<string | null>(null);
  const [result, setResult]                 = useState<CheckResult | null>(null);
  const [pollStatus, setPollStatus]         = useState('');
  const [copied, setCopied]                 = useState(false);
  const [appliedCorrIds, setAppliedCorrIds] = useState<Set<string>>(new Set());
  const [ignoredCorrIds, setIgnoredCorrIds] = useState<Set<string>>(new Set());
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number | null>(null);
  const [activeCorrId, setActiveCorrId]             = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [flashCorrId, setFlashCorrId] = useState<string | null>(null);
  const [panelWidth, setPanelWidth]   = useState(0);
  const [isDirty, setIsDirty]         = useState(false);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const listRef      = useRef<VariableSizeList>(null);
  const sentSpanRefs = useRef<Map<string, HTMLElement>>(new Map());
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const backdropRef  = useRef<HTMLDivElement>(null);
  // Snapshot of inputText at the moment the last API check was run
  const checkedTextRef = useRef<string>('');
  // Normalized text that was actually sent to the API (backend collapses \n\n → \n)
  const normalizedSendRef = useRef<string>('');
  // Stable ref to latest correction state — avoids stale-closure in pushHistory
  const corrStateRef = useRef({ appliedCorrIds, ignoredCorrIds });
  const resultRef = useRef<CheckResult | null>(null);
  const autoCheckTimeoutRef = useRef<number | null>(null);
  const activeCheckAbortRef = useRef<AbortController | null>(null);
  const latestCheckSeqRef = useRef(0);
  useEffect(() => {
    corrStateRef.current = { appliedCorrIds, ignoredCorrIds };
    resultRef.current = result;
  }, [appliedCorrIds, ignoredCorrIds, result]);

  const cancelPendingGrammarCheck = useCallback(() => {
    if (autoCheckTimeoutRef.current !== null) {
      window.clearTimeout(autoCheckTimeoutRef.current);
      autoCheckTimeoutRef.current = null;
    }
    if (activeCheckAbortRef.current) {
      activeCheckAbortRef.current.abort();
      activeCheckAbortRef.current = null;
    }
    setIsProcessing(false);
    setPollStatus('');
  }, []);

  // Fix #3: clear span refs on unmount to prevent stale-ref accumulation
  useEffect(() => { return () => { sentSpanRefs.current.clear(); }; }, []);

  // Measure panel width for VariableSizeList (only when the result panel is mounted)
  useEffect(() => {
    const el = leftPanelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPanelWidth(entry.contentRect.width));
    ro.observe(el);
    setPanelWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [result]); // re-run when result mounts the panel div

  const pushHistory = useCallback((entry: HistoryEntry) => {
    setHistory(h => [...h.slice(-49), entry]);
  }, []);

  // Replay history entries in reverse to undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const entry = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setActiveCorrId(null);
    if (entry.type === 'apply')  setAppliedCorrIds(p => { const n = new Set(p); n.delete(entry.id);  return n; });
    if (entry.type === 'ignore') setIgnoredCorrIds(p => { const n = new Set(p); n.delete(entry.id);  return n; });
    if (entry.type === 'apply_many')  setAppliedCorrIds(p => { const n = new Set(p); entry.ids.forEach(id => n.delete(id)); return n; });
    if (entry.type === 'ignore_many') setIgnoredCorrIds(p => { const n = new Set(p); entry.ids.forEach(id => n.delete(id)); return n; });
  }, [history]);

  useEffect(() => {
    if ((creditsData as any)?.ai_grammar) {
      setCreditBalance((creditsData as any).ai_grammar.balance ?? 0);
    }
  }, [creditsData]);

  // Fix #1: single flat array — reused by displayText, pendingActiveCorrs, handleAcceptAll
  const flatCorrections = useMemo(() =>
    result ? result.sentences.flatMap(s => s.corrections) : [],
    [result]
  );

  const appliedCorrsFlat = useMemo(() =>
    flatCorrections.filter(c => appliedCorrIds.has(c.id)),
    [flatCorrections, appliedCorrIds]
  );

  // Resolve applied correction positions using original-based search so that
  // drifted API offsets (due to backend \n\n normalization) don't corrupt displayText.
  const resolvedAppliedCorrs = useMemo(() => {
    const resolved: Array<{ id: string; rawStart: number; rawEnd: number; replacement: string }> = [];
    for (const c of appliedCorrsFlat) {
      let rawStart: number, rawEnd: number;
      if (c.original) {
        // Fix 1: exact position match — fastest path, no search needed
        if (inputText.slice(c.start, c.end) === c.original) {
          rawStart = c.start;
          rawEnd   = c.end;
        } else {
          // Fix 2: narrow window; Fix 3: context scoring to pick correct occurrence
          const WINDOW = 30;
          const searchFrom = Math.max(0, c.start - WINDOW);
          const searchTo   = Math.min(inputText.length, c.start + c.original.length + WINDOW);
          const region     = inputText.slice(searchFrom, searchTo);
          let bestIdx = -1, bestScore = Infinity;
          let i = region.indexOf(c.original);
          while (i !== -1) {
            const absPos = searchFrom + i;
            const ctxBefore = inputText.slice(Math.max(0, absPos - 5), absPos);
            const origBefore = inputText.slice(Math.max(0, c.start - 5), c.start);
            const ctxScore = ctxBefore === origBefore ? 0 : 50;
            const score = Math.abs(absPos - c.start) + ctxScore;
            if (score < bestScore) { bestScore = score; bestIdx = i; }
            i = region.indexOf(c.original, i + 1);
          }
          // Fix 4: hard fail — skip rather than apply at wrong position
          if (bestIdx === -1) continue;
          rawStart = searchFrom + bestIdx;
          rawEnd   = rawStart + c.original.length;
        }
      } else {
        if (c.start === c.end) continue;
        rawStart = c.start;
        rawEnd   = c.end;
      }
      // If replacement starts with punctuation and the character immediately before
      // rawStart is a space that wasn't part of the original match, extend rawStart
      // back by 1 so the spurious "word ," → "word," space is consumed.
      if (
        /^[,;:!?.]/.test(c.replacement) &&
        rawStart > 0 &&
        inputText[rawStart - 1] === ' ' &&
        !(c.original ?? '').startsWith(' ')
      ) {
        rawStart -= 1;
      }
      resolved.push({ id: c.id, rawStart, rawEnd, replacement: c.replacement });
    }
    return resolved;
  }, [appliedCorrsFlat, inputText]);

  // O(log N) delta map — built from resolved positions
  const deltaMap = useMemo(() =>
    buildDeltaMap(resolvedAppliedCorrs.map(r => ({ start: r.rawStart, end: r.rawEnd, replacement: r.replacement }))),
    [resolvedAppliedCorrs]
  );

  // Precompute overlap-free adjusted segments for the left panel
  const pendingActiveCorrs = useMemo((): ActiveCorr[] => {
    if (!result) return [];
    const pending: ActiveCorr[] = [];
    result.sentences.forEach(s => {
      if (!s.has_error) return;
      s.corrections.forEach(c => {
        if (appliedCorrIds.has(c.id) || ignoredCorrIds.has(c.id)) return;

        let rawStart: number;
        let rawEnd: number;

        if (c.original) {
          // Fix 1: exact position match — fastest path, no search needed
          if (inputText.slice(c.start, c.end) === c.original) {
            rawStart = c.start;
            rawEnd   = c.end;
          } else {
            // Fix 2: narrow window; Fix 3: context scoring to pick correct occurrence
            const WINDOW = 30;
            const searchFrom = Math.max(0, c.start - WINDOW);
            const searchTo   = Math.min(inputText.length, c.start + c.original.length + WINDOW);
            const region     = inputText.slice(searchFrom, searchTo);
            let bestIdx = -1, bestScore = Infinity;
            let i = region.indexOf(c.original);
            while (i !== -1) {
              const absPos = searchFrom + i;
              const ctxBefore = inputText.slice(Math.max(0, absPos - 5), absPos);
              const origBefore = inputText.slice(Math.max(0, c.start - 5), c.start);
              const ctxScore = ctxBefore === origBefore ? 0 : 50;
              const score = Math.abs(absPos - c.start) + ctxScore;
              if (score < bestScore) { bestScore = score; bestIdx = i; }
              i = region.indexOf(c.original, i + 1);
            }
            // Fix 4: hard fail — skip rather than underline wrong word
            if (bestIdx === -1) return;
            rawStart = searchFrom + bestIdx;
            rawEnd   = rawStart + c.original.length;
          }
        } else {
          // No original field — use raw offsets
          if (c.start === c.end) return;
          rawStart = c.start;
          rawEnd   = c.end;
        }

        const adjStart = shiftOffset(rawStart, deltaMap);
        const adjEnd   = shiftOffset(rawEnd,   deltaMap);
        if (adjEnd > adjStart) {
          pending.push({ sentenceIdx: s.sentence_index, corrId: c.id, replacement: c.replacement, reason_code: c.reason_code, source: c.source, adjStart, adjEnd });
        }
      });
    });
    pending.sort((a, b) => a.adjStart - b.adjStart);
    return removeOverlaps(pending);
  }, [result, inputText, appliedCorrIds, ignoredCorrIds, deltaMap]);

  // Rebuild displayText from inputText + accepted corrections (right-to-left, resolved positions)
  const displayText = useMemo(() => {
    if (!result) return inputText;
    const toApply = [...resolvedAppliedCorrs].sort((a, b) => b.rawStart - a.rawStart);
    let text = inputText;
    for (const r of toApply) text = text.slice(0, r.rawStart) + r.replacement + text.slice(r.rawEnd);
    return text;
  }, [inputText, result, resolvedAppliedCorrs]);

  // Split displayText into chunks at newline boundaries, then word boundaries for long paragraphs.
  // Never cuts mid-word — words always stay whole within a single chunk.
  const paragraphChunks = useMemo(() => {
    const CHUNK_LIMIT = 500;
    const chunks: Array<{ text: string; start: number; corrections: ActiveCorr[] }> = [];

    const pushChunk = (text: string, start: number) => {
      if (text) chunks.push({
        text,
        start,
        corrections: pendingActiveCorrs.filter(c => c.adjStart < start + text.length && c.adjEnd > start),
      });
    };

    // Collect split points after each newline character
    const splitPoints: number[] = [];
    for (let i = 0; i < displayText.length; i++) {
      if (displayText[i] === '\n') splitPoints.push(i + 1);
    }
    splitPoints.push(displayText.length);

    let pos = 0;
    for (const splitEnd of splitPoints) {
      const para = displayText.slice(pos, splitEnd);
      if (para.length <= CHUNK_LIMIT) {
        pushChunk(para, pos);
      } else {
        // Break long paragraph at word boundaries only
        let offset = 0;
        while (offset < para.length) {
          let end = Math.min(offset + CHUNK_LIMIT, para.length);
          if (end < para.length) {
            const spaceIdx = para.lastIndexOf(' ', end);
            if (spaceIdx > offset) end = spaceIdx + 1;
          }
          pushChunk(para.slice(offset, end), pos + offset);
          offset = end;
        }
      }
      pos = splitEnd;
    }

    return chunks.length > 0 ? chunks : [{ text: displayText, start: 0, corrections: pendingActiveCorrs }];
  }, [displayText, pendingActiveCorrs]);

  // Reset VariableSizeList item-size cache when chunks change
  useEffect(() => { listRef.current?.resetAfterIndex(0); }, [paragraphChunks]);

  // corrId → chunk index — used for O(1) scroll-to-item
  const corrChunkIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    paragraphChunks.forEach((chunk, i) => chunk.corrections.forEach(c => map.set(c.corrId, i)));
    return map;
  }, [paragraphChunks]);

  // Backdrop segments: split displayText into plain/error spans for the underline overlay
  const backdropSegments = useMemo(() => {
    const text = displayText;
    if (!result || pendingActiveCorrs.length === 0) return [{ text, isError: false, corrId: undefined as string | undefined, replacement: '', reason_code: '', source: undefined as string | undefined }];
    const sorted = [...pendingActiveCorrs].sort((a, b) => a.adjStart - b.adjStart);
    const parts: { text: string; isError: boolean; corrId?: string; replacement?: string; reason_code?: string; source?: string }[] = [];
    let pos = 0;
    for (const c of sorted) {
      if (c.adjStart > pos) parts.push({ text: text.slice(pos, c.adjStart), isError: false });
      const slice = text.slice(c.adjStart, c.adjEnd);
      if (slice) parts.push({ text: slice, isError: true, corrId: c.corrId, replacement: c.replacement, reason_code: c.reason_code, source: c.source });
      pos = Math.max(pos, c.adjEnd);
    }
    if (pos < text.length) parts.push({ text: text.slice(pos), isError: false });
    return parts;
  }, [result, displayText, pendingActiveCorrs]);

  // Estimated row height: ~23px per wrapped line + 12px vertical padding
  const getItemSize = useCallback((index: number): number => {
    const text = paragraphChunks[index]?.text ?? '';
    const charsPerLine = Math.max(20, Math.floor((panelWidth - 32) / 7.5));
    const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
    return lines * 23 + 12;
  }, [paragraphChunks, panelWidth]);

  // Stable itemData — defined after handleAcceptCorr below
  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;

  const parseApiResult = useCallback((
    data: any,
    context?: { offsetStart?: number; sentenceIndexOffset?: number; sourceText?: string }
  ): CheckResult => {
    const offsetStart = context?.offsetStart ?? 0;
    const sentenceIndexOffset = context?.sentenceIndexOffset ?? 0;
    const sourceText = context?.sourceText ?? checkedTextRef.current;

    const raw: CheckResult = {
      language:      data.language       || '',
      wordCount:     data.word_count     || 0,
      sentenceCount: data.sentence_count || 0,
      errorCount:    data.error_count    || 0,
      sentences: Array.isArray(data.sentences)
        ? data.sentences.map((s: any) => {
            const sentenceIndex = (typeof s?.sentence_index === 'number' ? s.sentence_index : 0) + sentenceIndexOffset;
            const sentenceStart = (typeof s?.start === 'number' ? s.start : 0) + offsetStart;
            const sentenceEnd = (typeof s?.end === 'number' ? s.end : sentenceStart) + offsetStart;

            return {
              ...s,
              sentence_index: sentenceIndex,
              start: sentenceStart,
              end: sentenceEnd,
              corrections: Array.isArray(s.corrections)
                ? s.corrections.map((c: any) => {
                    const corrStart = (typeof c?.start === 'number' ? c.start : 0) + offsetStart;
                    const corrEnd = (typeof c?.end === 'number' ? c.end : corrStart) + offsetStart;
                    return {
                      ...c,
                      id: `${sentenceIndex}_${c.id}`,
                      start: corrStart,
                      end: corrEnd,
                      original: c.original ?? sourceText.slice(corrStart, corrEnd),
                    };
                  })
                : [],
            };
          })
        : [],
    };
    return raw;
  }, []);

  const applyResult = useCallback((
    data: any,
    sourceText: string,
  ) => {
    trackRecentTool('/app/grammar-checker');
    checkedTextRef.current = sourceText;

    const parsedResult = parseApiResult(data, { sourceText });
    resultRef.current = parsedResult;

    setResult(parsedResult);
    setAppliedCorrIds(new Set());
    setIgnoredCorrIds(new Set());
    setHistory([]);
    setActiveSentenceIdx(null);
    setActiveCorrId(null);
    sentSpanRefs.current.clear();
  }, [parseApiResult]);

  const runGrammarCheck = useCallback(async (textValue: string) => {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (wordCount > 2000) return;

    const textToSend = textValue.replace(/\r\n/g, '\n');
    normalizedSendRef.current = textToSend;

    if (activeCheckAbortRef.current) {
      activeCheckAbortRef.current.abort();
    }

    const seq = ++latestCheckSeqRef.current;
    const controller = new AbortController();
    activeCheckAbortRef.current = controller;

    setIsProcessing(true);
    setApiError(null);
    setPollStatus('Checking...');

    try {
      const res = await fetch(getApiUrl('/api/grammar-check'), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          language: language === 'Auto Detect' ? 'English' : language,
        }),
        signal: controller.signal,
      });

      if (controller.signal.aborted || seq !== latestCheckSeqRef.current) return;

      let data: any = null;
      try { data = await res.json(); } catch {}

      if (!res.ok || data?.success === false) {
        const m = data?.message ?? data?.detail;
        const normalizedMessage = Array.isArray(m)
          ? m.map((item: any) => item?.msg || item?.message).filter(Boolean).join(', ')
          : typeof m === 'object'
            ? (m?.message || m?.detail || 'An error occurred')
            : (typeof m === 'string' ? m : `Error ${res.status}`);
        setApiError(normalizedMessage || `Error ${res.status}`);
        return;
      }

      const taskId = data?.task_id;
      if (taskId) {
        setPollStatus('Processing...');
        try {
          const event = await streamTaskStatus(taskId, {
            signal: controller.signal,
            onProgress: () => setPollStatus('Processing...'),
          });
          if (controller.signal.aborted || seq !== latestCheckSeqRef.current) return;
          applyResult((event as any).result ?? event, textValue);
          setIsDirty(false);
          return;
        } catch (streamErr) {
          if (controller.signal.aborted) return;
          setApiError(streamErr instanceof Error ? streamErr.message : 'Grammar check failed.');
          return;
        }
      }

      applyResult(data, textValue);
      setIsDirty(false);
    } catch (err) {
      if (controller.signal.aborted) return;
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      if (seq === latestCheckSeqRef.current) {
        setIsProcessing(false);
        setPollStatus('');
        activeCheckAbortRef.current = null;
      }
    }
  }, [applyResult, language]);

  const handleCheck = async () => {
    if (!inputText.trim()) { toast.error('Please enter some text to check'); return; }
    if (inputWordCount > 2000) { toast.error(`Text exceeds 2000 words (${inputWordCount}). Please shorten.`); return; }
    await runGrammarCheck(inputText);
  };

  const handleClear = () => {
    cancelPendingGrammarCheck();
    checkedTextRef.current = '';
    setIsDirty(false);
    setInputText('');
    setApiError(null);
    setResult(null);
    setAppliedCorrIds(new Set());
    setIgnoredCorrIds(new Set());
    setHistory([]);
    setActiveSentenceIdx(null);
    setActiveCorrId(null);
    sentSpanRefs.current.clear();
  };

  const handleAcceptCorr = useCallback((id: string) => {
    pushHistory({ type: 'apply', id });
    setAppliedCorrIds(p => new Set([...p, id]));
    setActiveCorrId(a => (a === id ? null : a));
    setFlashCorrId(id);
    setTimeout(() => setFlashCorrId(null), 500);
  }, [pushHistory]);

  const handleIgnoreCorr = useCallback((id: string) => {
    pushHistory({ type: 'ignore', id });
    setIgnoredCorrIds(p => new Set([...p, id]));
  }, [pushHistory]);

  const handleAcceptSentence = useCallback((s: Sentence) => {
    const ids = s.corrections.map(c => c.id);
    pushHistory({ type: 'apply_many', ids });
    setAppliedCorrIds(p => new Set([...p, ...ids]));
    setActiveSentenceIdx(a => (a === s.sentence_index ? null : a));
    setActiveCorrId(null);
  }, [pushHistory]);

  const handleIgnoreSentence = useCallback((s: Sentence) => {
    const ids = s.corrections.map(c => c.id);
    pushHistory({ type: 'ignore_many', ids });
    setIgnoredCorrIds(p => new Set([...p, ...ids]));
    setActiveSentenceIdx(a => (a === s.sentence_index ? null : a));
    setActiveCorrId(null);
  }, [pushHistory]);

  const handleAcceptAll = useCallback(() => {
    if (!result) return;
    const ids = flatCorrections.map(c => c.id);
    pushHistory({ type: 'apply_many', ids });
    setAppliedCorrIds(new Set(ids));
    setActiveSentenceIdx(null);
    setActiveCorrId(null);
  }, [result, flatCorrections, pushHistory]);

  const handleCardClick = useCallback((idx: number, firstCorrId: string | undefined) => {
    setActiveSentenceIdx(idx);
    setActiveCorrId(firstCorrId ?? null);
  }, []);

  // Stable itemData for VariableSizeList — defined here so handleAcceptCorr is in scope
  const itemData = useMemo<VListItemData>(() => ({
    chunks: paragraphChunks,
    activeCorrId,
    flashCorrId,
    spanRefs: sentSpanRefs,
    onAccept: handleAcceptCorr,
  }), [paragraphChunks, activeCorrId, flashCorrId, handleAcceptCorr]);

  // Keyboard shortcuts: Enter = accept active, Esc = ignore active, Ctrl+Z = undo
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.key === 'Enter' && activeCorrId) { e.preventDefault(); handleAcceptCorr(activeCorrId); }
      if (e.key === 'Escape' && activeCorrId) { e.preventDefault(); handleIgnoreCorr(activeCorrId); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result, activeCorrId, handleAcceptCorr, handleIgnoreCorr, handleUndo]);

  // Scroll to the active correction — select it in the textarea
  useEffect(() => {
    if (!activeCorrId) return;
    const corr = pendingActiveCorrs.find(c => c.corrId === activeCorrId);
    if (corr && textareaRef.current) {
      const ta = textareaRef.current;
      ta.focus({ preventScroll: true });
      // cursor-only placement (no range = no blue browser selection)
      ta.setSelectionRange(corr.adjStart, corr.adjStart);
      requestAnimationFrame(() => {
        if (backdropRef.current) backdropRef.current.scrollTop = ta.scrollTop;
      });
    }
  }, [activeCorrId, pendingActiveCorrs]);

  const activeSentences = useMemo(() =>
    result
      ? result.sentences.filter(s => s.has_error && s.corrections.some(c => !appliedCorrIds.has(c.id) && !ignoredCorrIds.has(c.id)))
      : [],
    [result, appliedCorrIds, ignoredCorrIds]
  );

  const errorCards = useMemo(() => {
    if (!result) return null;
    if (activeSentences.length === 0) return (
      <div className="flex items-center gap-2 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm">
        <CheckCircle2 className="h-4 w-4" /> Great job! No errors remaining.
      </div>
    );

    return activeSentences.map(s => {
      const isActive    = activeSentenceIdx === s.sentence_index;
      const activeCorrs = s.corrections.filter(c => !appliedCorrIds.has(c.id) && !ignoredCorrIds.has(c.id));
      const preview = displayText.slice(s.start, Math.min(s.end, s.start + 120)).trim();

      return (
        <div
          key={s.sentence_index}
          onClick={() => handleCardClick(s.sentence_index, activeCorrs[0]?.id)}
          className={`rounded-lg border bg-background cursor-pointer transition-all ${
            isActive ? 'border-blue-300 ring-1 ring-blue-200' : 'border-border hover:border-blue-200'
          }`}
        >
          <div className="px-3 pt-3 pb-2 space-y-2">
            {/* Sentence preview */}
            <p className="text-xs text-muted-foreground italic line-clamp-2">
              "{preview}{preview.length >= 120 ? '…' : ''}"
            </p>

            {/* Per-correction rows */}
            {activeCorrs.map(c => (
              <div
                key={c.id}
                className={`flex items-start gap-2 rounded-md px-2.5 py-2 cursor-pointer transition-colors ${
                  activeCorrId === c.id ? 'bg-yellow-50 ring-1 ring-yellow-200' : 'bg-muted/40 hover:bg-muted/70'
                }`}
                onClick={e => { e.stopPropagation(); setActiveCorrId(c.id); setActiveSentenceIdx(s.sentence_index); }}
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-xs text-orange-600">{REASON_LABELS[c.reason_code] ?? c.reason_code}</p>
                  <p className="text-sm font-medium text-green-700">
                    {c.replacement
                      ? <>→ {c.replacement}</>
                      : <span className="text-red-500 italic">→ delete</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-1">
                  <Button
                    size="sm"
                    className="h-6 w-6 p-0 bg-primary text-primary-foreground rounded-md"
                    onClick={() => handleAcceptCorr(c.id)}
                    title="Accept"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <button
                    className="h-6 w-6 flex items-center justify-center rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => handleIgnoreCorr(c.id)}
                    title="Ignore"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {/* Bulk actions (only when >1 correction) */}
            {activeCorrs.length > 1 && (
              <div className="flex items-center gap-3 pt-1" onClick={e => e.stopPropagation()}>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1 bg-primary text-primary-foreground rounded-lg"
                  onClick={() => handleAcceptSentence(s)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Accept All
                </Button>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => handleIgnoreSentence(s)}
                >
                  Ignore All
                </button>
              </div>
            )}
          </div>
        </div>
      );
    });
  }, [result, activeSentences, activeSentenceIdx, activeCorrId, appliedCorrIds, ignoredCorrIds, inputText,
      handleCardClick, handleAcceptCorr, handleIgnoreCorr, handleAcceptSentence, handleIgnoreSentence,
      setActiveCorrId, setActiveSentenceIdx]);

  useEffect(() => () => cancelPendingGrammarCheck(), [cancelPendingGrammarCheck]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="relative mb-10">
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">Grammar Checker</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <div className="flex-1 flex justify-end">
              <CreditsButton balance={creditBalance} />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-600 max-w-xl mx-auto mt-2 font-medium">
            Instantly detect and fix grammar, spelling, and punctuation errors
          </p>
        </div>
        <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2">
          <div className="text-muted-foreground/20 rotate-12"><CheckCircle2 className="h-5 w-5" /></div>
        </div>
        <div className="absolute top-10 right-1/4 translate-x-1/2 -translate-y-1/2">
          <div className="text-muted-foreground/30 -rotate-12"><Sparkles className="h-4 w-4" /></div>
        </div>
      </div>

      {/* Main */}
      <div className="w-full max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-2' : ''} gap-6 items-start`}>

          {/* Left */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              {result && (
                <>
                  <button
                    onClick={async () => {
                      try { await navigator.clipboard.writeText(displayText); setCopied(true); setTimeout(() => setCopied(false), 2000); }
                      catch { toast.error('Copy failed. Please select and copy manually.'); }
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {history.length > 0 && (
                    <button
                      onClick={handleUndo}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      title={`Undo (${history.length} step${history.length !== 1 ? 's' : ''})`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>
                  )}
                </>
              )}
            </div>
            {apiError && (
              <div className="mb-3 flex items-start gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50 text-orange-800">
                <span className="flex-1 text-sm">{apiError}</span>
                <button onClick={() => setApiError(null)} className="shrink-0 text-orange-400 hover:text-orange-600 text-xs">✕</button>
              </div>
            )}
            <div className="relative">
              {result ? (
                <div className="relative h-[700px] w-full border-2 border-border rounded-2xl overflow-hidden">
                  {/* Textarea — editable, sits below the overlay */}
                  <Textarea
                    ref={textareaRef}
                    value={displayText}
                    spellCheck
                    autoCorrect="on"
                    autoCapitalize="sentences"
                    onScroll={() => {
                      if (backdropRef.current && textareaRef.current)
                        backdropRef.current.scrollTop = textareaRef.current.scrollTop;
                    }}
                    onChange={e => {
                      const newText = e.target.value;
                      const oldText = displayText;
                      const appliedSnap = new Set(appliedCorrIds);
                      const ignoredSnap = new Set(ignoredCorrIds);

                      setInputText(newText);
                      setIsDirty(true);
                      setAppliedCorrIds(new Set());
                      setActiveCorrId(null);
                      setActiveSentenceIdx(null);

                      setResult(currentResult => {
                        const reanchored = currentResult
                          ? {
                              ...currentResult,
                              sentences: reanchorCorrections(oldText, newText, currentResult.sentences, appliedSnap, ignoredSnap),
                            }
                          : null;
                        resultRef.current = reanchored;
                        return reanchored;
                      });
                    }}
                    className="absolute inset-0 h-full w-full resize-none pb-8 border-0 rounded-2xl bg-transparent"
                    style={{ zIndex: 10 }}
                  />
                  {/* Overlay: transparent text layer with underlines + hover tooltips */}
                  <TooltipProvider delayDuration={100}>
                    <div
                      ref={backdropRef}
                      className="absolute inset-0 px-3 py-2 pb-8 text-sm whitespace-pre-wrap break-words overflow-hidden select-none"
                      style={{ color: 'transparent', fontFamily: 'inherit', zIndex: 20, pointerEvents: 'none' }}
                    >
                      {backdropSegments.map((seg, i) =>
                        seg.isError ? (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <span
                                style={{
                                  borderBottom: '2px solid red',
                                  color: 'transparent',
                                  backgroundColor: seg.corrId === activeCorrId
                                    ? 'rgba(253,224,71,0.35)'
                                    : 'transparent',
                                  borderRadius: '2px',
                                  pointerEvents: 'auto',
                                  cursor: 'pointer',
                                }}
                                onClick={() => seg.corrId && handleAcceptCorr(seg.corrId)}
                              >{seg.text}</span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs max-w-xs">
                              <div className="space-y-0.5">
                                <p className="font-medium text-green-700">→ {seg.replacement || '(delete)'}</p>
                                <p className="text-muted-foreground">{REASON_LABELS[seg.reason_code ?? ''] ?? seg.reason_code}</p>
                                <p className="text-muted-foreground/70 text-[11px]">Click to apply</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span key={i}>{seg.text}</span>
                        )
                      )}
                      {' '}
                    </div>
                  </TooltipProvider>
                </div>
              ) : (
                <>
                  <Textarea
                    placeholder="Enter or paste your text here..."
                    value={inputText}
                    spellCheck
                    autoCorrect="on"
                    autoCapitalize="sentences"
                    onChange={e => {
                      const newText = e.target.value;
                      setInputText(newText);
                      setApiError(null);
                      if (!newText.trim()) {
                        setResult(null);
                      }
                    }}
                    className="h-[700px] w-full resize-none pb-8 border-2 border-border rounded-2xl"
                  />
                  {inputText && (
                    <button onClick={handleClear} className="absolute top-2 right-2 p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <div className={`absolute bottom-2 right-3 bg-background/80 px-2 py-1 rounded text-xs font-medium ${inputWordCount > 2000 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {inputWordCount} / 2000 Words
                    {inputWordCount > 2000 && <span className="ml-1">(limit exceeded)</span>}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center mt-3">
              {result ? (
                <div className="flex items-center gap-3">
                  {isProcessing && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>{pollStatus || 'Checking...'}</span>
                    </div>
                  )}
                  {isDirty && !isProcessing && (
                    <Button variant="default" size="sm" onClick={() => runGrammarCheck(inputText)} className="gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
                      <RefreshCw className="h-3.5 w-3.5" /> Recheck
                    </Button>
                  )}
                  <Button variant="default" size="sm" onClick={handleClear} className="gap-1.5 rounded-xl bg-primary text-primary-foreground">
                    <RefreshCw className="h-3.5 w-3.5" /> Check New Text
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-9 w-36 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCheck}
                    disabled={isProcessing || !inputText.trim() || inputWordCount > 2000}
                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isProcessing
                        ? <><RefreshCw className="h-4 w-4 animate-spin" />{pollStatus || 'Checking...'}</>
                        : <><CheckCircle2 className="h-4 w-4" />Check Grammar</>}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </div>
              )}
            </div>


          </div>

          {/* Right — suggestions */}
          {result && (
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Suggestions</p>
              <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden h-[700px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      {activeSentences.length === 0
                        ? 'All errors resolved'
                        : `${activeSentences.length} sentence${activeSentences.length !== 1 ? 's' : ''} with errors`}
                    </p>
                  </div>
                  {activeSentences.length > 0 && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 rounded-xl border-green-500 text-green-700 hover:bg-green-50" onClick={handleAcceptAll}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accept All
                    </Button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {errorCards}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Use Cases */}
      <div className="mt-28">
        <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto"><img src="/icons/content-lecture.svg" alt="" className="w-full h-full" /></div>
              <h3 className="text-lg font-medium">Academic Writing</h3>
              <p className="text-muted-foreground">Fix grammar errors in essays and research papers instantly</p>
            </Card>
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto"><img src="/icons/meeting-notes.svg" alt="" className="w-full h-full" /></div>
              <h3 className="text-lg font-middle">Emails & Messages</h3>
              <p className="text-muted-foreground">Polish professional emails and messages before sending</p>
            </Card>
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto"><img src="/icons/research-analysis.svg" alt="" className="w-full h-full" /></div>
              <h3 className="text-lg font-medium">Content Publishing</h3>
              <p className="text-muted-foreground">Ensure error-free content before publishing blogs or articles</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarChecker;
