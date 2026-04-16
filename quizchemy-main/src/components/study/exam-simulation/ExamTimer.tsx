
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Timer } from 'lucide-react';
import { ExamTimerProps } from './types';

export const ExamTimer: React.FC<ExamTimerProps> = ({ timeRemaining, timeProgress }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center text-amber-500">
      <Timer className="h-4 w-4 mr-1" />
      {formatTime(timeRemaining)}
    </div>
  );
};

export const ExamProgress: React.FC<{ 
  currentIndex: number, 
  totalQuestions: number,
  progress: number,
  timeProgress: number,
  timeRemaining: number
}> = ({
  currentIndex,
  totalQuestions,
  progress,
  timeProgress,
  timeRemaining
}) => {
  return (
    <div className="mb-4 space-y-1">
      <div className="flex justify-between text-sm mb-1">
        <span>Question {currentIndex + 1} of {totalQuestions}</span>
        <ExamTimer timeRemaining={timeRemaining} timeProgress={timeProgress} />
      </div>
      <Progress value={progress} className="h-1" />
      <Progress value={timeProgress} className="h-1 bg-muted" indicatorClassName="bg-amber-500" />
    </div>
  );
};
