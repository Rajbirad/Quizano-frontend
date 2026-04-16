import React, { useState, useEffect } from 'react';
import { Mic, Clock, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { makeAuthenticatedRequest, API_URL } from '@/lib/api-utils';

interface AudioTranscriptionRecord {
  id: string;
  audio_name?: string;
  title?: string;
  filename?: string;
  name?: string;
  created_at: string;
  text_preview?: string;
  transcription?: string;
  plain_text?: string;
  metadata?: any;
  summary?: string;
  utterances?: any[];
  audio_url?: string;
  s3_url?: string;
  audioUrl?: string;
  audioMimeType?: string;
}

interface RecentAudioTranscriptionsProps {
  onSelectTranscription: (transcription: AudioTranscriptionRecord) => void;
}

export const RecentAudioTranscriptions: React.FC<RecentAudioTranscriptionsProps> = ({ onSelectTranscription }) => {
  const [transcriptions, setTranscriptions] = useState<AudioTranscriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/audio/recent?limit=10`,
        { method: 'GET' }
      );
      if (!response.ok) throw new Error('Failed to fetch recent audio transcriptions');
      const data = await response.json();
      setTranscriptions(data.transcriptions || data.audio_transcriptions || data.sessions || data.items || []);
    } catch (error) {
      console.error('Failed to load recent audio transcriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (t: AudioTranscriptionRecord) => {
    try {
      setLoadingId(t.id);
      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/audio/${t.id}`,
        { method: 'GET' }
      );
      if (!response.ok) throw new Error('Failed to fetch transcription details');
      const data = await response.json();
      // Detail response nests under 'transcription' or 'audio_transcription'
      const full = data.transcription ?? data.audio_transcription ?? data;
      console.log('🎵 Audio detail response keys:', Object.keys(full), full);

      // utterances is a JSON string in this API — parse it
      let parsedUtterances: any[] = [];
      if (Array.isArray(full.utterances)) {
        parsedUtterances = full.utterances;
      } else if (typeof full.utterances === 'string' && full.utterances.trim()) {
        try { parsedUtterances = JSON.parse(full.utterances); } catch { parsedUtterances = []; }
      }

      // Fetch a presigned download URL from S3 using the s3_key
      let resolvedAudioUrl: string | undefined =
        full.audio_url || full.s3_url || full.presigned_url || full.signed_url ||
        full.file_url || full.download_url || full.url || undefined;
      if (!resolvedAudioUrl && full.s3_key) {
        try {
          // Try by transcription id first, then fall back to s3_key param
          const urlRes = await makeAuthenticatedRequest(
            `${API_URL}/api/audio/generate-presigned-download-url?transcription_id=${encodeURIComponent(full.id || t.id)}`,
            { method: 'GET' }
          );
          if (urlRes.ok) {
            const urlData = await urlRes.json();
            resolvedAudioUrl = urlData.download_url || urlData.url || urlData.audio_url || undefined;
          }
        } catch {
          // presigned URL fetch failed — player simply won't show
        }
      }

      const ext = (full.filename || '').toLowerCase().split('.').pop();
      const resolvedMime = full.audio_format === 'mp3' || ext === 'mp3' ? 'audio/mpeg'
        : full.audio_format === 'wav' || ext === 'wav' ? 'audio/wav'
        : 'audio/mp4';

      const normalized: AudioTranscriptionRecord = {
        ...t,
        ...full,
        transcription: full.transcription || full.plain_text || t.transcription || '',
        utterances: parsedUtterances,
        plain_text: full.plain_text || t.plain_text || '',
        summary: full.summary || t.summary || '',
        filename: full.filename || full.title || full.audio_name || t.filename || 'Audio',
        audio_url: resolvedAudioUrl,
        audioUrl: resolvedAudioUrl,
        audioMimeType: resolvedMime,
      };
      onSelectTranscription(normalized);
    } catch (error) {
      console.error('Failed to load transcription detail:', error);
      onSelectTranscription(t);
    } finally {
      setLoadingId(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transcriptions.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed mx-2">
        <Mic className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">
          No transcriptions yet. Upload an audio file to see your history here.
        </p>
      </Card>
    );
  }

  const displayed = showAll ? transcriptions : transcriptions.slice(0, 3);

  return (
    <div className="space-y-1">
      {displayed.map((t) => (
        <div
          key={t.id}
          className="px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md transition-colors text-sm"
          onClick={() => handleSelect(t)}
        >
          <div className="flex items-center gap-2">
            {loadingId === t.id
              ? <Loader2 className="h-4 w-4 text-muted-foreground flex-shrink-0 animate-spin" />
              : <Mic className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">
                {t.title || t.audio_name || t.filename || t.name || 'Untitled'}
              </p>
              {(t.text_preview || t.plain_text) && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {t.text_preview || t.plain_text}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(t.created_at)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {transcriptions.length > 3 && (
        <div className="mt-4 pt-4 border-t">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="ghost"
            size="sm"
            className="w-full text-xs"
          >
            {showAll ? 'Show Less' : `Show All (${transcriptions.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};
