
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Star } from 'lucide-react';

interface StudyCompletedCardProps {
  cardCount: number;
  xpEarned: number;
  masteryPercentage: number;
  achievement: string | null;
  onRestartSession: () => void;
}

export const StudyCompletedCard: React.FC<StudyCompletedCardProps> = ({
  cardCount,
  xpEarned,
  masteryPercentage,
  achievement,
  onRestartSession
}) => {
  return (
    <Card className="w-full max-w-md p-8 text-center shadow-md">
      <div className="mb-4">
        <div className="flex justify-center mb-2">
          <Trophy className="h-12 w-12 text-amber-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Session Completed!</h3>
        <p className="text-muted-foreground mb-6">
          Great job finishing your study session. You reviewed {cardCount} cards.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <Zap className="h-6 w-6 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">+{xpEarned} XP</p>
          <p className="text-xs text-muted-foreground">Experience Points</p>
        </div>
        
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
          <Star className="h-6 w-6 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">{masteryPercentage}%</p>
          <p className="text-xs text-muted-foreground">Mastery Level</p>
        </div>
      </div>
      
      {achievement && (
        <div className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-md">
          <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">Achievement Unlocked!</span>
          </div>
          <p className="mt-1 text-amber-700 dark:text-amber-300">{achievement}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRestartSession}>
          Restart Session
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
          Return to Dashboard
        </Button>
      </div>
    </Card>
  );
};
