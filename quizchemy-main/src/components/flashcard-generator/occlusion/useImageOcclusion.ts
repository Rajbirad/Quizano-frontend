
import { useState } from 'react';
import { OcclusionRect } from './types';
import { useToast } from '@/hooks/use-toast';

export const useImageOcclusion = (
  imageUrl: string,
  onSaveOcclusions: (rects: OcclusionRect[], imageUrl: string) => void
) => {
  const { toast } = useToast();
  const [rects, setRects] = useState<OcclusionRect[]>([]);
  const [selectedRect, setSelectedRect] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const handleAddRect = (rect: OcclusionRect) => {
    setRects([...rects, rect]);
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setRects(rects.map(rect => 
      rect.id === id ? { ...rect, label } : rect
    ));
  };

  const handleDeleteRect = (id: string) => {
    setRects(rects.filter(rect => rect.id !== id));
    if (selectedRect === id) {
      setSelectedRect(null);
    }
  };

  const handleSave = () => {
    if (rects.length === 0) {
      toast({
        title: "No occlusions created",
        description: "Please create at least one occlusion area.",
        variant: "destructive",
      });
      return;
    }
    
    onSaveOcclusions(rects, imageUrl);
    toast({
      title: "Occlusions saved",
      description: `Created ${rects.length} flashcards from your image.`,
    });
  };

  return {
    rects,
    selectedRect,
    showLabels,
    setSelectedRect,
    setShowLabels,
    handleAddRect,
    handleUpdateLabel,
    handleDeleteRect,
    handleSave
  };
};
