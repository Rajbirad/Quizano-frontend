import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Square, Loader2, ChevronDown, Pencil, BookmarkPlus, BookmarkCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface ApiVoice {
  id: string;
  display_name: string;
  tags: string[];
  provider: string;
  tier: 'free' | 'paid';
  preview_url?: string;
}

// Kept for backward compat — PodcastUploader uses voice IDs directly now
export interface Voice {
  id: string;
  name: string;
  quality: 'HD' | 'Standard';
  language: string;
  accent: string;
  gender: string;
  age: string;
  style: string;
  openAIVoice?: string;
}

// getOpenAIVoice now just returns the voice id itself (API handles mapping)
export const getOpenAIVoice = (voiceId: string): string => voiceId;

// Kept for backward compat — VoiceSelector now uses static data
export const voices: Voice[] = [];

const FRIENDLY_VOICE_LABELS: Record<string, string> = {
  'chirp3-achernar': 'Soft Lady',
  'chirp3-achird': 'Friendly Man',
  'chirp3-algenib': 'Man With Deep Voice',
  'chirp3-algieba': 'Smooth Man',
  'chirp3-alnilam': 'Firm Man',
  'chirp3-aoede': 'Breezy Lady',
  'chirp3-autonoe': 'Bright Lady',
  'chirp3-callirrhoe': 'Graceful Lady',
  'chirp3-charon': 'Insightful Speaker',
  'chirp3-despina': 'Elegant Lady',
  'chirp3-enceladus': 'Breathy Man',
  'chirp3-erinome': 'Clear Lady',
  'chirp3-fenrir': 'Energetic Man',
  'chirp3-gacrux': 'Mature Lady',
  'chirp3-iapetus': 'Clear Man',
  'chirp3-kore': 'Confident Lady',
  'chirp3-laomedeia': 'Upbeat Lady',
  'chirp3-leda': 'Young Lady',
  'chirp3-orus': 'Confident Man',
  'chirp3-puck': 'Upbeat Man',
  'chirp3-pulcherrima': 'Bold Lady',
  'chirp3-rasalgethi': 'Insightful Man',
  'chirp3-sadachbia': 'Lively Man',
  'chirp3-sadaltager': 'Knowledgeable Man',
  'chirp3-schedar': 'Balanced Man',
  'chirp3-sulafat': 'Warm Lady',
  'chirp3-umbriel': 'Easygoing Man',
  'chirp3-vindemiatrix': 'Gentle Lady',
  'chirp3-zephyr': 'Bright Lady',
  'chirp3-zubenelgenubi': 'Casual Man',
};

const getFriendlyVoiceLabel = (voice: ApiVoice): string => {
  const curated = FRIENDLY_VOICE_LABELS[voice.id];
  if (curated) return curated;

  const styleTag = voice.tags.find(
    (tag) => !['English', 'American', 'Female', 'Male'].includes(tag)
  ) || 'Balanced';

  const styleAlias: Record<string, string> = {
    'Upbeat': 'Energetic',
    'Excitable': 'Energetic',
    'Easy-going': 'Easygoing',
    'Informative': 'Insightful',
    'Gravelly': 'Deep',
  };

  const normalizedStyle = styleAlias[styleTag] || styleTag;
  const genderLabel = voice.tags.includes('Female') ? 'Lady' : voice.tags.includes('Male') ? 'Gentleman' : 'Voice';

  return `${normalizedStyle} ${genderLabel}`;
};

// Returns the user-facing display name for a voice id
export const getVoiceDisplayName = (voiceId: string): string => {
  const voice = STATIC_STUDIO_VOICES.find(v => v.id === voiceId);
  if (!voice) return voiceId;
  return getFriendlyVoiceLabel(voice);
};

