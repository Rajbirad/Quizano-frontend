
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AutoFlashcardEditor } from '@/components/flashcard-creator/AutoFlashcardEditor';

const EditGeneratedFlashcardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract flashcards from the API response structure
  const { flashcardsData } = location.state || {};

  const generatedFlashcards = React.useMemo(() => {
    let flashcards = [];
    
    // Handle different response structures
    if (flashcardsData?.flashcard_set?.flashcard_set?.flashcards) {
      // Cached response structure (nested flashcard_set)
      flashcards = flashcardsData.flashcard_set.flashcard_set.flashcards;
    } else if (flashcardsData?.flashcard_set?.flashcards) {
      // Initial generation response structure
      flashcards = flashcardsData.flashcard_set.flashcards;
    } else if (flashcardsData?.flashcards) {
      // Direct flashcards array
      flashcards = flashcardsData.flashcards;
    } else if (flashcardsData?.data?.updated_cards) {
      // Updated cards from finish editing
      flashcards = flashcardsData.data.updated_cards;
    } else {
      console.error('Invalid flashcard data structure:', flashcardsData);
      return [];
    }
    
    // Transform API response to match editor format
    return flashcards.map(card => ({
      id: card.id,
      frontContent: card.front,
      backContent: card.back,
      hint: card.hint || '',
      format: card.format,
      difficulty: card.difficulty,
      // Handle media data if present
      frontMediaType: card.frontMedia?.type || 'none',
      frontMediaUrl: card.frontMedia?.url || '',
      backMediaType: card.backMedia?.type || 'none',
      backMediaUrl: card.backMedia?.url || ''
    }));
  }, [flashcardsData]);

  React.useEffect(() => {
    console.log('EditGeneratedFlashcardPage received:', {
      locationState: location.state,
      flashcardsData,
      processedFlashcards: generatedFlashcards
    });
    
    // Check if we have valid flashcard data in any of the expected structures
    const hasValidData = flashcardsData && (
      flashcardsData.flashcard_set?.flashcard_set?.flashcards ||
      flashcardsData.flashcard_set?.flashcards ||
      flashcardsData.flashcards ||
      flashcardsData.data?.updated_cards
    );
    
    if (!location.state || !hasValidData) {
      console.error('Missing or invalid data:', {
        locationState: location.state,
        flashcardsData,
        flashcards: generatedFlashcards
      });
      navigate('/app/generator');
      return;
    }
  }, [location.state, flashcardsData, generatedFlashcards, navigate]);

  // Normalize flashcardSet structure to handle cached vs non-cached responses
  const flashcardSet = React.useMemo(() => {
    if (flashcardsData?.flashcard_set?.flashcard_set) {
      // Cached response - flashcard_set is nested
      return flashcardsData.flashcard_set.flashcard_set;
    }
    // Non-cached response - flashcard_set is direct
    return flashcardsData?.flashcard_set;
  }, [flashcardsData]);

  // Render AutoFlashcardEditor for editing generated flashcards
  return (
    <AutoFlashcardEditor flashcardSet={flashcardSet} />
  );
};

export default EditGeneratedFlashcardPage;
