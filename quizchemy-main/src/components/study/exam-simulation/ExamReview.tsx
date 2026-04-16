
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExamReviewProps } from './types';

export const ExamReview: React.FC<ExamReviewProps> = ({
  cards,
  currentIndex,
  answers,
  score,
  onNext,
  onPrevious
}) => {
  // Progress percentage
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 space-y-1">
        <div className="flex justify-between text-sm mb-1">
          <span>Review Mode: Question {currentIndex + 1} of {cards.length}</span>
          <span>Score: {score}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Question:</h3>
              <div className="p-3 bg-muted/30 rounded">
                {currentCard.question}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Answer:</h3>
              <div className="p-3 bg-muted/30 rounded">
                {currentCard.answer}
              </div>
            </div>
            
            {answers[currentCard.id] && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Your Answer:</h3>
                <div className="p-3 bg-muted/30 rounded">
                  {answers[currentCard.id]}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button 
            onClick={onPrevious} 
            disabled={currentIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          <Button 
            onClick={onNext} 
            disabled={currentIndex === cards.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
