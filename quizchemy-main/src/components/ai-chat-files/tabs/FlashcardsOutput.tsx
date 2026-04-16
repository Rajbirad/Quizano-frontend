
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookText } from 'lucide-react';
import { useFileContext } from '../FileContext';
import { useToast } from '@/hooks/use-toast';
import { generateFlashcards } from '../documentProcessor';

export const FlashcardsOutput: React.FC = () => {
  const { selectedFile } = useFileContext();
  const { toast } = useToast();
  const [flashcards, setFlashcards] = useState<{question: string, answer: string}[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const generateFlashcardsHandler = () => {
    if (!selectedFile) {
      toast({
        title: "No document selected",
        description: "Please upload and select a document first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const cards = generateFlashcards(selectedFile.content);
      setFlashcards(cards);
      setIsGenerating(false);
      setActiveCard(0);
      setShowAnswer(false);
      
      toast({
        title: "Flashcards generated",
        description: `Created ${cards.length} flashcards from your document`
      });
    }, 2000);
  };

  const handleNextCard = () => {
    if (flashcards && activeCard !== null) {
      const nextIndex = (activeCard + 1) % flashcards.length;
      setActiveCard(nextIndex);
      setShowAnswer(false);
    }
  };

  const handlePrevCard = () => {
    if (flashcards && activeCard !== null) {
      const prevIndex = (activeCard - 1 + flashcards.length) % flashcards.length;
      setActiveCard(prevIndex);
      setShowAnswer(false);
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-6 flex-1">
          <div className="animate-pulse flex space-x-2 mb-4">
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Generating flashcards...</p>
        </div>
      ) : flashcards && activeCard !== null ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-sm text-muted-foreground mb-2 text-center">
              Card {activeCard + 1} of {flashcards.length}
            </div>
            <div 
              className="border rounded-lg p-6 mb-4 min-h-[200px] flex items-center justify-center cursor-pointer shadow-sm"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <div className="text-center">
                {!showAnswer ? (
                  <p className="font-medium">{flashcards[activeCard].question}</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{flashcards[activeCard].question}</p>
                    <div className="border-t pt-3">
                      <p className="font-medium">{flashcards[activeCard].answer}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevCard}>Previous</Button>
              <Button variant="outline" onClick={() => setShowAnswer(!showAnswer)}>
                {showAnswer ? "Show Question" : "Show Answer"}
              </Button>
              <Button variant="outline" onClick={handleNextCard}>Next</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 max-w-md mx-auto">
          <BookText className="h-12 w-12 mx-auto text-primary/80 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Generate Flashcards</h3>
          <p className="text-muted-foreground mb-4">
            Create study materials from your document content automatically.
          </p>
          <Button onClick={generateFlashcardsHandler} className="mx-auto">
            Generate Flashcards
          </Button>
        </div>
      )}
    </div>
  );
};
