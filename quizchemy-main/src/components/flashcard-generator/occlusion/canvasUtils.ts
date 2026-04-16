
import { OcclusionRect } from './types';

export const drawRectangles = (
  context: CanvasRenderingContext2D,
  rects: OcclusionRect[],
  selectedRect: string | null,
  showLabels: boolean
) => {
  // Draw all rectangles
  rects.forEach((rect) => {
    context.strokeStyle = rect.id === selectedRect ? '#0ea5e9' : '#64748b';
    context.lineWidth = rect.id === selectedRect ? 3 : 2;
    
    // Draw rectangle
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    
    // Fill rectangle with semi-transparent color
    context.fillStyle = 'rgba(148, 163, 184, 0.3)';
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    
    // Draw label if enabled
    if (showLabels && rect.label) {
      context.font = '14px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      const textX = rect.x + rect.width / 2;
      const textY = rect.y + rect.height / 2;
      
      // Draw text background
      const metrics = context.measureText(rect.label);
      const textWidth = metrics.width + 10;
      const textHeight = 24;
      
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.fillRect(
        textX - textWidth / 2, 
        textY - textHeight / 2, 
        textWidth, 
        textHeight
      );
      
      context.fillStyle = '#000';
      context.fillText(rect.label, textX, textY);
    }
  });
};

export const drawCurrentRect = (
  context: CanvasRenderingContext2D,
  startPos: { x: number; y: number },
  currentRect: OcclusionRect
) => {
  context.strokeStyle = '#0ea5e9';
  context.lineWidth = 2;
  context.strokeRect(startPos.x, startPos.y, currentRect.width, currentRect.height);
  context.fillStyle = 'rgba(148, 163, 184, 0.3)';
  context.fillRect(startPos.x, startPos.y, currentRect.width, currentRect.height);
};

export const normalizeRect = (rect: OcclusionRect): OcclusionRect => {
  let normalizedRect = { ...rect };
  
  if (normalizedRect.width < 0) {
    normalizedRect.x += normalizedRect.width;
    normalizedRect.width = Math.abs(normalizedRect.width);
  }
  
  if (normalizedRect.height < 0) {
    normalizedRect.y += normalizedRect.height;
    normalizedRect.height = Math.abs(normalizedRect.height);
  }
  
  return normalizedRect;
};

export const isPointInRect = (
  x: number, 
  y: number, 
  rect: OcclusionRect
): boolean => {
  return (
    x >= rect.x && 
    x <= rect.x + rect.width && 
    y >= rect.y && 
    y <= rect.y + rect.height
  );
};
