import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface YouTubeTabProps {
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  youtubeError?: string;
  onUrlChange?: (url: string) => void;
  isProcessing?: boolean;
}

export const YouTubeTab: React.FC<YouTubeTabProps> = ({ 
  youtubeUrl, 
  setYoutubeUrl, 
  youtubeError = '',
  onUrlChange,
  isProcessing = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    if (onUrlChange) {
      onUrlChange(url);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const isValidYouTubeUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11;
  };

  const handleRemoveVideo = () => {
    setYoutubeUrl('');
    if (onUrlChange) {
      onUrlChange('');
    }
  };

  return (
    <div className="space-y-6">
      {/* YouTube URL Input */}
      {!youtubeUrl || youtubeError || !isValidYouTubeUrl(youtubeUrl) ? (
        <div className="space-y-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a2.9 2.9 0 0 0-2.04-2.054C19.644 3.6 12 3.6 12 3.6s-7.644 0-9.458.532A2.9 2.9 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.9 2.9 0 0 0 2.04 2.054C4.356 20.4 12 20.4 12 20.4s7.644 0 9.458-.532a2.9 2.9 0 0 0 2.04-2.054C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.75 12l-6 3.568z"/>
            </svg>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={handleChange}
              className={`pl-12 h-12 border-2 rounded-2xl ${
                youtubeError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary'
              }`}
            />
          </div>
          {youtubeError ? (
            <p className="text-sm text-red-600">{youtubeError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enter a YouTube video URL and we'll use the transcript to create your infographic.
            </p>
          )}
        </div>
      ) : (
        /* YouTube Preview */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="text-red-600 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a2.9 2.9 0 0 0-2.04-2.054C19.644 3.6 12 3.6 12 3.6s-7.644 0-9.458.532A2.9 2.9 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.9 2.9 0 0 0 2.04 2.054C4.356 20.4 12 20.4 12 20.4s7.644 0 9.458-.532a2.9 2.9 0 0 0 2.04-2.054C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.75 12l-6 3.568z"/>
              </svg>
              <span className="text-sm font-medium text-muted-foreground">YouTube Video</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveVideo}
              disabled={isProcessing}
              className="text-destructive hover:text-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden border">
            <iframe
              src={getYoutubeEmbedUrl(youtubeUrl)}
              className="w-full h-full"
              allowFullScreen
              title="YouTube video preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}
    </div>
  );
};