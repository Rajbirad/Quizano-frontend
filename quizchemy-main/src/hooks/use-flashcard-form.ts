import { useState } from 'react';
import { Flashcard } from '@/lib/types';
impo    setLoading(true);
    
    // Prepare media data if available
    const frontMedia = mediaType !== 'none' ? {
      type: mediaType as 'image' | 'video' | 'youtube',
      url: mediaUrl
    } : undefined;
    
    const newCard: Omit<Flashcard, 'id'> = {
      question,
      answer,
      hint: hint || undefined,
      deckId: deckId,
      deckName: '', // Will be set in the CreateFlashcard component
      createdAt: new Date(),
      lastReviewed: null,
      nextReview: new Date(),
      difficulty: 0.3,
      frontMediam '@/hooks/use-toast';
import { addFlashcard } from '@/lib/flashcard-store';

export function useFlashcardForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [inputText, setInputText] = useState('');
  const [deckId, setDeckId] = useState('general');
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  
  // Media states
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video' | 'youtube'>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const [previewCard, setPreviewCard] = useState<Flashcard | null>(null);

  const handleMediaChange = (type: 'none' | 'image' | 'video' | 'youtube', url: string) => {
    setMediaType(type);
    setMediaUrl(url);
    
    // Update preview if it exists
    if (previewCard) {
      if (type === 'none') {
        // If type is 'none', remove the media properties
        const updatedPreview = { ...previewCard };
        delete updatedPreview.frontMedia;
        delete updatedPreview.backMedia;
        setPreviewCard(updatedPreview);
      } else {
        // Otherwise, set the frontMedia property with the correct type
        setPreviewCard({
          ...previewCard,
          frontMedia: {
            type: type as 'image' | 'video' | 'youtube',
            url
          }
        });
      }
    }
  };
  
  const clearMedia = () => {
    setMediaType('none');
    setMediaUrl('');
    setYoutubeUrl('');
    
    // Update preview if it exists
    if (previewCard) {
      const updatedPreview = { ...previewCard };
      delete updatedPreview.frontMedia;
      delete updatedPreview.backMedia;
      setPreviewCard(updatedPreview);
    }
  };

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setHint('');
    setInputText('');
    clearMedia();
    setPreviewCard(null);
  };

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Incomplete flashcard",
        description: "Please provide both a question and an answer.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Prepare media data in the correct format
    const frontMedia = mediaType !== 'none' ? {
      type: mediaType as 'image' | 'video' | 'youtube',
      url: mediaUrl
    } : undefined;
    
    const newCard: Omit<Flashcard, 'id'> = {
      question,
      answer,
      hint: hint || undefined,
      deckId: deckId,
      deckName: '', // Will be set in the CreateFlashcard component
      createdAt: new Date(),
      lastReviewed: null,
      nextReview: new Date(),
      difficulty: 0.3,
      frontMedia
    };
    
    // Add card to store will be done in the component
    
    setLoading(false);
    
    return newCard;
  };

  return {
    loading,
    setLoading,
    generating,
    setGenerating,
    inputText,
    setInputText,
    deckId,
    setDeckId,
    question,
    setQuestion,
    answer,
    setAnswer,
    hint,
    setHint,
    mediaType,
    mediaUrl,
    youtubeUrl,
    setYoutubeUrl,
    previewCard,
    setPreviewCard,
    handleMediaChange,
    clearMedia,
    resetForm,
    handleSave
  };
}
