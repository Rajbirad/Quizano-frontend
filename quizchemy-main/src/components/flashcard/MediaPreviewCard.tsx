
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MediaPreviewCardProps {
  mediaType: 'none' | 'image' | 'video' | 'youtube';
  mediaUrl: string;
  youtubeUrl: string;
  onClearMedia: () => void;
}

export const MediaPreviewCard: React.FC<MediaPreviewCardProps> = ({
  mediaType,
  mediaUrl,
  youtubeUrl,
  onClearMedia
}) => {
  if (mediaType === 'none') return null;
  
  return (
    <div className="mt-2 p-2 border rounded-md bg-gray-50">
      <div className="text-sm font-medium mb-1 flex justify-between items-center">
        <span>Media Preview</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClearMedia}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {mediaType === 'image' && (
        <div className="max-h-32 overflow-hidden rounded">
          <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      
      {mediaType === 'video' && (
        <div className="aspect-video">
          <video src={mediaUrl} controls className="w-full h-full rounded" />
        </div>
      )}
      
      {mediaType === 'youtube' && (
        <div className="text-sm">YouTube video added: {youtubeUrl}</div>
      )}
    </div>
  );
};
