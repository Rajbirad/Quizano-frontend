
import React from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SplitScreenView } from '@/components/study/SplitScreenView';
import { Flashcard } from '@/lib/types';

interface StudySplitScreenProps {
  card: Flashcard;
  currentIndex: number;
  cardsLength: number;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  onToggleBookmark: (cardId: string) => void;
  isBookmarked: boolean;
  sessionProgress: number;
  onExitSplitScreen: () => void;
}

export const StudySplitScreen: React.FC<StudySplitScreenProps> = ({
  card,
  currentIndex,
  cardsLength,
  onNext,
  onPrevious,
  onRate,
  onToggleBookmark,
  isBookmarked,
  sessionProgress,
  onExitSplitScreen
}) => {
  // Sample notes and video URL (in a real app, this would come from a database)
  const sampleNotes = `
    <h2>Study Notes</h2>
    <p>These are supplementary notes to help with studying this concept.</p>
    <ul>
      <li>Key point 1: This is important to remember</li>
      <li>Key point 2: Don't forget this</li>
      <li>Key point 3: This will be on the test</li>
    </ul>
    <p>Additional details about this topic that might help with understanding...</p>
  `;

  const sampleVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
      <div className="container max-w-full mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onExitSplitScreen}
          >
            Back to Standard View
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {cardsLength}
            </span>
            <Progress value={sessionProgress} className="w-24 h-2" />
          </div>
        </div>
        
        <SplitScreenView
          card={card}
          notes={sampleNotes}
          videoUrl={sampleVideoUrl}
          onNext={onNext}
          onPrevious={onPrevious}
          onRate={(rating: 'easy' | 'medium' | 'hard') => onRate(card.id, rating)}
          isBookmarked={isBookmarked}
          onToggleBookmark={onToggleBookmark}
        />
      </div>
  );
};
