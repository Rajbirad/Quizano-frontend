
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Youtube, Sparkles } from 'lucide-react';
import { useVideoContext } from '../VideoContext';
import { useToast } from '@/hooks/use-toast';

export const YouTubeTab: React.FC = () => {
  const { setVideoFile, setVideoSource, isProcessing, setSummary, setCurrentStep } = useVideoContext();
  const { toast } = useToast();
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const isValidYouTubeUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  useEffect(() => {
    if (youtubeUrl && isValidYouTubeUrl(youtubeUrl)) {
      // Clear any existing video state first
      localStorage.removeItem('currentVideoFile');
      localStorage.removeItem('currentVideoUrl');
      localStorage.removeItem('videoSource');
      
      const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
      if (embedUrl) {
        setVideoFile({
          id: embedUrl.split('/').pop() || Date.now().toString(),
          name: "YouTube Video",
          type: "youtube",
          url: youtubeUrl,
          embedUrl: embedUrl,
          previewUrl: embedUrl // This will be used for video preview
        });
        setVideoSource('youtube');
        setSummary(null);
        
        // Store in localStorage for persistence
        localStorage.setItem('videoContext', JSON.stringify({
          videoFile: {
            type: 'youtube',
            url: youtubeUrl,
            embedUrl: embedUrl,
            previewUrl: embedUrl
          }
        }));
      }
    }
  }, [youtubeUrl, setVideoFile, setVideoSource, setSummary]);
  
  const exampleUrls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=9bZkp7q19f0",
    "https://youtu.be/jNQXAC9IVRw"
  ];

  const handleExampleClick = (url: string) => {
    setYoutubeUrl(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">YouTube URL</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a2.9 2.9 0 0 0-2.04-2.054C19.644 3.6 12 3.6 12 3.6s-7.644 0-9.458.532A2.9 2.9 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.9 2.9 0 0 0 2.04 2.054C4.356 20.4 12 20.4 12 20.4s7.644 0 9.458-.532a2.9 2.9 0 0 0 2.04-2.054C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.75 12l-6 3.568z"/>
            </svg>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isProcessing}
              className="pl-10 h-12 text-base transition-all border-2 border-gray-300 focus:border-primary rounded-xl"
            />
          </div>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-2">Example YouTube URLs:</p>
          <div className="flex flex-wrap gap-2">
            {exampleUrls.map((url, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="text-xs rounded-full"
                onClick={() => handleExampleClick(url)}
              >
                Example {index + 1}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Show preview if a valid YouTube URL is entered */}
      {youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
        <div className="rounded-lg overflow-hidden bg-black/5">
          <div className="aspect-video">
            <iframe
              src={getYouTubeEmbedUrl(youtubeUrl) || ''}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
