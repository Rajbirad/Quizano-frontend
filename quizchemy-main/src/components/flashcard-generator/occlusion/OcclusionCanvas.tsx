
import React, { useEffect } from 'react';
import { OcclusionRect } from './types';
import { useOcclusionCanvas } from './useOcclusionCanvas';

interface OcclusionCanvasProps {
  imageUrl: string;
  imageSize: { width: number; height: number };
  rects: OcclusionRect[];
  selectedRect: string | null;
  showLabels: boolean;
  onSelectRect: (id: string | null) => void;
  onAddRect: (rect: OcclusionRect) => void;
}

export const OcclusionCanvas: React.FC<OcclusionCanvasProps> = ({
  imageUrl,
  imageSize,
  rects,
  selectedRect,
  showLabels,
  onSelectRect,
  onAddRect
}) => {
  const {
    canvasRef,
    imageRef,
    drawCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useOcclusionCanvas({
    rects,
    selectedRect,
    showLabels,
    onSelectRect,
    onAddRect
  });

  useEffect(() => {
    drawCanvas();
  }, [rects, selectedRect, showLabels, imageSize]);

  return (
    <div className="relative border rounded-md overflow-hidden">
      <img 
        ref={imageRef}
        src={imageUrl} 
        alt="Occlusion image"
        className="w-full h-auto object-contain hidden"
      />
      <canvas
        ref={canvasRef}
        width={imageSize.width}
        height={imageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair"
      />
    </div>
  );
};
