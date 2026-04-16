
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MediaPreviewProps {
  mediaType: 'none' | 'image' | 'video' | 'youtube';
  mediaUrl: string;
  clearMedia: () => void;
  getYoutubeId: (url: string) => string;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaType,
  mediaUrl,
  clearMedia,
  getYoutubeId
}) => {
  if (mediaType === 'none' || !mediaUrl) return null;
  
  return (
    <div className="mt-4 border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Media Preview</h3>
        <Button variant="ghost" size="sm" onClick={clearMedia}>Remove</Button>
      </div>
      
      {mediaType === 'image' && (
        <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
          <img 
            src={mediaUrl} 
            alt="Uploaded image" 
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      {mediaType === 'video' && (
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
          <video 
            src={mediaUrl} 
            controls 
            className="w-full h-full"
          />
        </div>
      )}
      
      {mediaType === 'youtube' && (
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${getYoutubeId(mediaUrl)}`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
