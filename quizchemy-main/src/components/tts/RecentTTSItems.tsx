import React, { useState, useEffect, useRef } from 'react';
import { Clock, Loader2, Play, Pause, ChevronDown, Trash2 } from 'lucide-react';
import { makeAuthenticatedRequest, API_URL } from '@/lib/api-utils';

interface TTSRecord {
  id: string;
  title?: string;
  text_preview?: string;
  voice?: string;
  created_at: string;
  audio_url?: string;
  source_type?: string;
}

interface RecentTTSItemsProps {
  refreshTrigger?: number;
  onSelect?: (audioUrl: string) => void;
}

const SPEEDS = [1, 1.5, 2, 2.5, 3];

const MiniPlayButton: React.FC<{ src: string }> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  return (
    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
      <audio ref={audioRef} src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
      >
        {playing
          ? <Pause className="h-3.5 w-3.5 text-muted-foreground" />
          : <Play className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />}
      </button>
      <button
        onClick={cycleSpeed}
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-8 text-center"
        title="Playback speed"
      >
        {SPEEDS[speedIdx]}x
      </button>
    </div>
  );
};

export const RecentTTSItems: React.FC<RecentTTSItemsProps> = ({ refreshTrigger, onSelect }) => {
  const [items, setItems] = useState<TTSRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadItems();
  }, [refreshTrigger]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const res = await makeAuthenticatedRequest(`${API_URL}/api/tts/recent?limit=10`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items || data.tts_items || data.results || data.tts || []);
    } catch {
      // silently fail — recent list is non-critical
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      await makeAuthenticatedRequest(`${API_URL}/api/tts/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelect = async (item: TTSRecord) => {
    // If we already have the audio URL, just play it
    if (item.audio_url) {
      onSelect?.(item.audio_url);
      return;
    }
    try {
      setLoadingId(item.id);
      const res = await makeAuthenticatedRequest(`${API_URL}/api/tts/${item.id}`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      const full = data.tts ?? data.item ?? data;
      const audioUrl = full.audio_url || full.url || full.file_url;
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...full, audio_url: audioUrl } : i));
      if (audioUrl) onSelect?.(audioUrl);
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) return null;

  const displayed = showAll ? items : items.slice(0, 4);

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Recent
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {displayed.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            className="relative flex-shrink-0 w-[220px] border border-border/60 rounded-2xl p-4 bg-background hover:bg-muted/40 transition-colors cursor-pointer flex flex-col justify-between gap-3"
          >
            {/* Delete button */}
            <button
              onClick={(e) => handleDelete(e, item.id)}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
              title="Delete"
            >
              {deletingId === item.id
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />}
            </button>
            <p className="text-sm text-foreground line-clamp-3 leading-snug">
              {item.text_preview || item.title || 'Speech'}
            </p>

            <div className="flex items-center justify-between">
              <div>
                {item.voice && (
                  <p className="text-xs text-muted-foreground capitalize">{item.voice}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>

              {loadingId === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
              ) : item.audio_url ? (
                <MiniPlayButton src={item.audio_url} />
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleSelect(item); }}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
                >
                  <Play className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {items.length > 4 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="flex-shrink-0 w-10 self-stretch flex items-center justify-center border border-border/60 rounded-2xl bg-background hover:bg-muted/40 transition-colors"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
          </button>
        )}
      </div>
    </div>
  );
};
