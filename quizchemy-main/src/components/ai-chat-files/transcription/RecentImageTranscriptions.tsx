import React, { useState, useEffect } from 'react';
import { Clock, Loader2, Image } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { makeAuthenticatedRequest, API_URL } from '@/lib/api-utils';

interface ImageTranscription {
  id: string;
  image_name?: string;
  title?: string;
  filename?: string;
  name?: string;
  created_at: string;
  text_preview?: string;
  image_url?: string;
  structured_content?: any;
}

interface RecentImageTranscriptionsProps {
  onSelectTranscription: (transcription: ImageTranscription) => void;
}

export const RecentImageTranscriptions: React.FC<RecentImageTranscriptionsProps> = ({ onSelectTranscription }) => {
  const [transcriptions, setTranscriptions] = useState<ImageTranscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      setIsLoading(true);
      console.log('Loading recent image transcriptions...');
      
      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/transcriptions/recent?limit=10`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recent transcriptions');
      }

      const data = await response.json();
      console.log('Recent transcriptions loaded:', data);
      setTranscriptions(data.transcriptions || []);
    } catch (error) {
      console.error('Failed to load recent transcriptions:', error);
      // Silently fail - no toast notification
    } finally {
      setIsLoading(false);
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
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (transcriptions.length === 0) {
    return (
      <div className="w-full">
        <Card className="p-8 text-center border-dashed">
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            No transcriptions yet. Upload an image to see your history here.
          </p>
        </Card>
      </div>
    );
  }

  const displayedTranscriptions = showAll ? transcriptions : transcriptions.slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {displayedTranscriptions.map((transcription) => (
          <div
            key={transcription.id}
            className="px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md transition-colors text-sm group"
            onClick={() => onSelectTranscription(transcription)}
          >
            <div className="flex items-center gap-2">
              <img src="/icons/graphic-style.svg" alt="" className="h-6 w-6 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">
                  {transcription.title || transcription.image_name || transcription.filename || transcription.name || 'Untitled'}
                </p>
                {transcription.text_preview && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {transcription.text_preview}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(transcription.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

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
