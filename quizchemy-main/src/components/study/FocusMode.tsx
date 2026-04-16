
import React, { useState, useEffect } from 'react';
import { FlashcardComponent } from '@/components/FlashcardComponent';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/lib/types';
import { EyeOff, Star } from 'lucide-react';

interface FocusModeProps {
  card: Flashcard;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  progress: number;
  onExitFocusMode: () => void;
  onToggleBookmark: (cardId: string) => void;
  isBookmarked: boolean;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  card,
  onNext,
  onPrevious,
  onRate,
  progress,
  onExitFocusMode,
  onToggleBookmark,
  isBookmarked
}) => {
  const [showControls, setShowControls] = useState(false);
  
  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!showControls) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [showControls]);
  
  // Show controls on mouse movement
  const handleMouseMove = () => {
    setShowControls(true);
  };

  // Handle escape key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFocusMode]);

  return (
    <div 
      className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4"
      onMouseMove={handleMouseMove}
    >
      {/* Top bar with progress and exit button */}
      <div 
        className={`fixed top-0 left-0 right-0 p-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Progress value={progress} className="h-1 flex-1 mr-4" />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onToggleBookmark(card.id)}
              className={`bg-black/30 border-white/20 hover:bg-black/50 ${
                isBookmarked ? 'text-yellow-400' : 'text-white'
              }`}
            >
              <Star className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onExitFocusMode}
              className="bg-black/30 border-white/20 hover:bg-black/50"
            >
              <EyeOff className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Centered flashcard */}
      <div className="w-full max-w-5xl mx-auto transition-all duration-300 scale-[0.85] sm:scale-100">
        <FlashcardComponent
          card={card}
          onNext={onNext}
          onPrevious={onPrevious}
          onRate={onRate}
          showControls={showControls}
          isBookmarked={isBookmarked}
          onToggleBookmark={() => onToggleBookmark(card.id)}
        />
      </div>
      
      {/* Center overlay with instructions - shows briefly when entering focus mode */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/70 text-center animate-fade-out">
          <p>Move your cursor to show controls</p>
          <p className="text-sm">Press ESC or click the eye icon to exit Focus Mode</p>
        </div>
      </div>
    </div>
  );
};
