
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Timer } from 'lucide-react';
import { ExamIntroProps } from './types';

export const ExamIntro: React.FC<ExamIntroProps> = ({ 
  timeLimit, 
  totalQuestions, 
  onStart 
}) => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Exam Simulation</CardTitle>
        <CardDescription>
          Test yourself with {totalQuestions} flashcards in exam conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-amber-500" />
          Time limit: {timeLimit} minutes
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4 text-amber-500" />
          Questions: {totalQuestions}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full">Start Exam</Button>
      </CardFooter>
    </Card>
  );
};
