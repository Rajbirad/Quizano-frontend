import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Copy, Download, ChevronLeft, Pencil, Check, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { MarkdownViewer } from '@/components/MarkdownViewer';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const AudioPlayer: React.FC<{ src: string; mimeType?: string }> = ({ src, mimeType }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(2);

  const fmt = (s: number) => {
    if (!isFinite(s)) return '00:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) { audioRef.current.volume = v; audioRef.current.muted = v === 0; }
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    setMuted(next);
    audioRef.current.muted = next;
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
      >
        {mimeType && <source src={src} type={mimeType} />}
      </audio>
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/50 border border-border/50">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-500/80 flex items-center justify-center hover:bg-slate-500 transition-colors shadow-sm"
        >
          {playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white ml-0.5" />}
        </button>
        <span className="text-xs tabular-nums text-muted-foreground w-10 flex-shrink-0">{fmt(currentTime)}</span>
        <input
          type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 cursor-pointer"
          style={{ accentColor: '#64748b' }}
        />
        <span className="text-xs tabular-nums text-muted-foreground w-10 flex-shrink-0 text-right">{fmt(duration)}</span>
        <button onClick={toggleMute} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input
          type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
          onChange={handleVolume}
          className="w-16 h-1.5 cursor-pointer"
          style={{ accentColor: '#64748b' }}
        />
        <button
          onClick={cycleSpeed}
          className="flex-shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground w-8 text-right transition-colors"
          title="Playback speed"
        >
          {SPEEDS[speedIdx]}x
        </button>
      </div>
    </div>
  );
};

interface Utterance {
  speaker: string;
  text: string;
  start_ms: number;
  end_ms: number;
}

interface Metadata {
  speaker_count?: number;
  utterance_count?: number;
  filename?: string;
  language?: string;
}

interface TranscriptionState {
  fileName: string;
  transcription: string;
  utterances?: Utterance[];
  plainText?: string;
  metadata?: Metadata;
  audioUrl?: string;
  audioMimeType?: string;
  summary?: string;
}

function msToTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const SPEAKER_COLORS: Record<string, string> = {
  A: 'text-violet-600 dark:text-violet-400',
  B: 'text-blue-600 dark:text-blue-400',
  C: 'text-emerald-600 dark:text-emerald-400',
  D: 'text-orange-600 dark:text-orange-400',
};

const TranscriptionResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as TranscriptionState;

  const [summary, setSummary] = useState<string>('');
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) {
      navigate('/app/audio-transcription');
      return;
    }
    if (state.summary) {
      setSummary(state.summary);
    }
  }, [state, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(state.transcription);
    toast({ title: 'Copied', description: 'Transcript copied to clipboard.' });
  };

  const handleDownload = () => {
    const blob = new Blob([state.transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!state) return null;

  const { transcription, utterances: rawUtterances, metadata = {}, fileName, audioUrl, audioMimeType } = state;
  // utterances may arrive as a JSON string from the detail API
  let utterances: Utterance[] = [];
  if (Array.isArray(rawUtterances)) {
    utterances = rawUtterances;
  } else if (typeof rawUtterances === 'string' && (rawUtterances as string).trim()) {
    try { utterances = JSON.parse(rawUtterances as string); } catch { utterances = []; }
  }
  if (!displayName && fileName) setDisplayName(fileName);
  const speakerSet = [...new Set(utterances.map(u => u.speaker))];
  const totalDurationMs = utterances.length ? utterances[utterances.length - 1].end_ms : 0;

  const startEditing = () => {
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    setEditingName(false);
    if (!displayName.trim()) setDisplayName(fileName);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar — Back + filename + edit */}
      <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0">
        <Button size="sm" variant="ghost" onClick={() => navigate('/app/audio-transcription')} className="gap-1 text-sm font-medium shrink-0">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-1 overflow-hidden max-w-xs">
          {editingName ? (
            <>
              <input
                ref={nameInputRef}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setDisplayName(fileName); setEditingName(false); } }}
                className="text-sm font-medium border-b border-primary bg-transparent outline-none w-48"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={commitEdit}>
                <Check className="h-4 w-4 text-primary" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium truncate">{displayName || fileName}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={startEditing}>
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Two equal columns */}
      <div className="flex flex-1 overflow-hidden divide-x">

        {/* LEFT — Transcript */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* SVG icon — always shown */}
          <div className="px-4 pt-4 pb-2 shrink-0 flex flex-col items-center gap-3">
            <img src="/icons/transcription.svg" alt="Transcription" className="w-36 h-36 object-contain" />
            {/* Audio player — only when we have a local blob URL */}
            {audioUrl && (
              <AudioPlayer src={audioUrl} mimeType={audioMimeType} />
            )}
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
            <h2 className="text-lg font-semibold text-foreground/70">Transcript</h2>
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={handleCopy} className="h-8 w-8">
                      <Copy className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={handleDownload} className="h-8 w-8">
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 thin-scrollbar">
            {utterances.length > 0 ? (
              utterances.map((u, i) => (
                <div key={i} className="text-sm leading-relaxed">
                  <span className="text-primary font-mono text-xs mr-2">
                    {msToTime(u.start_ms)}
                  </span>
                  {speakerSet.length > 1 && (
                    <span className={`text-xs font-semibold mr-1.5 ${SPEAKER_COLORS[u.speaker] ?? 'text-primary'}`}>
                      Speaker {u.speaker}:
                    </span>
                  )}
                  <span className="text-foreground">{u.text}</span>
                </div>
              ))
            ) : (
              transcription.split('\n').filter(Boolean).map((line, i) => {
                const m = line.match(/^(\[\d{1,2}:\d{2}(?::\d{2})?\])\s*(.*)/);
                if (m) {
                  const [, ts, rest] = m;
                  const sm = rest.match(/^(Speaker [^:]+:)\s*(.*)/i);
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-primary font-mono text-xs shrink-0 mt-0.5 w-10 text-right">{ts}</span>
                      <p className="text-sm text-foreground leading-relaxed flex-1">
                        {sm ? <><span className="font-semibold">{sm[1]}</span> {sm[2]}</> : rest}
                      </p>
                    </div>
                  );
                }
                return <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>;
              })
            )}
          </div>
        </div>

        {/* RIGHT — Summary */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="px-6 py-3 border-b shrink-0">
            <h2 className="text-lg font-semibold text-foreground/70">Summary</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 thin-scrollbar">
            {summary ? (
              <MarkdownViewer content={summary} />
            ) : (
              <p className="text-sm text-muted-foreground italic">Summary unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResult;