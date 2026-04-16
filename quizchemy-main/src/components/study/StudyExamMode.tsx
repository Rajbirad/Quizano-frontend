
import React from 'react';

import { Button } from '@/components/ui/button';
import { ExamSimulation } from '@/components/study/exam-simulation';
import { Flashcard } from '@/lib/types';

interface StudyExamModeProps {
  cards: Flashcard[];
  onExitExamMode: () => void;
  onComplete: (score: number, totalTime: number) => void;
}

export const StudyExamMode: React.FC<StudyExamModeProps> = ({
  cards,
  onExitExamMode,
  onComplete
}) => {
  return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Button
          variant="outline"
          className="mb-6"
          onClick={onExitExamMode}
        >
          Exit Exam Mode
        </Button>
        
        <ExamSimulation
          cards={cards}
          onComplete={onComplete}
          timeLimit={10} // 10 minutes
        />
      </div>
  );
};
