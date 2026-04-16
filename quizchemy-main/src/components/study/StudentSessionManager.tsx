
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Flashcard } from '@/lib/types';
import { getDueCards } from '@/lib/spaced-repetition';
import { rateCard } from '@/lib/flashcard-store';

interface StudentSessionManagerProps {
  deckId?: string;
  deckCards: Flashcard[];
  flashcards: Flashcard[];
  children: (sessionProps: {
    currentCards: Flashcard[];
    currentIndex: number;
    sessionProgress: number;
    sessionCompleted: boolean;
    handleNext: () => void;
    handlePrevious: () => void;
    handleRate: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
    handleRestartSession: () => void;
    masteryPercentage: number;
  }) => React.ReactNode;
}

export const StudentSessionManager: React.FC<StudentSessionManagerProps> = ({
  deckId,
  deckCards,
  flashcards,
  children
}) => {
  const { toast } = useToast();
  
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [masteryPercentage, setMasteryPercentage] = useState(0);
  const [xpPoints, setXpPoints] = useState(0);
  const [earnedAchievement, setEarnedAchievement] = useState<string | null>(null);
  
  // Set up cards to study
  useEffect(() => {
    // Get due cards from the appropriate source
    const cardsToUse = deckId ? deckCards : flashcards;
    const dueCards = getDueCards(cardsToUse);
    
    // If no due cards, use all cards
    const selectedCards = dueCards.length > 0 ? dueCards : cardsToUse;
    
    // Shuffle the cards
    const shuffled = [...selectedCards].sort(() => Math.random() - 0.5);
    
    // Limit session to max 15 cards
    const sessionCards = shuffled.slice(0, 15);
    
    setCurrentCards(sessionCards);
    setCurrentIndex(0);
    setSessionProgress(0);
    setSessionCompleted(false);
  }, [deckId, deckCards, flashcards]);
  
  // Calculate progress
  useEffect(() => {
    if (currentCards.length === 0) return;
    
    const progress = (currentIndex / currentCards.length) * 100;
    setSessionProgress(progress);
    
    if (currentIndex >= currentCards.length && !sessionCompleted) {
      setSessionCompleted(true);
      
      // Update XP points after session completion
      const newXP = xpPoints + (currentCards.length * 5);
      setXpPoints(newXP);
      localStorage.setItem('studyXP', JSON.stringify(newXP));
      
      // Check for XP achievements
      if (newXP >= 100 && xpPoints < 100) {
        setEarnedAchievement('XP Master!');
        toast({
          title: "Achievement Unlocked!",
          description: "XP Master! You earned 100+ XP points! 🏆",
        });
      }
      
      toast({
        title: "Session Completed!",
        description: "Great job finishing your study session.",
      });
    }
    
    // Calculate mastery percentage
    const masteredCards = currentCards.filter(card => card.difficulty < 0.3).length;
    const newMasteryPercentage = Math.round((masteredCards / currentCards.length) * 100);
    setMasteryPercentage(newMasteryPercentage);
    
    // Check for mastery achievements
    if (newMasteryPercentage >= 80 && masteryPercentage < 80) {
      setEarnedAchievement('Mastery Level Achieved!');
      toast({
        title: "Achievement Unlocked!",
        description: "Mastery Level Achieved! 80%+ content mastered! ⭐",
      });
    }
  }, [currentIndex, currentCards.length, sessionCompleted, toast, xpPoints, masteryPercentage]);
  
  const handleNext = () => {
    if (currentIndex < currentCards.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleRate = (cardId: string, rating: 'easy' | 'medium' | 'hard') => {
    rateCard(cardId, rating);
    
    // Add XP based on rating
    let pointsEarned = 0;
    switch(rating) {
      case 'easy':
        pointsEarned = 5;
        break;
      case 'medium':
        pointsEarned = 3;
        break;
      case 'hard':
        pointsEarned = 1;
        break;
    }
    
    const newXP = xpPoints + pointsEarned;
    setXpPoints(newXP);
    localStorage.setItem('studyXP', JSON.stringify(newXP));
    
    handleNext();
  };
  
  const handleRestartSession = () => {
    // Shuffle the cards again
    const shuffled = [...currentCards].sort(() => Math.random() - 0.5);
    setCurrentCards(shuffled);
    setCurrentIndex(0);
    setSessionProgress(0);
    setSessionCompleted(false);
  };

  return children({
    currentCards,
    currentIndex,
    sessionProgress,
    sessionCompleted,
    handleNext,
    handlePrevious,
    handleRate,
    handleRestartSession,
    masteryPercentage
  });
};
