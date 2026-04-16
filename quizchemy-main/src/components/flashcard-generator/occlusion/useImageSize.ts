
import { useState, useEffect, useRef } from 'react';

export const useImageSize = (imageUrl: string) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      if (containerRef.current) {
        const maxWidth = containerRef.current.clientWidth;
        const scale = maxWidth / image.width;
        const scaledHeight = image.height * scale;
        
        setImageSize({
          width: maxWidth,
          height: scaledHeight
        });
      }
    };
  }, [imageUrl]);

  return { imageSize, containerRef };
};
