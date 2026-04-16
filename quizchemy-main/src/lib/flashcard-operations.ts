import { Flashcard, Deck, DailyStats, ReviewHistoryItem } from './types';
import { getFromStorage, saveToStorage, generateId } from './storage-utils';
import { FLASHCARDS_KEY, DECKS_KEY, STATS_KEY } from './storage-utils';
import { defaultFlashcards, defaultDecks, defaultStats } from './default-data';
import { calculateNextReview } from './spaced-repetition';

// Mutation functions
export const addFlashcard = (card: Omit<Flashcard, 'id'>): Flashcard => {
  const newCard: Flashcard = {
    ...card,
    id: generateId(),
  };
  
  const existingCards = getFromStorage<Flashcard[]>(FLASHCARDS_KEY, defaultFlashcards);
  const updatedCards = [...existingCards, newCard];
  
  saveToStorage(FLASHCARDS_KEY, updatedCards);
  
  // Update deck statistics
  updateDeckStats(card.deckId);
  
  return newCard;
};

export const updateFlashcard = (id: string, updates: Partial<Flashcard>): Flashcard | null => {
  const existingCards = getFromStorage<Flashcard[]>(FLASHCARDS_KEY, defaultFlashcards);
  const cardIndex = existingCards.findIndex(card => card.id === id);
  
  if (cardIndex === -1) return null;
  
  const updatedCard = {
    ...existingCards[cardIndex],
    ...updates,
  };
  
  existingCards[cardIndex] = updatedCard;
  saveToStorage(FLASHCARDS_KEY, existingCards);
  
  // Update deck statistics if necessary
  if (updates.deckId && updates.deckId !== existingCards[cardIndex].deckId) {
    updateDeckStats(updatedCard.deckId);
    updateDeckStats(existingCards[cardIndex].deckId);
  }
  
  return updatedCard;
};

export const deleteFlashcard = (id: string): boolean => {
  const existingCards = getFromStorage<Flashcard[]>(FLASHCARDS_KEY, defaultFlashcards);
  const cardIndex = existingCards.findIndex(card => card.id === id);
  
  if (cardIndex === -1) return false;
  
  const deckId = existingCards[cardIndex].deckId;
  existingCards.splice(cardIndex, 1);
  
  saveToStorage(FLASHCARDS_KEY, existingCards);
  
  // Update deck statistics
  updateDeckStats(deckId);
  
  return true;
};

export const addDeck = (deck: Omit<Deck, 'id' | 'totalCards' | 'masteredCards' | 'dueCards'>): Deck => {
  const newDeck: Deck = {
    ...deck,
    id: generateId(),
    totalCards: 0,
    masteredCards: 0,
    dueCards: 0,
  };
  
  const existingDecks = getFromStorage<Deck[]>(DECKS_KEY, defaultDecks);
  const updatedDecks = [...existingDecks, newDeck];
  
  saveToStorage(DECKS_KEY, updatedDecks);
  
  return newDeck;
};

export const updateDeckStats = (deckId: string): void => {
  const existingCards = getFromStorage<Flashcard[]>(FLASHCARDS_KEY, defaultFlashcards);
  const existingDecks = getFromStorage<Deck[]>(DECKS_KEY, defaultDecks);
  
  const deckIndex = existingDecks.findIndex(deck => deck.id === deckId);
  if (deckIndex === -1) return;
  
  const deckCards = existingCards.filter(card => card.deckId === deckId);
  const today = new Date();
  
  const totalCards = deckCards.length;
  const masteredCards = deckCards.filter(card => {
    return card.difficulty < 0.3 && card.lastReviewed;
  }).length;
  
  const dueCards = deckCards.filter(card => {
    if (!card.nextReview) return true;
    const nextReview = new Date(card.nextReview);
    return nextReview <= today;
  }).length;
  
  existingDecks[deckIndex] = {
    ...existingDecks[deckIndex],
    totalCards,
    masteredCards,
    dueCards,
  };
  
  saveToStorage(DECKS_KEY, existingDecks);
  
  // Update global stats
  updateGlobalStats();
};

export const updateGlobalStats = (): void => {
  const existingCards = getFromStorage<Flashcard[]>(FLASHCARDS_KEY, defaultFlashcards);
  const existingStats = getFromStorage<DailyStats>(STATS_KEY, defaultStats);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueToday = existingCards.filter(card => {
    if (!card.nextReview) return true;
    const nextReview = new Date(card.nextReview);
    nextReview.setHours(0, 0, 0, 0);
    return nextReview <= today;
  }).length;
  
  const completedToday = existingCards.filter(card => {
    if (!card.lastReviewed) return false;
    const lastReviewed = new Date(card.lastReviewed);
    lastReviewed.setHours(0, 0, 0, 0);
    return lastReviewed.getTime() === today.getTime();
  }).length;
  
  const totalCards = existingCards.length;
  
  // Calculate mastery percentage
  const masteredCards = existingCards.filter(card => {
    return card.difficulty < 0.3 && card.lastReviewed;
  }).length;
  
  const masteryPercentage = totalCards > 0 
    ? Math.round((masteredCards / totalCards) * 100) 
    : 0;
  
  // Keep existing streak
  const updatedStats: DailyStats = {
    ...existingStats,
    dueToday,
    completedToday,
    totalCards,
    masteryPercentage,
  };
  
  saveToStorage(STATS_KEY, updatedStats);
};

export const rateCard = (cardId: string, rating: 'easy' | 'medium' | 'hard'): Flashcard | null => {
  const existingCards = getFromStorage<Flashcard[]>(FLASHCARDS_KEY, defaultFlashcards);
  const cardIndex = existingCards.findIndex(card => card.id === cardId);
  
  if (cardIndex === -1) return null;
  
  const card = existingCards[cardIndex];
  const { nextReviewDate, newDifficulty, interval } = calculateNextReview(
    rating,
    card.difficulty,
    card.lastReviewed
  );
  
  // Create a review history entry
  const reviewHistoryItem: ReviewHistoryItem = {
    date: new Date(),
    rating,
    interval
  };
  
  // Update card with new review data
  card.lastReviewed = new Date();
  card.nextReview = nextReviewDate;
  card.difficulty = newDifficulty;
  
  // Add to review history (create array if it doesn't exist)
  if (!card.reviewHistory) {
    card.reviewHistory = [];
  }
  card.reviewHistory.push(reviewHistoryItem);
  
  // Only keep the last 100 review history items to prevent excessive storage usage
  if (card.reviewHistory.length > 100) {
    card.reviewHistory = card.reviewHistory.slice(-100);
  }
  
  existingCards[cardIndex] = card;
  saveToStorage(FLASHCARDS_KEY, existingCards);
  
  // Update statistics
  updateDeckStats(card.deckId);
  
  return card;
};
