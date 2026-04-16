
import React, { useRef } from 'react';

export interface MediaHandlerProps {
  onMediaChange?: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
  onClearMedia?: () => void;
  mediaType?: 'none' | 'image' | 'video' | 'youtube';
  mediaUrl?: string;
}

export const useMediaHandler = ({
  onMediaChange,
  mediaType = 'none',
  mediaUrl = '',
  onClearMedia
}: MediaHandlerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (type: 'image') => {
    fileInputRef.current?.click();
  };

  const renderMediaPreview = () => {
    if (mediaType !== 'none' && mediaUrl && onClearMedia) {
      return (
        <div className="mt-2 p-2 border rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Media: {mediaType}</span>
            <button 
              onClick={onClearMedia}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
          {mediaType === 'image' && (
            <img src={mediaUrl} alt="Content media" className="mt-2 max-h-32 object-contain" />
          )}
        </div>
      );
    }
    
    return null;
  };

  return {
    fileInputRef,
    handleMediaUpload,
    renderMediaPreview
  };
};
