
import React from 'react';
import { FocusMode } from '@/components/study/FocusMode';
import { Flashcard } from '@/lib/types';

interface StudyFocusModeProps {
  card: Flashcard;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  progress: number;
  onExitFocusMode: () => void;
  onToggleBookmark: (cardId: string) => void;
  isBookmarked: boolean;
}

export const StudyFocusMode: React.FC<StudyFocusModeProps> = ({
  card,
  onNext,
  onPrevious,
  onRate,
  progress,
  onExitFocusMode,
  onToggleBookmark,
  isBookmarked
}) => {
  return (
    <FocusMode
      card={card}
      onNext={onNext}
      onPrevious={onPrevious}
      onRate={(rating: 'easy' | 'medium' | 'hard') => onRate(card.id, rating)}
      progress={progress}
      onExitFocusMode={onExitFocusMode}
      onToggleBookmark={onToggleBookmark}
      isBookmarked={isBookmarked}
    />
  );
};
