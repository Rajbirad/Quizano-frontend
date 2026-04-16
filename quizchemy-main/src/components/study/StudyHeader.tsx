
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Eye, EyeOff, Trophy, Zap } from 'lucide-react';
import { Flashcard } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StudyHeaderProps {
  deckId?: string;
  deckCards: Flashcard[];
  currentCards: Flashcard[];
  currentIndex: number;
  streak: number;
  xpPoints: number;
  onBack: () => void;
  onToggleFocusMode: () => void;
}

export const StudyHeader: React.FC<StudyHeaderProps> = ({
  deckId,
  deckCards,
  currentCards,
  currentIndex,
  streak,
  xpPoints,
  onBack,
  onToggleFocusMode
}) => {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b">
      <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-1">
        <ChevronLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>
      
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-center">
          {deckId 
            ? `Studying: ${deckCards[0]?.deckName || 'Deck'}`
            : 'Study Session'
          }
        </h1>
        
        <div className="flex items-center gap-3 mt-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-amber-500">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">{streak} day streak</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your daily study streak!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-blue-500">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">{xpPoints} XP</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Experience points earned from studying</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="w-[88px] flex justify-end">
        {currentCards.length > 0 && currentIndex < currentCards.length && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onToggleFocusMode}
            title="Toggle Focus Mode"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
