
import React from 'react';
import { Tag, Star } from 'lucide-react';
import { CardMedia } from './CardMedia';
import { CardAudio } from './CardAudio';
import { Flashcard } from '@/lib/types';

interface CardFaceProps {
  card: Flashcard;
  isFlipped: boolean;
  isFront: boolean;
  cardType: 'fact' | 'concept' | 'definition' | 'problem';
  isBookmarked?: boolean;
  onToggleBookmark?: (cardId: string) => void;
  contentKey?: number;
}

export const CardFace: React.FC<CardFaceProps> = ({
  card,
  isFlipped,
  isFront,
  cardType,
  isBookmarked,
  onToggleBookmark,
  contentKey = 0,
}) => {
  // Get tag label based on card type
  const getTagLabel = () => {
    return cardType.charAt(0).toUpperCase() + cardType.slice(1);
  };

  // Show media based on the face and whether the card is flipped
  const mediaToShow = isFront ? card.frontMedia : card.backMedia;
  const shouldShowMedia = (isFront && !isFlipped && mediaToShow) || (!isFront && isFlipped && mediaToShow);
  
  // Determine if this face is active (front when not flipped, back when flipped)
  const isActive = (isFront && !isFlipped) || (!isFront && isFlipped);
  
  // Get the appropriate content based on whether this is the front or back face
  const cardContent = isFront ? card.question : card.answer;
  
  return (
    <div className={`p-6 sm:p-8 flex flex-col items-center justify-center w-full h-full ${!isFront ? 'overflow-y-auto' : ''}`}>
      <div className={`w-full h-full flex flex-col items-center justify-center ${isActive ? 'animate-fade-in' : ''}`} key={contentKey}>
        {/* Header section with tags and bookmark */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center w-full">
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full shadow-sm">
            {card.deckName}
          </span>
          
          <div className="flex items-center space-x-2">
            <span className={`flashcard-tag tag-${cardType} shadow-sm`}>
              <Tag className="h-3 w-3 mr-1 inline" />
              {getTagLabel()}
            </span>

            {/* Bookmark star - with improved styling */}
            {onToggleBookmark && (
              <button 
                className={`p-1.5 rounded-full transition-all duration-300 
                  ${isBookmarked 
                    ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/40'}`
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(card.id);
                }}
              >
                <Star className="h-5 w-5" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center px-6 py-4 mt-10 w-full max-w-xl h-full">
          {/* Media content with improved spacing */}
          {shouldShowMedia && <div className="mb-6 mt-2"><CardMedia media={mediaToShow} /></div>}
          
          {/* Label (QUESTION/ANSWER) */}
          <div className="mb-4 text-sm font-bold tracking-wider text-gray-900 dark:text-gray-100">
            {isFront ? 'QUESTION' : 'ANSWER'}
          </div>

          {/* Text content with improved typography and darker text */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-4 leading-relaxed text-gray-900 dark:text-gray-100">
            {cardContent}
          </h3>

          {/* Text-to-speech button */}
          <CardAudio text={cardContent} />
          
          {/* Hint (only on back) with improved styling */}
          {!isFront && card.hint && (
            <p className="mt-6 text-sm text-muted-foreground text-center bg-muted/30 p-3 rounded-lg">
              <span className="font-medium block mb-1">Hint:</span>
              {card.hint}
            </p>
          )}
          
          {/* Click to reveal prompt (only on front) with improved styling */}
          {isFront && (
            <div className="mt-auto mb-6 text-sm text-primary bg-primary/5 px-4 py-2 rounded-full animate-pulse shadow-sm">
              Click to reveal answer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
