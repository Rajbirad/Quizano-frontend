
import React from 'react';

import { StudyHeader } from '@/components/study/StudyHeader';
import { Progress } from '@/components/ui/progress';
import { StudyModeSelector } from '@/components/study/StudyModeSelector';
import { StudyContent } from '@/components/study/StudyContent';
import { StudyExtraControls } from '@/components/study/StudyExtraControls';
import { Flashcard } from '@/lib/types';

interface StudyMainContentProps {
  deckId?: string;
  deckCards: Flashcard[];
  currentCards: Flashcard[];
  currentIndex: number;
  sessionProgress: number;
  sessionCompleted: boolean;
  masteryPercentage: number;
  studyMode: 'flashcard' | 'quiz' | 'stats';
  streak: number;
  xpPoints: number;
  earnedAchievement: string | null;
  bookmarkedCards: string[];
  showSpacedRepetition: boolean;
  onToggleFocusMode: () => void;
  onModeChange: (mode: 'flashcard' | 'quiz' | 'stats' | 'splitScreen' | 'exam') => void;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  onRestartSession: () => void;
  onToggleBookmark: (cardId: string) => void;
  onSplitScreenMode: () => void;
  onExamMode: () => void;
}

export const StudyMainContent: React.FC<StudyMainContentProps> = ({
  deckId,
  deckCards,
  currentCards,
  currentIndex,
  sessionProgress,
  sessionCompleted,
  masteryPercentage,
  studyMode,
  streak,
  xpPoints,
  earnedAchievement,
  bookmarkedCards,
  showSpacedRepetition,
  onToggleFocusMode,
  onModeChange,
  onNext,
  onPrevious,
  onRate,
  onRestartSession,
  onToggleBookmark,
  onSplitScreenMode,
  onExamMode
}) => {
  return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <StudyHeader 
          deckId={deckId} 
          deckCards={deckCards} 
          onBack={() => window.history.back()} 
          onToggleFocusMode={onToggleFocusMode}
          currentCards={currentCards}
          currentIndex={currentIndex}
          streak={streak}
          xpPoints={xpPoints}
        />
        
        {/* Progress section with proper spacing */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3 text-sm text-muted-foreground">
            <span className="font-medium">Progress</span>
            {currentCards.length > 0 && (
              <span className="font-medium">{currentIndex} of {currentCards.length} cards</span>
            )}
          </div>
          <Progress value={sessionProgress} className="h-2.5 w-full" />
        </div>

        {/* Study mode selector */}
        {!sessionCompleted && currentCards.length > 0 && (
          <div className="mb-8">
            <StudyModeSelector 
              activeMode={studyMode} 
              onModeChange={onModeChange} 
            />
          </div>
        )}
        
        {/* Extra controls for study modes - using grid for larger screens */}
        {!sessionCompleted && currentCards.length > 0 && currentIndex < currentCards.length && currentCards[currentIndex] && (
          <div className="mb-10">
            <StudyExtraControls
              currentCard={currentCards[currentIndex]}
              onSplitScreenMode={onSplitScreenMode}
              onExamMode={onExamMode}
            />
          </div>
        )}
        
        {/* Main content area with proper centering and spacing */}
        <div className="flex flex-col items-center justify-center mt-6">
          <StudyContent
            studyMode={studyMode}
            currentCards={currentCards}
            currentIndex={currentIndex} 
            sessionCompleted={sessionCompleted}
            masteryPercentage={masteryPercentage}
            streak={streak}
            xpPoints={xpPoints}
            earnedAchievement={earnedAchievement}
            bookmarkedCards={bookmarkedCards}
            onNext={onNext}
            onPrevious={onPrevious}
            onRate={onRate}
            onRestartSession={onRestartSession}
            onToggleBookmark={onToggleBookmark}
          />
        </div>
      </div>
  );
};
