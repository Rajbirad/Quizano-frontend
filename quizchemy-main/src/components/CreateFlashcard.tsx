
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addFlashcard, useDecks } from '@/lib/flashcard-store';
import { FlashcardForm } from './flashcard/FlashcardForm';
import { FlashcardPreview } from './flashcard/FlashcardPreview';
import { useFlashcardForm } from '@/hooks/use-flashcard-form';
import { generateSubjectFlashcard } from '@/utils/flashcard-generator';

export const CreateFlashcard: React.FC = () => {
  const { toast } = useToast();
  const { decks } = useDecks();
  
  const {
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
  } = useFlashcardForm();
  
  const handleGenerate = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input text required",
        description: "Please enter some text to generate flashcards from.",
        variant: "destructive",
      });
      return;
    }
    
    setGenerating(true);
    
    // Get the current deck for subject-specific generation
    const selectedDeck = decks.find(d => d.id === deckId);
    
    // Simulate AI generation with subject-specific content
    setTimeout(() => {
      const { 
        generatedQuestion, 
        generatedAnswer, 
        generatedHint,
        previewCard 
      } = generateSubjectFlashcard(
        inputText, 
        deckId, 
        selectedDeck, 
        mediaType, 
        mediaUrl
      );
      
      setQuestion(generatedQuestion);
      setAnswer(generatedAnswer);
      setHint(generatedHint);
      setPreviewCard(previewCard);
      
      setGenerating(false);
    }, 1200);
  };
  
  const saveFlashcard = () => {
    const newCard = handleSave();
    if (newCard) {
      // Add deck name to the card
      const selectedDeck = decks.find(d => d.id === deckId);
      
      // Add card to store
      addFlashcard({
        ...newCard,
        deckName: selectedDeck?.name || 'General',
      });
      
      // Reset form
      resetForm();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-white/60 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>Create Flashcard</CardTitle>
          <CardDescription>
            Select a subject and enter text to generate specialized flashcards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlashcardForm 
            decks={decks}
            deckId={deckId}
            inputText={inputText}
            question={question}
            answer={answer}
            hint={hint}
            mediaType={mediaType}
            mediaUrl={mediaUrl}
            youtubeUrl={youtubeUrl}
            generating={generating}
            loading={loading}
            onDeckChange={setDeckId}
            onInputTextChange={setInputText}
            onQuestionChange={setQuestion}
            onAnswerChange={setAnswer}
            onHintChange={setHint}
            onMediaChange={handleMediaChange}
            onYoutubeUrlChange={setYoutubeUrl}
            onClearMedia={clearMedia}
            onGenerate={handleGenerate}
            onSave={saveFlashcard}
          />
        </CardContent>
      </Card>
      
      <FlashcardPreview previewCard={previewCard} />
    </div>
  );
};
