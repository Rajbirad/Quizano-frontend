
import { useState, useEffect } from 'react';
import { Flashcard, Deck, DailyStats } from './types';
import { getFromStorage } from './storage-utils';
import { FLASHCARDS_KEY, DECKS_KEY, STATS_KEY } from './storage-utils';
import { defaultFlashcards, defaultDecks, defaultStats } from './default-data';

// Data access hooks
export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  useEffect(() => {
    const loadedCards = getFromStorage<Flashcard[]>(FLASHCARDS_KEY, defaultFlashcards);
    setFlashcards(loadedCards);
  }, []);
  
  return { flashcards };
};

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  
  useEffect(() => {
    const loadedDecks = getFromStorage<Deck[]>(DECKS_KEY, defaultDecks);
    setDecks(loadedDecks);
  }, []);
  
  return { decks };
};

export const useDailyStats = () => {
  const [stats, setStats] = useState<DailyStats>(defaultStats);
  
  useEffect(() => {
    const loadedStats = getFromStorage<DailyStats>(STATS_KEY, defaultStats);
    setStats(loadedStats);
  }, []);
  
  return { stats };
};

export const useRecentCards = () => {
  const { flashcards } = useFlashcards();
  const [recentCards, setRecentCards] = useState<Flashcard[]>([]);
  
  useEffect(() => {
    // Sort by lastReviewed date, most recent first
    const sorted = [...flashcards].sort((a, b) => {
      if (!a.lastReviewed) return 1;
      if (!b.lastReviewed) return -1;
      return new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime();
    });
    
    setRecentCards(sorted.slice(0, 3));
  }, [flashcards]);
  
  return { recentCards };
};

export const useDeckCards = (deckId?: string) => {
  const { flashcards } = useFlashcards();
  const [cards, setCards] = useState<Flashcard[]>([]);
  
  useEffect(() => {
    if (!deckId) {
      setCards(flashcards);
      return;
    }
    
    const filtered = flashcards.filter(card => card.deckId === deckId);
    setCards(filtered);
  }, [flashcards, deckId]);
  
  return { cards };
};
