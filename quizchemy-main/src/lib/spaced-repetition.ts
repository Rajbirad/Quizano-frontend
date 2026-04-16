
import { Difficulty, ReviewResult, SpacedRepetitionStats } from './types';

// Constants for algorithm
const MINIMUM_INTERVAL = 1; // Minimum interval in days
const EASY_INTERVAL_MULTIPLIER = 2.5;
const MEDIUM_INTERVAL_MULTIPLIER = 1.5;
const HARD_INTERVAL_MULTIPLIER = 1.2;

const EASY_DIFFICULTY_CHANGE = -0.15; // Make easier
const MEDIUM_DIFFICULTY_CHANGE = 0;
const HARD_DIFFICULTY_CHANGE = 0.15; // Make harder

// Forgetting curve parameters
const MEMORY_STRENGTH_FACTOR = 1.3; // Higher value means stronger memory retention

export const calculateNextReview = (
  rating: 'easy' | 'medium' | 'hard',
  currentDifficulty: Difficulty,
  lastReviewDate: Date | null
): ReviewResult => {
  // Clamp difficulty between 0.1 and 1.0
  let difficulty = Math.max(0.1, Math.min(1.0, currentDifficulty));
  
  // Calculate interval multiplier based on rating
  let intervalMultiplier = 1;
  let difficultyChange = 0;
  
  switch (rating) {
    case 'easy':
      intervalMultiplier = EASY_INTERVAL_MULTIPLIER;
      difficultyChange = EASY_DIFFICULTY_CHANGE;
      break;
    case 'medium':
      intervalMultiplier = MEDIUM_INTERVAL_MULTIPLIER;
      difficultyChange = MEDIUM_DIFFICULTY_CHANGE;
      break;
    case 'hard':
      intervalMultiplier = HARD_INTERVAL_MULTIPLIER;
      difficultyChange = HARD_DIFFICULTY_CHANGE;
      break;
  }
  
  // Update difficulty
  const newDifficulty = Math.max(0.1, Math.min(1.0, difficulty + difficultyChange));
  
  // Calculate days since last review (if available)
  const daysSinceLastReview = lastReviewDate 
    ? Math.max(1, Math.ceil((new Date().getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24))) 
    : 1;

  // Enhanced interval calculation using forgetting curve principles
  // Higher difficulty = shorter intervals, previous successful reviews = longer intervals
  const difficultyFactor = 1 + 4 * (1 - newDifficulty); 
  const memoryStrengthBonus = lastReviewDate ? Math.log(daysSinceLastReview + 1) * MEMORY_STRENGTH_FACTOR : 1;
  
  // Calculate interval (in days)
  const interval = Math.max(
    MINIMUM_INTERVAL,
    difficultyFactor * intervalMultiplier * memoryStrengthBonus
  );
  
  // Calculate next review date
  const now = new Date();
  const nextReviewDate = new Date();
  nextReviewDate.setDate(now.getDate() + Math.round(interval));
  
  return {
    nextReviewDate,
    newDifficulty,
    interval: Math.round(interval), // Return the interval for stats tracking
  };
};

export const getDueCards = (cards: any[], date: Date = new Date()) => {
  return cards.filter(card => {
    if (!card.nextReview) return true;
    const nextReview = new Date(card.nextReview);
    return nextReview <= date;
  });
};

export const calculateSpacedRepetitionStats = (cards: any[]): SpacedRepetitionStats => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  
  const nextWeekStart = new Date(todayStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  
  const dueToday = cards.filter(card => {
    if (!card.nextReview) return true;
    const nextReview = new Date(card.nextReview);
    return nextReview <= now;
  }).length;
  
  const dueTomorrow = cards.filter(card => {
    if (!card.nextReview) return false;
    const nextReview = new Date(card.nextReview);
    return nextReview > todayStart && nextReview <= tomorrowStart;
  }).length;
  
  const dueNextWeek = cards.filter(card => {
    if (!card.nextReview) return false;
    const nextReview = new Date(card.nextReview);
    return nextReview > tomorrowStart && nextReview <= nextWeekStart;
  }).length;
  
  const masteredCards = cards.filter(card => card.difficulty < 0.3).length;
  const masteryPercentage = cards.length > 0 ? Math.round((masteredCards / cards.length) * 100) : 0;
  
  return {
    dueToday,
    dueTomorrow,
    dueNextWeek,
    masteryPercentage,
    totalCards: cards.length,
    masteredCards
  };
};
