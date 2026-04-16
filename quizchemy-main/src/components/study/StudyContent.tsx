
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/lib/types';
import { FlashcardComponent } from '@/components/FlashcardComponent';
import { QuizMode } from '@/components/study/QuizMode';
import { StudyStats } from '@/components/study/StudyStats';
import { StudyCompletedCard } from '@/components/study/StudyCompletedCard';

interface StudyContentProps {
  studyMode: 'flashcard' | 'quiz' | 'stats';
  currentCards: Flashcard[];
  currentIndex: number;
  sessionCompleted: boolean;
  masteryPercentage: number;
  streak: number;
  xpPoints: number;
  earnedAchievement: string | null;
  bookmarkedCards: string[];
  onNext: () => void;
  onPrevious: () => void;
  onRate: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  onRestartSession: () => void;
  onToggleBookmark: (cardId: string) => void;
}

export const StudyContent: React.FC<StudyContentProps> = ({
  studyMode,
  currentCards,
  currentIndex,
  sessionCompleted,
  masteryPercentage,
  streak,
  xpPoints,
  earnedAchievement,
  bookmarkedCards,
  onNext,
  onPrevious,
  onRate,
  onRestartSession,
  onToggleBookmark
}) => {
  // No cards available
  if (currentCards.length === 0) {
    return (
      <Card className="w-full max-w-lg p-8 text-center shadow-lg border border-primary/20">
        <h3 className="text-xl font-semibold mb-4">No Cards Available</h3>
        <p className="text-muted-foreground mb-6">
          There are no cards to study right now. Try adding some new flashcards.
        </p>
        <Button 
          onClick={() => window.location.href = '/dashboard?tab=create'}
          className="px-6 shadow-sm hover:shadow-md transition-all duration-200"
        >
          Create Flashcards
        </Button>
      </Card>
    );
  }
  
  // Session completed
  if (sessionCompleted) {
    return (
      <StudyCompletedCard 
        cardCount={currentCards.length}
        onRestartSession={onRestartSession}
        xpEarned={currentCards.length * 5}
        masteryPercentage={masteryPercentage}
        achievement={earnedAchievement}
      />
    );
  }
  
  // Active study session with different modes
  return (
    <div className="w-full flex justify-center mb-10">
      {studyMode === 'flashcard' && currentIndex < currentCards.length && (
        <div className="animate-fade-in w-full">
          <FlashcardComponent
            card={currentCards[currentIndex]}
            onNext={onNext}
            onPrevious={onPrevious}
            onRate={onRate}
            isBookmarked={bookmarkedCards.includes(currentCards[currentIndex].id)}
            onToggleBookmark={() => onToggleBookmark(currentCards[currentIndex].id)}
          />
        </div>
      )}
      
      {studyMode === 'quiz' && currentIndex < currentCards.length && (
        <div className="animate-fade-in w-full">
          <QuizMode 
            card={currentCards[currentIndex]}
            onCorrectAnswer={() => onRate(currentCards[currentIndex].id, 'easy')}
            onIncorrectAnswer={() => onRate(currentCards[currentIndex].id, 'hard')}
            allCards={currentCards}
          />
        </div>
      )}
      
      {studyMode === 'stats' && (
        <div className="animate-fade-in w-full max-w-3xl">
          <StudyStats 
            cards={currentCards}
            masteryPercentage={masteryPercentage}
            streak={streak}
            xpPoints={xpPoints}
          />
        </div>
      )}
    </div>
  );
};
