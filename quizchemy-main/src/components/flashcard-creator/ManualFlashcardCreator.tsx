
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useDecks } from '@/lib/flashcard-store';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard } from '@/lib/types';
import { FlashcardHeader } from './FlashcardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { FlashcardPreviewTab } from './FlashcardPreviewTab';
import { useFlashcardPreview } from '@/hooks/use-flashcard-preview';
import { useFlashcardEditor } from '@/hooks/use-flashcard-editor';
import { useFlashcardSave } from '@/hooks/use-flashcard-save';
import { PreviewTabSelector } from './PreviewTabSelector';
import { CardActions } from './CardActions';
import { useFlashcardForms } from '@/hooks/use-flashcard-forms';
import { FlashcardFormsList } from './FlashcardFormsList';
import { useToast } from '@/hooks/use-toast';

interface FlashcardResponse {
  id: string;
  title: string;
  cards: Array<{
    id: string;
    front: string;
    back: string;
    hint?: string;
    difficulty?: string;
    created_at?: string;
    frontMedia?: {
      type: 'image' | 'video' | 'youtube';
      url: string;
    };
    backMedia?: {
      type: 'image' | 'video' | 'youtube';
      url: string;
    };
  }>;
}

interface FlashcardSet {
  id: string;
  title: string;
  flashcards: any[];
  total_flashcards: number;
  difficulty_level: string;
  card_format: string;
  created_at: string;
}

interface ManualFlashcardCreatorProps {
  initialFlashcards?: any[];
  saveLabel?: string;
}

// Using Flashcard type from @/lib/types

