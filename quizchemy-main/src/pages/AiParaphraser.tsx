import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Copy, RefreshCw, Trash2, Sparkles, AlignLeft, Minimize2, Maximize2, CheckCheck, ChevronDown, Languages, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';
import { getApiUrl, getAuthHeaders } from '@/lib/slides-api';
import { streamTaskStatus } from '@/lib/task-stream';
import { CreditsButton } from '@/components/CreditsButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANGUAGES = [
  'Auto Detect', 'English', 'Spanish', 'French', 'German', 'Italian',
  'Portuguese', 'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean',
  'Arabic', 'Hindi', 'Turkish', 'Polish', 'Swedish', 'Danish',
  'Norwegian', 'Finnish',
];

const TONES = [
  'Standard', 'Formal', 'Casual', 'Professional', 'Academic',
  'Creative', 'Concise', 'Fluent', 'Simple',
];

const AiParaphraser: React.FC = () => {
  const { user } = useAuth();
  const { credits: creditsData, refreshCredits } = useCredits();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    if (creditsData?.ai_paraphraser) {
      setCreditBalance(creditsData.ai_paraphraser.balance ?? 0);
    }
  }, [creditsData]);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [language, setLanguage] = useState('Auto Detect');
  const [tone, setTone] = useState('Standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollStatus, setPollStatus] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to paraphrase');
      return;
    }

    setIsProcessing(true);
    setApiError(null);
    setPollStatus('Submitting...');

    try {
      const response = await fetch(getApiUrl('/api/paraphrase'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          tone: tone.toLowerCase(),
          language: language === 'Auto Detect' ? 'English' : language,
        }),
      });

      let data: any = null;
      try { data = await response.json(); } catch { /* non-JSON */ }

      if (!response.ok || data?.success === false) {
        const msgObj = data?.message;
        const errText = typeof msgObj === 'object'
          ? (msgObj?.message || msgObj?.error || 'An error occurred')
          : (typeof msgObj === 'string' ? msgObj : `Error ${response.status}`);
        setApiError(errText);
        return;
      }

      // Async task — stream for result
      const taskId = data?.task_id;
      if (taskId) {
        setPollStatus('Processing...');
        try {
          const event = await streamTaskStatus(taskId, {
            onProgress: () => setPollStatus('Processing...'),
          });
          const r = (event as any).result ?? event;
          const result = r?.paraphrased_text || r?.result || r?.text || r?.output;
          if (!result) {
            setApiError('No paraphrased text returned. Please try again.');
            return;
          }
          setOutputText(result);
          trackRecentTool('/app/ai-paraphraser');
          refreshCredits();
          return;
        } catch (streamErr) {
          setApiError(streamErr instanceof Error ? streamErr.message : 'Paraphrase failed. Please try again.');
          return;
        }
      }

      // Synchronous response (fallback)
      const result = data?.paraphrased_text || data?.result || data?.text || data?.output;
      if (!result) {
        setApiError('No paraphrased text returned. Please try again.');
        return;
      }
      setOutputText(result);
      trackRecentTool('/app/ai-paraphraser');
      refreshCredits();
    } catch (error) {
      console.error('Paraphrase error:', error);
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
      setPollStatus('');
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast.success('Copied to clipboard!');
    }
  };

  // ── Floating selection toolbar ──────────────────────────────────────────────
  const outputPanelRef = useRef<HTMLDivElement>(null); // outer relative div (for toolbar position)
  const outputRef      = useRef<HTMLDivElement>(null); // inner scrollable text div (for text offsets)
  const selectedRangeRef = useRef<{ start: number; end: number; text: string } | null>(null);
  const [floatToolbar, setFloatToolbar] = useState<{ x: number; y: number } | null>(null);
  const [floatLoading, setFloatLoading] = useState(false);
  const [floatPanel, setFloatPanel] = useState<{
    label: string; original: string; result: string; start: number; end: number;
  } | null>(null);

  /** Get char offset of (node, offset) inside a container's text nodes. */
  const getTextOffset = (container: Node, target: Node, offset: number): number => {
    let pos = 0;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node === target) return pos + offset;
      pos += (node.textContent ?? '').length;
    }
    return pos + offset;
  };

  const checkOutputSelection = useCallback(() => {
    const outer = outputPanelRef.current;
    const inner = outputRef.current;
    if (!outer || !inner) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { setFloatToolbar(null); return; }
    const range = sel.getRangeAt(0);
    if (!inner.contains(range.startContainer) || !inner.contains(range.endContainer)) {
      setFloatToolbar(null); return;
    }
    const text = sel.toString();
    if (!text.trim()) { setFloatToolbar(null); return; }
    const start = getTextOffset(inner, range.startContainer, range.startOffset);
    const end   = getTextOffset(inner, range.endContainer,   range.endOffset);
    selectedRangeRef.current = { start, end, text };

    const rect      = range.getBoundingClientRect();
    const outerRect = outer.getBoundingClientRect();
    const toolbarW  = 260;
    let x = rect.left + rect.width / 2 - toolbarW / 2 - outerRect.left;
    x = Math.max(4, Math.min(x, outerRect.width - toolbarW - 4));
    // prefer above; flip below if too close to top
    const y = rect.top - outerRect.top < 56
      ? rect.bottom - outerRect.top + 6
      : rect.top   - outerRect.top - 52;
    setFloatToolbar({ x, y });
  }, []);

  const applyAiEdit = useCallback(async (action: string, option?: string) => {
    const sel = selectedRangeRef.current;
    if (!sel?.text.trim()) { toast.error('Select text first'); return; }
    if (sel.text.trim().split(/\s+/).length > 500) {
      toast.error('Selection exceeds 500 words.'); return;
    }
    setFloatToolbar(null);
    setFloatLoading(true);
    const cap = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    const labels: Record<string, string> = {
      shorten: 'Shorten', extend: 'Extend', rephrase: 'Rephrase',
      fix_grammar: 'Fix Grammar', thesaurus: 'Thesaurus',
    };
    const label = option ? `${cap(action.replace('_', ' '))} → ${cap(option)}` : (labels[action] ?? cap(action));
    try {
      const res  = await fetch(getApiUrl('/api/notes/ai-edit'), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sel.text, action, option }),
      });
      let data: any = null;
      try { data = await res.json(); } catch {}
      if (!res.ok || data?.success === false) throw new Error(data?.message || 'AI edit failed');
      const result =
        data?.result?.edited_text || data?.result?.text ||
        (typeof data?.result === 'string' ? data.result : '') ||
        data?.edited_text || data?.text || data?.output || '';
      if (!result.trim()) throw new Error('No result returned');
      setFloatPanel({ label, original: sel.text, result, start: sel.start, end: sel.end });
    } catch (err: any) {
      toast.error(err?.message || 'AI edit failed');
    } finally {
      setFloatLoading(false);
    }
  }, []);

  const acceptEdit = useCallback(() => {
    if (!floatPanel) return;
    setOutputText(t => t.slice(0, floatPanel.start) + floatPanel.result + t.slice(floatPanel.end));
    setFloatPanel(null);
    selectedRangeRef.current = null;
  }, [floatPanel]);

  const rejectEdit = useCallback(() => {
    setFloatPanel(null);
    selectedRangeRef.current = null;
  }, []);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="relative mb-10">
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">AI Paraphraser</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <div className="flex-1 flex justify-end">
              <CreditsButton balance={creditBalance} />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-600 max-w-xl mx-auto mt-2 font-medium">
            Rewrite text instantly while preserving the original meaning
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-muted-foreground/20 rotate-12"><AlignLeft className="h-5 w-5" /></div>
        </div>
        <div className="absolute top-10 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="text-muted-foreground/30 -rotate-12"><Sparkles className="h-4 w-4" /></div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="w-full max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 ${outputText ? 'lg:grid-cols-2' : ''} gap-1`}>

          {/* Left â€” input */}
          <div className="lg:pr-1 flex flex-col">
            <div className="relative mb-4">
              <Textarea
                placeholder="Enter or paste your text here..."
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setApiError(null); }}
                className="h-[580px] w-full resize-none pr-4 pb-8 mx-4 border-2 border-border rounded-3xl px-5 py-4"
              />
              {inputText && (
                <button
                  onClick={() => { setInputText(''); setApiError(null); setOutputText(''); }}
                  className="absolute top-2 right-3 p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                  title="Clear"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="absolute bottom-2 right-3 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground">
                {inputWordCount} / 2000 Words
              </div>
            </div>

            {/* Actions row */}
            <div className="flex justify-end items-center">
              <div className="flex items-center gap-3">
                {/* Language */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-9 w-36 rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">Tone</span>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="h-9 w-32 rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Paraphrase button */}
                <Button
                  onClick={handleParaphrase}
                  disabled={isProcessing || !inputText.trim()}
                  className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isProcessing
                      ? <><RefreshCw className="h-4 w-4 animate-spin" />{pollStatus || 'Paraphrasing...'}</>
                      : <><AlignLeft className="h-4 w-4" />Paraphrase</>
                    }
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </div>
            </div>

            {/* Error banner */}
            {apiError && (
              <div className="mt-3 flex items-start gap-3 p-4 rounded-2xl border border-orange-200 bg-orange-50 text-orange-800">
                <span className="flex-1 text-sm">{apiError}</span>
                <button onClick={() => setApiError(null)} className="shrink-0 text-orange-400 hover:text-orange-600">
                  <span className="text-xs">âœ•</span>
                </button>
              </div>
            )}
          </div>

          {/* Right â€” output (only when there's content) */}
          {/* Right — output (only when there's content) */}
          {outputText && (
            <div className="lg:pl-1 flex flex-col">
              <p className="text-sm font-semibold text-muted-foreground mb-2 ml-4">Paraphrased Text</p>
              <div ref={outputPanelRef} className="relative mb-4 mx-4">
                {/* Scrollable text */}
                <div
                  ref={outputRef}
                  onMouseUp={checkOutputSelection}
                  className="h-[580px] w-full overflow-y-auto rounded-3xl border-2 border-border bg-muted/50 px-5 py-4 pb-8 text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed thin-scrollbar select-text"
                >
                  {outputText}
                </div>

                {/* Word count */}
                <div className="absolute bottom-2 right-3 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground">
                  {outputWordCount} Words
                </div>

                {/* Floating selection toolbar */}
                {floatToolbar && !floatLoading && !floatPanel && (
                  <div
                    className="absolute z-20 flex items-center gap-0.5 rounded-full border bg-white shadow-lg px-2 py-1.5 pointer-events-auto"
                    style={{ left: floatToolbar.x, top: floatToolbar.y, width: 260 }}
                    onMouseDown={e => e.preventDefault()}
                  >
                    <div className="flex h-7 w-7 items-center justify-center text-violet-600 shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="h-4 w-px bg-border mx-1" />
                    <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors" title="Shorten"
                      onClick={() => void applyAiEdit('shorten')}>
                      <Minimize2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors" title="Extend"
                      onClick={() => void applyAiEdit('extend')}>
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors" title="Rephrase"
                      onClick={() => void applyAiEdit('rephrase')}>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors" title="Fix Grammar"
                      onClick={() => void applyAiEdit('fix_grammar')}>
                      <CheckCheck className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors" title="More options"
                          onMouseDown={e => e.preventDefault()}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="z-[60]">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger><Languages className="h-4 w-4 mr-2" />Translate</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('translate', 'english')}>English</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('translate', 'hindi')}>Hindi</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('translate', 'spanish')}>Spanish</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('translate', 'french')}>French</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Tone</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('tone', 'professional')}>Professional</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('tone', 'friendly')}>Friendly</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('tone', 'confident')}>Confident</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('tone', 'neutral')}>Neutral</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Writing Style</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('writing_style', 'academic')}>Academic</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('writing_style', 'creative')}>Creative</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('writing_style', 'business')}>Business</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void applyAiEdit('writing_style', 'casual')}>Casual</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem onSelect={() => void applyAiEdit('thesaurus')}>Thesaurus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors" title="Dismiss"
                      onClick={() => setFloatToolbar(null)}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* AI loading overlay */}
                {floatLoading && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-md pointer-events-none">
                    <div className="flex items-center gap-2 bg-background border border-border shadow-lg rounded-full px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                      <span className="text-sm font-medium">AI is editing…</span>
                    </div>
                  </div>
                )}

                {/* Result review panel */}
                {floatPanel && (
                  <div className="absolute z-20 left-3 right-3 bottom-10 bg-white border border-border rounded-xl shadow-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-violet-700 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />{floatPanel.label}
                      </span>
                      <button onClick={rejectEdit} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground line-through line-clamp-2 px-1">
                      {floatPanel.original}
                    </div>
                    <div className="text-sm text-foreground bg-green-50 rounded-md px-2 py-1.5 max-h-28 overflow-y-auto">
                      {floatPanel.result}
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button onClick={rejectEdit} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 rounded-lg hover:bg-muted transition-colors">
                        Discard
                      </button>
                      <button onClick={acceptEdit} className="text-xs font-medium text-white bg-primary hover:bg-primary/90 px-3 py-1 rounded-lg transition-colors">
                        Accept
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end items-center">
                <Button onClick={handleCopy} size="sm" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
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
            <Card className="glass-panel p-6 rounded-2xl text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/content-lecture.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">Academic Writing</h3>
              <p className="text-muted-foreground">Rephrase essays and research papers to avoid plagiarism</p>
            </Card>
            <Card className="glass-panel p-6 rounded-2xl text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/meeting-notes.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">Content Creation</h3>
              <p className="text-muted-foreground">Rewrite content with a fresh tone without losing meaning</p>
            </Card>
            <Card className="glass-panel p-6 rounded-2xl text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/research-analysis.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">Professional Documents</h3>
              <p className="text-muted-foreground">Polish reports and emails with a professional tone</p>
            </Card>
          </div>
        </div>
      </div>
    </div>

  );
};

export default AiParaphraser;
