import { useState, useCallback } from 'react';

interface UseDragAndDropOptions {
  onDrop: (files: FileList) => void;
  accept?: string[];
}

export const useDragAndDrop = ({ onDrop, accept }: UseDragAndDropOptions) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files;
      
      // Optional: Validate file types if accept is provided
      if (accept && accept.length > 0) {
        const file = files[0];
        const isValidType = accept.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type === type;
        });
        
        if (!isValidType) {
          console.warn('Invalid file type');
          return;
        }
      }
      
      onDrop(files);
    }
  }, [onDrop, accept]);

  const dragProps = {
    onDragEnter: handleDrag,
    onDragLeave: handleDrag,
    onDragOver: handleDrag,
    onDrop: handleDrop,
  };

  return {
    dragActive,
    dragProps,
  };
};
