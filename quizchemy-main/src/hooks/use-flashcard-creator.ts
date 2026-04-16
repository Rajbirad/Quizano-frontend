import { useState, useEffect } from 'react';
import { Flashcard } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addFlashcard } from '@/lib/flashcard-store';

export function useFlashcardCreator(exampleFlashcards: Flashcard[]) {
  const [title, setTitle] = useState('');
  const [frontContent, setFrontContent] = useState('');
  const [backContent, setBackContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const { toast } = useToast();
  const [selectedDeck, setSelectedDeck] = useState('general');
  
  // Media state
  const [frontMediaType, setFrontMediaType] = useState<'none' | 'image' | 'video' | 'youtube'>('none');
  const [frontMediaUrl, setFrontMediaUrl] = useState('');
  const [backMediaType, setBackMediaType] = useState<'none' | 'image' | 'video' | 'youtube'>('none');
  const [backMediaUrl, setBackMediaUrl] = useState('');
  
  // State for storing created flashcards and card preview
  const [createdFlashcards, setCreatedFlashcards] = useState<Flashcard[]>(exampleFlashcards);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  
  // When switching to preview tab, reset the flipped state
  useEffect(() => {
    if (activeTab === 'preview') {
      setIsFlipped(false);
    }
  }, [activeTab]);
  
  const handleFrontMediaChange = (type: 'none' | 'image' | 'video' | 'youtube', url: string) => {
    setFrontMediaType(type);
    setFrontMediaUrl(url);
  };
  
  const handleBackMediaChange = (type: 'none' | 'image' | 'video' | 'youtube', url: string) => {
    setBackMediaType(type);
    setBackMediaUrl(url);
  };
  
  const handleClearFrontMedia = () => {
    setFrontMediaType('none');
    setFrontMediaUrl('');
  };
  
  const handleClearBackMedia = () => {
    setBackMediaType('none');
    setBackMediaUrl('');
  };
  
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
  
  const handleSave = (decks: Array<{ id: string; name: string }>, flashcard?: Partial<Flashcard>) => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your flashcard deck.",
        variant: "destructive",
      });
      return;
    }
    
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
    
    // Prepare media data for front if available
    const frontMedia = frontMediaType !== 'none' ? {
      type: frontMediaType as 'image' | 'video' | 'youtube',
      url: frontMediaUrl
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
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        difficulty: 0.5,
        media: frontMedia
      };
      
      addFlashcard(newFlashcard);
      
      // Add to local state for preview
      setCreatedFlashcards(prev => [...prev, newFlashcard]);
      
      // Switch to preview tab to show the newly created card
      setActiveTab('preview');
      setCurrentPreviewIndex(createdFlashcards.length);
      
      toast({
        title: "Flashcard created!",
        description: `Your flashcard "${title}" has been added to the ${selectedDeckObj?.name || 'General'} deck.`,
      });
      
      // Reset form
      setTitle('');
      setFrontContent('');
      setBackContent('');
      setFrontMediaType('none');
      setFrontMediaUrl('');
      setBackMediaType('none');
      setBackMediaUrl('');
      
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
    title,
    setTitle,
    frontContent,
    setFrontContent,
    backContent,
    setBackContent,
    saving,
    setSaving,
    activeTab,
    setActiveTab,
    selectedDeck,
    setSelectedDeck,
    frontMediaType,
    frontMediaUrl,
    backMediaType,
    backMediaUrl,
    createdFlashcards,
    isFlipped,
    currentPreviewIndex,
    handleFrontMediaChange,
    handleBackMediaChange,
    handleClearFrontMedia,
    handleClearBackMedia,
    handleFlipCard,
    navigatePreview,
    handleSave
  };
}
