
import React, { useState, useEffect, useRef } from 'react';
import { Flashcard } from '@/lib/types';
import { CardFace } from './flashcard/CardFace';
import { CardControls } from './flashcard/CardControls';
import { determineCardType } from './flashcard/CardType';

interface FlashcardComponentProps {
  card: Flashcard;
  onNext: () => void;
  onPrevious: () => void;
  onRate?: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  showControls?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (cardId: string) => void;
}

export const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  card,
  onNext,
  onPrevious,
  onRate,
  showControls = true,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const cardType = determineCardType(card.question, card.answer);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Animation when card changes
  useEffect(() => {
    setIsMounted(true);
    // Reset to front face when card changes
    setIsFlipped(false);
    setContentKey(prev => prev + 1);
    
    return () => setIsMounted(false);
  }, [card.id]);

  const createParticles = () => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create particles container if it doesn't exist
    let container = document.getElementById('particle-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'particle-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '100';
      document.body.appendChild(container);
    }
    
    // Determine particle color based on card type
    let particleColor;
    switch (cardType) {
      case 'fact': particleColor = '180, 180, 250'; break;
      case 'concept': particleColor = '250, 180, 250'; break;
      case 'definition': particleColor = '180, 250, 180'; break;
      case 'problem': particleColor = '250, 220, 180'; break;
      default: particleColor = '200, 200, 250';
    }
    
    // Create particles
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random position around the center of the card
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = Math.random() * 20 + 30;
      const startX = centerX + Math.cos(angle) * (distance / 3);
      const startY = centerY + Math.sin(angle) * (distance / 3);
      
      // Random travel distance
      const tx = Math.cos(angle) * distance * (1 + Math.random() * 2);
      const ty = Math.sin(angle) * distance * (1 + Math.random() * 2);
      const rot = (Math.random() - 0.5) * 720;
      
      particle.style.setProperty('--particle-color', particleColor);
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.setProperty('--rot', `${rot}deg`);
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      container.appendChild(particle);
      
      // Remove particle after animation completes
      setTimeout(() => {
        if (container.contains(particle)) {
          container.removeChild(particle);
        }
        // Clean up container if empty
        if (container.childNodes.length === 0) {
          document.body.removeChild(container);
        }
      }, 800);
    }
  };

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    setContentKey(prev => prev + 1);
    
    // Create particle effect on flip
    createParticles();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const handleRate = (rating: 'easy' | 'medium' | 'hard') => {
    if (onRate) {
      onRate(card.id, rating);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrevious();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext();
  };

  // Get the appropriate card class based on type
  const getCardClass = () => {
    return `flashcard-${cardType}`;
  };

  return (
    <div className={`w-full max-w-3xl mx-auto transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'} no-scrollbar`}>
      {/* Card container with improved size and dimensions */}
      <div 
        className="w-full h-[400px] sm:h-[450px] md:h-[500px] perspective-1000 cursor-pointer hover:scale-[1.02] transition-all duration-300"
        onClick={handleFlip}
        ref={cardRef}
      >
        <div className={`flashcard ${isFlipped ? 'flipped' : ''} h-full`}>
          <div className={`flashcard-front glass-panel shadow-xl rounded-xl ${getCardClass()} h-full`}>
            <CardFace 
              card={card} 
              isFlipped={isFlipped} 
              isFront={true} 
              cardType={cardType} 
              isBookmarked={isBookmarked}
              onToggleBookmark={onToggleBookmark}
              contentKey={contentKey}
            />
          </div>
          
          <div className={`flashcard-back glass-panel shadow-xl rounded-xl ${getCardClass()} h-full`}>
            <CardFace 
              card={card} 
              isFlipped={isFlipped} 
              isFront={false} 
              cardType={cardType} 
              isBookmarked={isBookmarked}
              onToggleBookmark={onToggleBookmark}
              contentKey={contentKey}
            />
          </div>
        </div>
      </div>
      
      {/* Controls with improved spacing */}
      {showControls && (
        <CardControls 
          isFlipped={isFlipped}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onRate={isFlipped && onRate ? handleRate : undefined}
        />
      )}
    </div>
  );
};
