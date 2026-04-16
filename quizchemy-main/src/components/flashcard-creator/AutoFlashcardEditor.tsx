import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL, makeAuthenticatedJSONRequest } from '@/lib/api-utils';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FlashcardHeader } from './FlashcardHeader';
import { FlashcardFormsList } from './FlashcardFormsList';
import { CardActions } from './CardActions';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  format: string;
  difficulty: string;
  hint?: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  flashcards: Flashcard[];
  total_flashcards: number;
  difficulty_level: string;
  card_format: string;
  created_at: string;
}

interface AutoFlashcardEditorProps {
  flashcardSet: FlashcardSet;
}

export const AutoFlashcardEditor: React.FC<AutoFlashcardEditorProps> = ({ flashcardSet }) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(flashcardSet.title || '');
  const [selectedDeck, setSelectedDeck] = useState('');

  const [activeCards, setActiveCards] = useState<Set<string>>(
    new Set(flashcardSet.flashcards.map(card => card.id))
  );
  const [flashcardForms, setFlashcardForms] = useState(() =>
    flashcardSet.flashcards.map(card => {
      const cardAny = card as any; // Type assertion to access potentially existing media properties
      const frontMediaType = cardAny.frontMedia?.type || cardAny.front_media?.type || 'none';
      const backMediaType = cardAny.backMedia?.type || cardAny.back_media?.type || 'none';
      
      return {
        id: card.id,
        frontContent: card.front,
        backContent: card.back,
        hint: card.hint || '',
        frontMediaType: frontMediaType as 'none' | 'image' | 'video',
        frontMediaUrl: cardAny.frontMedia?.url || cardAny.front_media?.url || '',
        backMediaType: backMediaType as 'none' | 'image' | 'video',
        backMediaUrl: cardAny.backMedia?.url || cardAny.back_media?.url || ''
      };
    })
  );
  
  // Preview state
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleUpdateFormField = useCallback((id: string, field: string, value: string) => {
    setFlashcardForms(prevForms =>
      prevForms.map(form =>
        form.id === id ? { ...form, [field]: value } : form
      )
    );
  }, []);

  const handleMoveCard = (id: string, direction: 'up' | 'down') => {
    setFlashcardForms(prevForms => {
      const idx = prevForms.findIndex(f => f.id === id);
      if (idx === -1) return prevForms;
      const newForms = [...prevForms];
      if (direction === 'up' && idx > 0) {
        [newForms[idx - 1], newForms[idx]] = [newForms[idx], newForms[idx - 1]];
      } else if (direction === 'down' && idx < newForms.length - 1) {
        [newForms[idx + 1], newForms[idx]] = [newForms[idx], newForms[idx + 1]];
      }
      return newForms;
    });
  };

  const handleRemoveCard = (id: string) => {
    setActiveCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setFlashcardForms(prevForms => prevForms.filter(f => f.id !== id));
  };

  const handleResetCard = (id: string) => {
    setFlashcardForms(prevForms =>
      prevForms.map(form =>
        form.id === id
          ? { ...form, frontContent: '', backContent: '', hint: '' }
          : form
      )
    );
  };

  const handleSave = async () => {
    if (!session?.access_token) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update flashcards',
        variant: 'destructive',
      });
      return;
    }
    const validForms = flashcardForms.filter(
      form => form.frontContent.trim() && form.backContent.trim()
    );
    if (validForms.length === 0) {
      toast({
        title: 'No Content',
        description: 'Please add content to at least one flashcard',
        variant: 'destructive',
      });
      return;
    }
    const cards = validForms.map(form => {
      console.log('Processing form for card:', {
        id: form.id,
        frontMediaType: form.frontMediaType,
        frontMediaUrl: form.frontMediaUrl,
        backMediaType: form.backMediaType,
        backMediaUrl: form.backMediaUrl
      });
      
      return {
        id: form.id,
        front: form.frontContent.trim(),
        back: form.backContent.trim(),
        format: 'Question & Answer',
        difficulty: 'Standard',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hint: form.hint?.trim() || '',
        frontMedia: form.frontMediaType !== 'none' ? 
          { type: form.frontMediaType, url: form.frontMediaUrl } : undefined,
        backMedia: form.backMediaType !== 'none' ? 
          { type: form.backMediaType, url: form.backMediaUrl } : undefined
      };
    });

    const updatePayload = {
      title: title || flashcardSet.title || 'Untitled Flashcard Set',
      cards,
      flashcards: JSON.stringify(cards)
    };
    try {
      setSaving(true);
      console.log('Sending update payload:', updatePayload);

      const apiResponse = await makeAuthenticatedJSONRequest(
        `/api/flashcards/${flashcardSet.id}/cards`,
        updatePayload,
        'PUT'
      );

      console.log('API Response:', apiResponse);

      // Use the actual API response which contains the updated cards with media
      const previewData = {
        flashcardsData: apiResponse.success ? {
          ...apiResponse,
          data: {
            ...apiResponse.data,
            cards: apiResponse.data.updated_cards || cards.map(card => ({
              ...card,
              question: card.front,
              answer: card.back
            }))
          }
        } : {
          success: true,
          message: 'Flashcards updated successfully',
          data: {
            flashcard_set_id: flashcardSet.id,
            title: title || flashcardSet.title || 'Untitled Flashcard Set',
            cards: cards.map(card => ({
              ...card,
              question: card.front,
              answer: card.back
            }))
          }
        }
      };
      // Navigate to the preview page with the updated data
      navigate('/app/flashcard-preview', { 
        state: previewData,
        replace: true
      });
    } catch (error: any) {
      console.error('Error details:', error);
      let errorMessage = 'Failed to update flashcards. Please try again.';
      let shouldRedirect = false;

      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Could not connect to the server. Please check your internet connection.';
        } else if (error.message.includes('AbortError')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('empty response')) {
          errorMessage = 'Server returned an empty response. Please try again.';
        } else if (error.message.includes('Invalid JSON')) {
          errorMessage = 'Server returned an invalid response format. Please try again.';
        }
      }

      // Check response status if available
      if (error.status) {
        switch (error.status) {
          case 401:
            errorMessage = 'Your session has expired. Please log in again.';
            shouldRedirect = true;
            break;
          case 403:
            errorMessage = "You don't have permission to update these flashcards.";
            break;
          case 404:
            errorMessage = 'The flashcard set could not be found.';
            break;
          case 413:
            errorMessage = 'The flashcard set is too large. Please reduce the content size.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });

      if (shouldRedirect) {
        navigate('/auth');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && previewIndex > 0) {
      setPreviewIndex(prev => prev - 1);
      setIsFlipped(false);
    } else if (direction === 'next' && previewIndex < activeForms.length - 1) {
      setPreviewIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const activeForms = flashcardForms.filter(form => activeCards.has(form.id));
  const progressPercentage = ((previewIndex + 1) / activeForms.length) * 100;

  const handleAddCard = () => {
    const newCard = {
      id: crypto.randomUUID(),
      frontContent: '',
      backContent: '',
      hint: '',
      frontMediaType: 'none' as const,
      frontMediaUrl: '',
      backMediaType: 'none' as const,
      backMediaUrl: ''
    };
    setFlashcardForms(prev => [...prev, newCard]);
    setActiveCards(prev => new Set([...prev, newCard.id]));
  };

  const handleCardDeletion = React.useCallback((cardId: string) => {
    setActiveCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    });
  }, []);

  return (
    <div className="space-y-6">
      <FlashcardHeader 
        title={title}
        selectedDeck={selectedDeck}
        decks={[]}
        onTitleChange={setTitle}
        onDeckChange={setSelectedDeck}
      />
      
      <Tabs value="edit" className="w-full">
        <FlashcardFormsList 
          flashcardForms={flashcardForms.filter(form => activeCards.has(form.id))}
          handleUpdateFormField={handleUpdateFormField}
          handleMoveCard={handleMoveCard}
          handleRemoveCard={(cardId) => {
            handleCardDeletion(cardId);
            handleRemoveCard(cardId);
          }}
          handleResetCard={handleResetCard}
        />
      </Tabs>
      
      <CardActions 
        onSave={handleSave}
        onAddCard={handleAddCard}
        saving={saving}
        cardsCount={flashcardForms.length}
        saveLabel="Finish Editing"
      />
    </div>
  );
};
