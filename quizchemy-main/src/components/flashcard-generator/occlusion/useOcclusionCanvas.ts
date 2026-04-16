
import { useRef, useState, useEffect } from 'react';
import { OcclusionRect } from './types';
import { drawRectangles, drawCurrentRect, normalizeRect, isPointInRect } from './canvasUtils';

interface UseOcclusionCanvasProps {
  rects: OcclusionRect[];
  selectedRect: string | null;
  showLabels: boolean;
  onSelectRect: (id: string | null) => void;
  onAddRect: (rect: OcclusionRect) => void;
}

export const useOcclusionCanvas = ({
  rects,
  selectedRect,
  showLabels,
  onSelectRect,
  onAddRect
}: UseOcclusionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<OcclusionRect | null>(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    
    if (!canvas || !context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image background
    const img = imageRef.current;
    if (img) {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw all rectangles
    drawRectangles(context, rects, selectedRect, showLabels);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on an existing rectangle
    const clickedRect = rects.find(r => isPointInRect(x, y, r));
    
    if (clickedRect) {
      onSelectRect(clickedRect.id);
    } else {
      // Start drawing a new rectangle
      setIsDrawing(true);
      setStartPos({ x, y });
      
      const newRect: OcclusionRect = {
        id: Date.now().toString(),
        x,
        y,
        width: 0,
        height: 0,
        label: `Label ${rects.length + 1}`
      };
      
      setCurrentRect(newRect);
      onSelectRect(newRect.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentRect || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const updatedRect: OcclusionRect = {
      ...currentRect,
      width: x - startPos.x,
      height: y - startPos.y
    };
    
    setCurrentRect(updatedRect);
    
    // Redraw canvas with temporary rectangle
    const context = canvas.getContext('2d');
    if (context) {
      drawCanvas();
      drawCurrentRect(context, startPos, updatedRect);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;
    
    // Normalize rectangle (handle negative width/height)
    let finalRect = normalizeRect(currentRect);
    
    // Only add if it has some size
    if (finalRect.width > 5 && finalRect.height > 5) {
      onAddRect(finalRect);
    }
    
    setIsDrawing(false);
    setCurrentRect(null);
  };

  return {
    canvasRef,
    imageRef,
    drawCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};
