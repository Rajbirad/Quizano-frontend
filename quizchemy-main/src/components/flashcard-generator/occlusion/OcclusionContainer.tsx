
import React from 'react';
import { OcclusionCanvas } from './OcclusionCanvas';
import { OcclusionRect } from './types';
import { useImageSize } from './useImageSize';

interface OcclusionContainerProps {
  imageUrl: string;
  rects: OcclusionRect[];
  selectedRect: string | null;
  showLabels: boolean;
  onSelectRect: (id: string | null) => void;
  onAddRect: (rect: OcclusionRect) => void;
}

export const OcclusionContainer: React.FC<OcclusionContainerProps> = ({
  imageUrl,
  rects,
  selectedRect,
  showLabels,
  onSelectRect,
  onAddRect
}) => {
  const { imageSize, containerRef } = useImageSize(imageUrl);

  return (
    <div ref={containerRef}>
      <OcclusionCanvas 
        imageUrl={imageUrl}
        imageSize={imageSize}
        rects={rects}
        selectedRect={selectedRect}
        showLabels={showLabels}
        onSelectRect={onSelectRect}
        onAddRect={onAddRect}
      />
    </div>
  );
};
