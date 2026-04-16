
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flashcard } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Timer, Calendar, Brain, BarChart } from 'lucide-react';

interface SpacedRepetitionControlsProps {
  flashcard: Flashcard;
  onRate: (rating: 'easy' | 'medium' | 'hard') => void;
  disabled?: boolean;
}

export const SpacedRepetitionControls: React.FC<SpacedRepetitionControlsProps> = ({
  flashcard,
  onRate,
  disabled = false
}) => {
  // Calculate difficulty percentage (0.1 to 1.0 scale to 10% to 100%)
  const difficultyPercentage = Math.round(flashcard.difficulty * 100);
  
  // Get next review date display
  const getNextReviewText = () => {
    if (!flashcard.nextReview) return 'Not scheduled';
    
    const nextReview = new Date(flashcard.nextReview);
    if (nextReview <= new Date()) return 'Due now';
    
    return formatDistanceToNow(nextReview, { addSuffix: true });
  };

  return (
    <Card className="border border-primary/20 shadow-md bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Spaced Repetition
        </CardTitle>
        <CardDescription>Rate how well you know this card</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="h-16 transition-all duration-200 border-red-300 hover:bg-red-50 hover:text-red-600 text-red-500 font-normal hover:scale-105 hover:shadow-md"
            onClick={() => onRate('hard')}
            disabled={disabled}
          >
            Again
            <span className="text-xs block text-red-400">Hard</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 transition-all duration-200 border-yellow-300 hover:bg-yellow-50 hover:text-yellow-600 text-yellow-500 font-normal hover:scale-105 hover:shadow-md"
            onClick={() => onRate('medium')}
            disabled={disabled}
          >
            Good
            <span className="text-xs block text-yellow-400">Medium</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 transition-all duration-200 border-green-300 hover:bg-green-50 hover:text-green-600 text-green-500 font-normal hover:scale-105 hover:shadow-md"
            onClick={() => onRate('easy')}
            disabled={disabled}
          >
            Easy
            <span className="text-xs block text-green-400">Known</span>
          </Button>
        </div>
        
        <div className="space-y-3 pt-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Timer className="h-3 w-3" />
              Next review:
            </span>
            <span className="font-medium">{getNextReviewText()}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <BarChart className="h-3 w-3" />
                Difficulty:
              </span>
              <span className="text-xs font-semibold">
                {difficultyPercentage < 30 ? (
                  <span className="text-green-500">Easy</span>
                ) : difficultyPercentage < 70 ? (
                  <span className="text-yellow-500">Medium</span>
                ) : (
                  <span className="text-red-500">Hard</span>
                )}
              </span>
            </div>
            <Progress 
              value={100 - difficultyPercentage} 
              className="h-2"
              color={
                difficultyPercentage < 30 
                  ? "bg-green-500" 
                  : difficultyPercentage < 70 
                    ? "bg-yellow-500" 
                    : "bg-red-500"
              }
            />
          </div>
          
          {flashcard.reviewHistory && flashcard.reviewHistory.length > 0 && (
            <div className="text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {flashcard.reviewHistory.length} review{flashcard.reviewHistory.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