const STATIC_STUDIO_VOICES: ApiVoice[] = [
  { id: 'chirp3-achernar',      display_name: 'Achernar',      tags: ['English', 'American', 'Soft', 'Female'],                provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-achernar.mp3' },
  { id: 'chirp3-achird',        display_name: 'Achird',        tags: ['English', 'American', 'Friendly', 'Male'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-achird.mp3' },
  { id: 'chirp3-algenib',       display_name: 'Algenib',       tags: ['English', 'American', 'Gravelly', 'Male'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-algenib.mp3' },
  { id: 'chirp3-algieba',       display_name: 'Algieba',       tags: ['English', 'American', 'Smooth', 'Male'],               provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-algieba.mp3' },
  { id: 'chirp3-alnilam',       display_name: 'Alnilam',       tags: ['English', 'American', 'Firm', 'Male'],                 provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-alnilam.mp3' },
  { id: 'chirp3-aoede',         display_name: 'Aoede',         tags: ['English', 'American', 'Breezy', 'Female'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-aoede.mp3' },
  { id: 'chirp3-autonoe',       display_name: 'Autonoe',       tags: ['English', 'American', 'Bright', 'Female'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-autonoe.mp3' },
  { id: 'chirp3-callirrhoe',    display_name: 'Callirrhoe',    tags: ['English', 'American', 'Easy-going', 'Female'],         provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-callirrhoe.mp3' },
  { id: 'chirp3-charon',        display_name: 'Charon',        tags: ['English', 'American', 'Informative', 'Male'],          provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-charon.mp3' },
  { id: 'chirp3-despina',       display_name: 'Despina',       tags: ['English', 'American', 'Smooth', 'Female'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-despina.mp3' },
  { id: 'chirp3-enceladus',     display_name: 'Enceladus',     tags: ['English', 'American', 'Breathy', 'Male'],              provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-enceladus.mp3' },
  { id: 'chirp3-erinome',       display_name: 'Erinome',       tags: ['English', 'American', 'Clear', 'Female'],              provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-erinome.mp3' },
  { id: 'chirp3-fenrir',        display_name: 'Fenrir',        tags: ['English', 'American', 'Excitable', 'Male'],           provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-fenrir.mp3' },
  { id: 'chirp3-gacrux',        display_name: 'Gacrux',        tags: ['English', 'American', 'Mature', 'Female'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-gacrux.mp3' },
  { id: 'chirp3-iapetus',       display_name: 'Iapetus',       tags: ['English', 'American', 'Clear', 'Male'],                provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-iapetus.mp3' },
  { id: 'chirp3-kore',          display_name: 'Kore',          tags: ['English', 'American', 'Firm', 'Female'],               provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-kore.mp3' },
  { id: 'chirp3-laomedeia',     display_name: 'Laomedeia',     tags: ['English', 'American', 'Upbeat', 'Female'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-laomedeia.mp3' },
  { id: 'chirp3-leda',          display_name: 'Leda',          tags: ['English', 'American', 'Youthful', 'Female'],           provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-leda.mp3' },
  { id: 'chirp3-orus',          display_name: 'Orus',          tags: ['English', 'American', 'Firm', 'Male'],                 provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-orus.mp3' },
  { id: 'chirp3-puck',          display_name: 'Puck',          tags: ['English', 'American', 'Upbeat', 'Male'],               provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-puck.mp3' },
  { id: 'chirp3-pulcherrima',   display_name: 'Pulcherrima',   tags: ['English', 'American', 'Forward', 'Female'],            provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-pulcherrima.mp3' },
  { id: 'chirp3-rasalgethi',    display_name: 'Rasalgethi',    tags: ['English', 'American', 'Informative', 'Male'],          provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-rasalgethi.mp3' },
  { id: 'chirp3-sadachbia',     display_name: 'Sadachbia',     tags: ['English', 'American', 'Lively', 'Male'],               provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-sadachbia.mp3' },
  { id: 'chirp3-sadaltager',    display_name: 'Sadaltager',    tags: ['English', 'American', 'Knowledgeable', 'Male'],        provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-sadaltager.mp3' },
  { id: 'chirp3-schedar',       display_name: 'Schedar',       tags: ['English', 'American', 'Even', 'Male'],                 provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-schedar.mp3' },
  { id: 'chirp3-sulafat',       display_name: 'Sulafat',       tags: ['English', 'American', 'Warm', 'Female'],               provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-sulafat.mp3' },
  { id: 'chirp3-umbriel',       display_name: 'Umbriel',       tags: ['English', 'American', 'Easy-going', 'Male'],           provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-umbriel.mp3' },
  { id: 'chirp3-vindemiatrix',  display_name: 'Vindemiatrix',  tags: ['English', 'American', 'Gentle', 'Female'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-vindemiatrix.mp3' },
  { id: 'chirp3-zephyr',        display_name: 'Zephyr',        tags: ['English', 'American', 'Bright', 'Female'],             provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-zephyr.mp3' },
  { id: 'chirp3-zubenelgenubi', display_name: 'Zubenelgenubi', tags: ['English', 'American', 'Casual', 'Male'],              provider: 'gemini', tier: 'free', preview_url: 'https://d3c92hxxpufr83.cloudfront.net/voice-previews/chirp3-zubenelgenubi.mp3' },
];

interface VoiceSelectorProps {
  value: string;
  onChange: (voiceId: string) => void;
  label?: string;
  hostName?: string;
  hostTitle?: string;
  onHostInfoChange?: (name: string, title: string) => void;
  allowHostEditing?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  value,
  onChange,
  label,
  hostName = '',
  hostTitle = '',
  onHostInfoChange,
  allowHostEditing = true,
}) => {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(hostName);
  const [draftTitle, setDraftTitle] = useState(hostTitle);
  const [voiceTab, setVoiceTab] = useState<'studio' | 'my'>('studio');
  const [myVoices, setMyVoices] = useState<ApiVoice[]>(() => {
    try {
      const saved = localStorage.getItem('my_voices');
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((v) => STATIC_STUDIO_VOICES.find((voice) => voice.id === v?.id) ?? null)
        .filter(Boolean) as ApiVoice[];
    } catch { return []; }
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const saveToMyVoices = (voice: ApiVoice) => {
    setMyVoices(prev => {
      if (prev.find(v => v.id === voice.id)) return prev;
      const canonicalVoice = STATIC_STUDIO_VOICES.find((v) => v.id === voice.id) ?? voice;
      const next = [...prev, canonicalVoice];
      localStorage.setItem('my_voices', JSON.stringify(next));
      return next;
    });
  };

  const removeFromMyVoices = (voiceId: string) => {
    setMyVoices(prev => {
      const next = prev.filter(v => v.id !== voiceId);
      localStorage.setItem('my_voices', JSON.stringify(next));
      return next;
    });
  };
  // Cache presigned URLs fetched from API (keyed by voice id)
  const presignedUrlCache = useRef<Record<string, string>>({});
  const hasFetchedUrls = useRef(false);

  // Optionally fetch API preview URLs once, but keep the static CDN URL as the primary source.
  useEffect(() => {
    if (!open || hasFetchedUrls.current) return;
    hasFetchedUrls.current = true;
    const fetchPreviewUrls = async () => {
      try {
        const res = await fetch('/api/tts/voices');
        if (res.ok) {
          const data = await res.json();
          const all = [
            ...(data.voices?.free || data.free_voices || []),
            ...(data.voices?.paid || data.paid_voices || []),
          ];
          all.forEach((v: ApiVoice) => {
            if (v.preview_url) presignedUrlCache.current[v.id] = v.preview_url;
          });
        }
      } catch {
        // silently ignore — static CDN previews remain available
      }
    };
    fetchPreviewUrls();
  }, [open]);

  const stopAudio = () => {
    if (audioRef.current) {
      // Clear handlers first so setting src='' doesn't re-trigger onerror
      audioRef.current.oncanplay = null;
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingVoice(null);
    setLoadingPreview(null);
  };

  const handlePlayPreview = (voice: ApiVoice, e: React.MouseEvent) => {
    e.stopPropagation();
    stopAudio();
    if (playingVoice === voice.id) return;

    const canonicalVoice = STATIC_STUDIO_VOICES.find((v) => v.id === voice.id);
    // Prefer fresh API-fetched URL; fall back to static CDN URL
    const primaryUrl = presignedUrlCache.current[voice.id] || canonicalVoice?.preview_url || voice.preview_url;
    if (!primaryUrl) return;

    setLoadingPreview(voice.id);

    const tryPlay = (audioUrl: string, fallbackUrl?: string) => {
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audioRef.current = audio;
        audio.oncanplay = () => {
          if (audioRef.current !== audio) return; // stale, a newer voice was clicked
          setLoadingPreview(null);
          setPlayingVoice(voice.id);
        };
        audio.onended = () => {
          if (audioRef.current !== audio) return;
          stopAudio();
        };
        audio.onerror = () => {
          if (audioRef.current !== audio) return; // stale, ignore
          if (fallbackUrl) {
            tryPlay(fallbackUrl);
            return;
          }
          stopAudio();
        };
        audio.play().catch(() => {
          if (audioRef.current !== audio) return;
          stopAudio();
        });
    };

    // If primary is the API URL, fall back to CDN; otherwise no second fallback needed
    const cdnUrl = canonicalVoice?.preview_url || voice.preview_url;
    const fallback = primaryUrl !== cdnUrl ? cdnUrl : undefined;
    tryPlay(primaryUrl, fallback);
  };

  const allVoices = voiceTab === 'studio' ? STATIC_STUDIO_VOICES : myVoices;
  const selectedVoice = [...STATIC_STUDIO_VOICES, ...myVoices].find(v => v.id === value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) stopAudio(); }}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto py-4 rounded-2xl"
          >
            {selectedVoice ? (
              <div className="flex items-center gap-3">
                <Play className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{hostName || getFriendlyVoiceLabel(selectedVoice)}</span>
                {selectedVoice.tier === 'paid' && (
                  <span className="inline-flex items-center justify-center rounded border border-violet-400 text-[10px] font-bold leading-none px-1.5 py-0.5 text-violet-600 bg-violet-50">HD</span>
                )}
              </div>
            ) : (
              "Select voice..."
            )}
            <div className="flex items-center gap-1 ml-2">
              {allowHostEditing && onHostInfoChange && (
                <span
                  role="button"
                  tabIndex={0}
                  className="shrink-0 p-1 rounded hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDraftName(hostName);
                    setDraftTitle(hostTitle);
                    setEditOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      setDraftName(hostName);
                      setDraftTitle(hostTitle);
                      setEditOpen(true);
                    }
                  }}
                  title="Edit host info"
                >
                  <Pencil className="h-3.5 w-3.5 opacity-60" />
                </span>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[80vh]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Select Voice</DialogTitle>
          </DialogHeader>

          {/* Voice tabs */}
          <div className="w-full flex rounded-xl border-2 border-border bg-muted/40 p-1 gap-1 mb-1">
            <button
              onClick={() => setVoiceTab('studio')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                voiceTab === 'studio'
                  ? "bg-white shadow-sm text-blue-600 border-2 border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <span className="inline-flex items-center justify-center rounded-md border-2 border-current text-[10px] font-bold leading-none px-1 py-0.5">HD</span>
              Studio Voices
            </button>
            <button
              onClick={() => setVoiceTab('my')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                voiceTab === 'my'
                  ? "bg-white shadow-sm text-blue-600 border-2 border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <BookmarkPlus className="h-4 w-4" />
              My Voices
              {myVoices.length > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold leading-none w-4 h-4">{myVoices.length}</span>
              )}
            </button>
          </div>

          <div className="h-[52vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
            <div key={voiceTab} className="animate-in fade-in duration-150">
            {allVoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                {voiceTab === 'my' ? (
                  <>
                    <BookmarkPlus className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No saved voices yet</p>
                    <p className="text-xs text-muted-foreground/60">Click <BookmarkPlus className="inline h-3.5 w-3.5 mx-0.5" /> on any voice to save it here</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No voices available</p>
                )}
              </div>
            ) : (
              allVoices.map((voice) => {
                const isSelected = value === voice.id;
                const isPlaying = playingVoice === voice.id;
                const isLoadingThis = loadingPreview === voice.id;
                return (
                  <div
                    key={voice.id}
                    className={cn(
                      "flex items-center justify-between p-4 transition-all rounded-lg",
                      isSelected ? "bg-blue-50 border-2 border-blue-200" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Play / Stop Button */}
                      <button
                        onClick={(e) => {
                          if (isPlaying) { stopAudio(); }
                          else { handlePlayPreview(voice, e); }
                        }}
                        disabled={!voice.preview_url}
                        className={cn(
                          "relative w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                          "border-2 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed",
                          isPlaying ? "border-primary text-primary" : "border-gray-400 text-gray-600 hover:border-gray-600"
                        )}
                      >
                        {isLoadingThis ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isPlaying ? (
                          <Square className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Voice Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-base text-foreground">{getFriendlyVoiceLabel(voice)}</span>
                          {voice.tier === 'paid' && (
                            <span className="inline-flex items-center justify-center rounded border border-violet-400 text-[10px] font-bold leading-none px-1.5 py-0.5 text-violet-600 bg-violet-50">HD</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {voice.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          onChange(voice.id);
                          setOpen(false);
                          stopAudio();
                        }}
                        className={cn(isSelected && "bg-violet-600 hover:bg-violet-700")}
                      >
                        {isSelected ? 'Selected' : 'Use'}
                      </Button>
                      {voiceTab === 'my' ? (
                        <button
                          onClick={() => removeFromMyVoices(voice.id)}
                          title="Remove from My Voices"
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => saveToMyVoices(voice)}
                          title="Save to My Voices"
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            myVoices.find(v => v.id === voice.id)
                              ? "text-blue-600 bg-blue-50"
                              : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                          )}
                        >
                          {myVoices.find(v => v.id === voice.id)
                            ? <BookmarkCheck className="h-4 w-4" />
                            : <BookmarkPlus className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Host Info Dialog */}
      {allowHostEditing && onHostInfoChange && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Host or Guest Info</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="host-name">Name</Label>
                <Input
                  id="host-name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host-title">
                  Title <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="host-title"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Used by AI to reference the title in your podcast script."
                  className="rounded-2xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                onHostInfoChange(draftName, draftTitle);
                setEditOpen(false);
              }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
