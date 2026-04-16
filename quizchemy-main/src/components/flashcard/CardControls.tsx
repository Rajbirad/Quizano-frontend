
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';

interface CardControlsProps {
  isFlipped: boolean;
  onPrevious: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onRate?: (rating: 'easy' | 'medium' | 'hard') => void;
}

export const CardControls: React.FC<CardControlsProps> = ({
  isFlipped,
  onPrevious,
  onNext,
  onRate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center items-center">
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          className="rounded-full h-12 w-12 border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          className="rounded-full h-12 w-12 border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      
      {isFlipped && onRate && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-red-400 hover:bg-red-50 text-red-600 gap-1 transition-all duration-200 hover:shadow-md font-medium"
            onClick={() => onRate('hard')}
          >
            <ThumbsDown className="h-4 w-4" />
            Hard
          </Button>
          
          <Button
            variant="outline"
            className="border-orange-400 hover:bg-orange-50 text-orange-600 gap-1 transition-all duration-200 hover:shadow-md font-medium"
            onClick={() => onRate('medium')}
          >
            OK
          </Button>
          
          <Button
            variant="outline"
            className="border-green-400 hover:bg-green-50 text-green-600 gap-1 transition-all duration-200 hover:shadow-md font-medium"
            onClick={() => onRate('easy')}
          >
            <ThumbsUp className="h-4 w-4" />
            Easy
          </Button>
        </div>
      )}
    </div>
  );
};
