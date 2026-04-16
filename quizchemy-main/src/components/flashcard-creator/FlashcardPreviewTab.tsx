
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flashcard } from '@/lib/types';
import { FlipHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FlashcardPreviewTabProps {
  flashcards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  onFlip: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
}

export const FlashcardPreviewTab: React.FC<FlashcardPreviewTabProps> = ({
  flashcards,
  currentIndex,
  isFlipped,
  onFlip,
  onNavigate
}) => {
  if (flashcards.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-50 rounded-lg flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-md">
          <h3 className="text-xl font-medium text-gray-700">No flashcards yet</h3>
          <p className="text-gray-500 max-w-md mt-2">
            Create your first flashcard using the Edit tab, then you'll be able to preview it here.
          </p>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = ((currentIndex + 1) / flashcards.length) * 100;

  // Get the display title
  const displayTitle = flashcards[currentIndex]?.id.startsWith('example') 
    ? 'Example Flashcard' 
    : (flashcards[currentIndex]?.title || 'My Flashcard');

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress through deck</span>
          <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
            {currentIndex + 1} of {flashcards.length} cards
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      {/* Navigation and flip controls */}
      <div className="flex justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('prev')}
          className="rounded-full bg-white/80 shadow-md hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onFlip}
          className="rounded-full bg-white/80 shadow-md hover:bg-white"
        >
          <FlipHorizontal className="h-4 w-4 mr-1" />
          Flip
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('next')}
          className="rounded-full bg-white/80 shadow-md hover:bg-white"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="perspective-1000 w-full h-[500px]">
        <div 
          className={`flashcard relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'flipped' : ''}`}
        >
          {/* Front Preview */}
          <Card className="flashcard-front absolute inset-0 backface-hidden p-6 flex flex-col items-center justify-center bg-white text-center">
            <div className="max-w-lg card-content">
              <span className="absolute top-3 left-3 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {flashcards[currentIndex]?.deckName || "General"}
              </span>
              
              <h3 className="text-xl font-semibold mb-4">
                {displayTitle}
              </h3>
              <div 
                className="prose"
                dangerouslySetInnerHTML={{ 
                  __html: flashcards[currentIndex]?.question || "Front content" 
                }} 
              />
              
              {flashcards[currentIndex]?.media?.type === 'image' && 
                flashcards[currentIndex]?.media?.url && (
                <div className="mt-4">
                  <img 
                    src={flashcards[currentIndex].media.url} 
                    alt="Front card media" 
                    className="max-h-48 rounded-md object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          </Card>
          
          {/* Back Preview */}
          <Card 
            className="flashcard-back absolute inset-0 backface-hidden p-6 flex flex-col items-center justify-center bg-white text-center"
          >
            <div className="max-w-lg card-content">
              <div 
                className="prose"
                dangerouslySetInnerHTML={{ 
                  __html: flashcards[currentIndex]?.answer || "Back content" 
                }} 
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
