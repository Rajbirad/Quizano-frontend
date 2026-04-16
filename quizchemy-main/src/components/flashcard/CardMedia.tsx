
import React from 'react';
import { getYoutubeId } from '@/components/flashcard-generator/utils';

interface CardMediaProps {
  media: {
    type: 'image' | 'video' | 'youtube';
    url: string;
  } | undefined;
}

export const CardMedia: React.FC<CardMediaProps> = ({ media }) => {
  if (!media) return null;
  switch (media.type) {
    case 'image':
      return (
        <div className="mb-4 max-h-60 overflow-hidden rounded-lg">
          <img 
            src={media.url} 
            alt="Flashcard image" 
            className="w-full h-full object-contain"
          />
        </div>
      );
    case 'video':
      return (
        <div className="mb-4 aspect-video rounded-lg overflow-hidden">
          <video 
            src={media.url} 
            controls 
            className="w-full h-full"
          />
        </div>
      );
    case 'youtube':
      return (
        <div className="mb-4 aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${getYoutubeId(media.url)}`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      );
    default:
      return null;
  }
};
