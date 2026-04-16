
// Helper functions for local storage operations

// Local storage keys
export const FLASHCARDS_KEY = 'quizano_flashcards';
export const DECKS_KEY = 'quizano_decks';
export const STATS_KEY = 'quizano_stats';

// Helper for generating unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Store functions
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Error parsing stored value for ${key}:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};
