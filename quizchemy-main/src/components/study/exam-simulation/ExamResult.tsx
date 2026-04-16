
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';
import { ExamResultProps } from './types';

export const ExamResult: React.FC<ExamResultProps> = ({
  score,
  totalTime,
  totalQuestions,
  answeredQuestions,
  onReview,
  onRetry
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Exam Completed
        </CardTitle>
        <CardDescription>
          You've completed the exam simulation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
          <div className="text-sm text-muted-foreground">
            Time taken: {formatTime(totalTime)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Questions:</span>
            <span>{totalQuestions}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Answered:</span>
            <span>{answeredQuestions}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button onClick={onReview} variant="outline" className="w-full">
          Review Answers
        </Button>
        <Button onClick={onRetry} className="w-full">
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};
