
// Types for the flashcard application
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  deckId: string;
  deckName: string;
  title?: string; // Add title as an optional property
  createdAt: Date;
  lastReviewed: Date | null;
  nextReview: Date;
  difficulty: Difficulty;
  frontMedia?: {
    type: 'image' | 'video' | 'youtube';
    url: string;
  };
  backMedia?: {
    type: 'image' | 'video' | 'youtube';
    url: string;
  };
  reviewHistory?: ReviewHistoryItem[];
}

export interface ReviewHistoryItem {
  date: Date;
  rating: 'easy' | 'medium' | 'hard';
  interval: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  totalCards: number;
  masteredCards: number;
  dueCards: number;
}

export interface DailyStats {
  dueToday: number;
  completedToday: number;
  streak: number;
  totalCards: number;
  masteryPercentage: number;
}

export interface SpacedRepetitionStats {
  dueToday: number;
  dueTomorrow: number;
  dueNextWeek: number;
  masteryPercentage: number;
  totalCards: number;
  masteredCards: number;
}

export type Difficulty = number; // 0-1 value representing difficulty

// Types for function returns
export interface ReviewResult {
  nextReviewDate: Date;
  newDifficulty: Difficulty;
  interval: number;
}
