
import { useState } from 'react';
import { Flashcard } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addFlashcard } from '@/lib/flashcard-store';

export function useFlashcardSave(
  setCreatedFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>,
  setActiveTab: (tab: string) => void,
  setCurrentPreviewIndex: React.Dispatch<React.SetStateAction<number>>
) {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = (
    decks: Array<{ id: string; name: string }>, 
    title: string,
    selectedDeck: string,
    frontContent: string,
    backContent: string,
    frontMediaType: 'none' | 'image' | 'video' | 'youtube',
    frontMediaUrl: string,
    backMediaType: 'none' | 'image' | 'video' | 'youtube',
    backMediaUrl: string,
    flashcard?: Partial<Flashcard>,
    resetForm?: () => void
  ) => {
    if (flashcard) {
      // If a flashcard is provided, save that specific flashcard
      setSaving(true);
      
      try {
        addFlashcard(flashcard as any);
        
        // Add to local state for preview
        setCreatedFlashcards(prev => [...prev, flashcard as Flashcard]);
        
        toast({
          title: "Flashcard added!",
          description: `Your flashcard has been added to the deck.`,
        });
        
        // Automatically show the preview of the newly created card
        setActiveTab('preview');
        setCurrentPreviewIndex(prev => {
          // Set to the index of the newly added card
          return prev + 1;
        });
        
      } catch (error) {
        toast({
          title: "Failed to create flashcard",
          description: "There was an error creating your flashcard. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
      return;
    }
    
    // Original single-card save logic
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your flashcard deck.",
        variant: "destructive",
      });
      return;
    }
    
    if (!frontContent.trim()) {
      toast({
        title: "Front content required",
        description: "Please add content to the front of your flashcard.",
        variant: "destructive",
      });
      return;
    }
    
    if (!backContent.trim()) {
      toast({
        title: "Back content required",
        description: "Please add content to the back of your flashcard.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    // Prepare media data for front and back if available
    const frontMedia = frontMediaType !== 'none' ? {
      type: frontMediaType as 'image' | 'video' | 'youtube',
      url: frontMediaUrl
    } : undefined;

    const backMedia = backMediaType !== 'none' ? {
      type: backMediaType as 'image' | 'video' | 'youtube',
      url: backMediaUrl
    } : undefined;
    
    // Create the new flashcard
    const selectedDeckObj = decks.find(d => d.id === selectedDeck);
    
    try {
      const newFlashcard = {
        id: `temp-${Date.now()}`,
        question: frontContent,
        answer: backContent,
        deckId: selectedDeck,
        deckName: selectedDeckObj?.name || 'General',
        title: title, // Add title to the flashcard
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        difficulty: 0.5,
        frontMedia: frontMedia,
        backMedia: backMedia
      };
      
      addFlashcard(newFlashcard);
      
      // Add to local state for preview
      setCreatedFlashcards(prev => [...prev, newFlashcard]);
      
      // Switch to preview tab to show the newly created card
      setActiveTab('preview');
      setCurrentPreviewIndex(prev => prev + 1);
      
      toast({
        title: "Flashcard created!",
        description: `Your flashcard "${title}" has been added to the ${selectedDeckObj?.name || 'General'} deck.`,
      });
      
      // Reset form if callback provided
      if (resetForm) {
        resetForm();
      }
      
    } catch (error) {
      toast({
        title: "Failed to create flashcard",
        description: "There was an error creating your flashcard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleSave
  };
}
