
import { useState, useEffect } from 'react';
import { Flashcard } from '@/lib/types';

export function useFlashcardPreview(initialFlashcards: Flashcard[]) {
  // State for storing created flashcards and preview state
  const [createdFlashcards, setCreatedFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  const navigatePreview = (direction: 'next' | 'prev') => {
    if (createdFlashcards.length === 0) return;
    
    if (direction === 'next') {
      setCurrentPreviewIndex((prev) => 
        prev === createdFlashcards.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentPreviewIndex((prev) => 
        prev === 0 ? createdFlashcards.length - 1 : prev - 1
      );
    }
    
    // Reset flipped state when navigating
    setIsFlipped(false);
  };

  return {
    createdFlashcards,
    setCreatedFlashcards,
    isFlipped,
    currentPreviewIndex,
    setCurrentPreviewIndex,
    handleFlipCard,
    navigatePreview
  };
}
