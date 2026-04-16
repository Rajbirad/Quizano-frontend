import { Flashcard, Deck, DailyStats } from './types';
import { generateId } from './storage-utils';

// Default flashcards
export const defaultFlashcards: Flashcard[] = [];

// Default decks including subject-specific decks
export const defaultDecks: Deck[] = [
  {
    id: 'general',
    name: 'General',
    description: 'General knowledge flashcards',
    createdAt: new Date(),
    totalCards: 0,
    masteredCards: 0,
    dueCards: 0
  },
  {
    id: 'math',
    name: 'Math',
    description: 'Mathematics concepts and formulas',
    createdAt: new Date(),
    totalCards: 0,
    masteredCards: 0,
    dueCards: 0
  },
  {
    id: 'physics',
    name: 'Physics',
    description: 'Physics concepts and equations',
    createdAt: new Date(),
    totalCards: 0,
    masteredCards: 0,
    dueCards: 0
  },
  {
    id: 'science',
    name: 'Science',
    description: 'General science concepts and facts',
    createdAt: new Date(),
    totalCards: 0,
    masteredCards: 0,
    dueCards: 0
  }
];

// Default stats
export const defaultStats: DailyStats = {
  dueToday: 0,
  completedToday: 0,
  streak: 0,
  totalCards: 0,
  masteryPercentage: 0
};
