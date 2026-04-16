
import React from 'react';

export interface MediaInputsProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onMediaChange?: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
}

export const MediaInputs: React.FC<MediaInputsProps> = ({
  fileInputRef,
  onMediaChange
}) => {
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          // Handle image upload
          const file = e.target.files?.[0];
          if (file && onMediaChange) {
            const url = URL.createObjectURL(file);
            onMediaChange('image', url);
          }
        }}
      />
    </>
  );
};