export const ManualFlashcardCreator: React.FC<ManualFlashcardCreatorProps> = ({ 
  initialFlashcards = [], 
  saveLabel = "Save" 
}) => {
  // Initialize all hooks at the top
  const navigate = useNavigate();
  const { decks } = useDecks();
  const { user, session } = useAuth();
  const { toast } = useToast();

  // State for validation messages
  const [validationMessage, setValidationMessage] = React.useState<{ type: 'error' | 'success' | null; message: string | null }>({
    type: null,
    message: null
  });

  // Keep track of original cards and their states
  const [activeCards, setActiveCards] = React.useState<Set<string>>(
    new Set(initialFlashcards.map(card => card.id))
  );  React.useEffect(() => {
    // Check authentication on mount
    if (!user || !session?.access_token) {
      navigate('/auth');
    }
  }, [user, session, navigate]);

  // Manual creation only: no edit mode, no flashcardSet
  
  // Handle card deletion
  const handleCardDeletion = React.useCallback((cardId: string) => {
    setActiveCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    });
  }, []);

  // Use our refactored hooks
  const {
    createdFlashcards,
    setCreatedFlashcards,
    isFlipped,
    currentPreviewIndex,
    setCurrentPreviewIndex,
    handleFlipCard,
    navigatePreview
  } = useFlashcardPreview(initialFlashcards || []);

  const {
    title,
    setTitle,
    activeTab,
    setActiveTab,
    selectedDeck,
    setSelectedDeck,
  } = useFlashcardEditor();

  const {
    saving,
    handleSave
  } = useFlashcardSave(setCreatedFlashcards, setActiveTab, setCurrentPreviewIndex);

  // Test the API connection on component mount
  React.useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch('/api/flashcards/create', {
          method: 'OPTIONS',
          headers: {
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type,authorization'
          }
        });
        console.log('CORS preflight response:', {
          ok: response.ok,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (error) {
        console.error('API connection test failed:', error);
      }
    }
    testConnection();
  }, []);

  // Use our forms management hook, initialize with initialFlashcards if provided
  const {
    flashcardForms = [],
    handleAddForm,
    handleRemoveForm,
    handleMoveForm,
    handleResetForm,
    handleUpdateFormField: updateFormField
  } = useFlashcardForms(
    initialFlashcards?.length > 0 
      ? initialFlashcards.map(card => ({
          id: card.id,
          frontContent: card.front || card.frontContent || '',  // Prioritize front over frontContent
          backContent: card.back || card.backContent || '',     // Prioritize back over backContent
          hint: card.hint || '',
          frontMediaType: 'none',
          frontMediaUrl: '',
          backMediaType: 'none',
          backMediaUrl: ''
        }))
      : []
  );

  // Adapt the updateFormField function to match the expected interface
  const handleUpdateFormField = React.useCallback((id: string, field: string, value: string) => {
    const form = flashcardForms.find(f => f.id === id);
    if (form) {
      updateFormField(form, field, value);
    }
  }, [flashcardForms, updateFormField]);

  const handleAddCard = () => {
    const newForm = handleAddForm();
    setActiveCards(prev => new Set([...prev, newForm.id]));
  };
  const handleRemoveCard = handleRemoveForm;
  const handleMoveCard = handleMoveForm;
  const handleResetCard = handleResetForm;

  const handleCreateAllCards = async () => {
    if (!session?.access_token) {
      setValidationMessage({
        type: 'error',
        message: 'You must be logged in to create flashcards'
      });
      return;
    }

    // Get all valid forms
    const validForms = flashcardForms.filter(
      form => form.frontContent.trim() && form.backContent.trim()
    );

    if (validForms.length === 0) {
      // Don't proceed - button will be disabled, so this won't even execute
      return;
    }

    let loadingToastId: ReturnType<typeof setTimeout>;

    try {
      // Show loading state
      loadingToastId = setTimeout(() => {
        toast({
          title: "Creating Flashcards",
          description: "Please wait while we process your request...",
          variant: "default",
        });
      }, 1000);

      // First, upload any images that haven't been uploaded yet
      const uploadMedia = async (mediaType: string, mediaUrl: string) => {
        if (mediaType === 'image' && mediaUrl.startsWith('blob:')) {
          const file = await fetch(mediaUrl).then(r => r.blob());
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            },
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const data = await response.json();
          return data.url;
        }
        return mediaUrl;
      };

      // Process all cards and upload images
      const processedCards = await Promise.all(validForms.map(async form => {
        const frontMediaUrl = form.frontMediaType !== 'none' 
          ? await uploadMedia(form.frontMediaType, form.frontMediaUrl)
          : undefined;
        
        const backMediaUrl = form.backMediaType !== 'none'
          ? await uploadMedia(form.backMediaType, form.backMediaUrl)
          : undefined;

        return {
          front: form.frontContent.trim(),
          back: form.backContent.trim(),
          frontMedia: form.frontMediaType !== 'none' ? {
            type: form.frontMediaType,
            url: frontMediaUrl
          } : undefined,
          backMedia: form.backMediaType !== 'none' ? {
            type: form.backMediaType,
            url: backMediaUrl
          } : undefined
        };
      }));

      // Create payload
      const createPayload = {
        title: title || "Untitled Flashcard Set",
        cards: processedCards
      };

      console.log('Creating new flashcards:', createPayload);

      // Make the request through Vite's proxy
      const url = '/api/flashcards/create';
      console.log('Creating flashcards with payload:', {
        url,
        payload: createPayload,
        token: session.access_token
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(createPayload)
      });

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('Server response:', responseData);
        
        if (response.ok && responseData.success) {
          // Clear the loading toast
          if (loadingToastId) clearTimeout(loadingToastId);
          
          toast({
            title: "Success",
            description: responseData.message || "Flashcards created successfully!",
            variant: "default",
          });

          // Navigate to preview with the response data directly
          navigate('/app/flashcard-preview', { 
            state: { 
              flashcardsData: responseData  // Pass the complete API response
            } 
          });
          return;
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        console.error('Server error:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(responseData?.message || `Server error: ${response.status}`);
      }

      console.log('Server response:', responseData);
      console.log('Server response:', responseData);

      toast({
        title: "Success",
        description: "Flashcards created successfully!",
        variant: "default",
      });

      // Pass the API response directly as flashcardsData
      const previewData = {
        flashcardsData: {
          success: true,
          message: "Flashcards created successfully",
          data: {
            flashcard_set_id: responseData.id.replace('flashcard_', ''), // Remove prefix for Supabase
            title: responseData.title || 'Untitled Flashcard Set',
            cards: (responseData.cards || []).map(card => ({
              id: card.id,
              front: card.front,
              back: card.back,
              hint: card.hint || '',
              difficulty: card.difficulty || 'Standard',
              created_at: card.created_at || new Date().toISOString(),
              frontMedia: card.frontMedia,
              backMedia: card.backMedia
            }))
          }
        }
      };

      navigate('/app/flashcard-preview', { state: previewData });
    } catch (error: any) {
      console.error('Error creating flashcards:', error);
      let errorMessage = "Failed to create flashcards. Please try again.";
      if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        errorMessage = "Could not connect to the server. Please check your internet connection.";
      } else if (error.message?.includes('AbortError')) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
        navigate('/auth');
      } else if (error.status === 403) {
        errorMessage = "You don't have permission to create flashcards.";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (loadingToastId) {
        clearTimeout(loadingToastId);
      }
    }
  };

  return (
    <div className="space-y-6">
      {validationMessage.message && (
        <div 
          className={`p-4 rounded-lg text-sm ${
            validationMessage.type === 'error' 
              ? 'bg-destructive/10 text-destructive border border-destructive/20' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {validationMessage.message}
        </div>
      )}
      <FlashcardHeader 
        title={title}
        selectedDeck={selectedDeck}
        decks={decks}
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
        onSave={handleCreateAllCards} 
        onAddCard={handleAddCard}
        saving={saving} 
        cardsCount={flashcardForms?.length || 0}
        saveLabel={saveLabel}
        isDisabled={!flashcardForms.some(form => form.frontContent.trim() && form.backContent.trim())}
      />
    </div>
  );
};
