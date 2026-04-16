
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useVideoContext } from '../VideoContext';
import { useToast } from '@/hooks/use-toast';

export const DropboxTab: React.FC = () => {
  const { setVideoFile, setVideoSource, isProcessing, setSummary, setCurrentStep } = useVideoContext();
  const { toast } = useToast();
  const [dropboxUrl, setDropboxUrl] = useState('');

  const isValidUrl = (url: string) => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Auto-preview when valid URL is entered
  useEffect(() => {
    if (isValidUrl(dropboxUrl)) {
      setVideoFile({
        id: `url-${Date.now()}`,
        name: "URL Video",
        type: "url",
        url: dropboxUrl
      });
      setVideoSource('dropbox');
      setSummary(null);
    }
  }, [dropboxUrl, setVideoFile, setVideoSource, setSummary]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Video URL</label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="https://example.com/video.mp4"
            value={dropboxUrl}
            onChange={(e) => setDropboxUrl(e.target.value)}
            disabled={isProcessing}
            className="pl-10 h-12 text-base transition-all border-primary/20 focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
};
