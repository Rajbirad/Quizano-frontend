
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BookmarkManagerProps {
  children: (bookmarkProps: {
    bookmarkedCards: string[];
    toggleBookmark: (cardId: string) => void;
  }) => React.ReactNode;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({ children }) => {
  const { toast } = useToast();
  const [bookmarkedCards, setBookmarkedCards] = useState<string[]>([]);

  // Load bookmarked cards from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedCards');
    if (savedBookmarks) {
      setBookmarkedCards(JSON.parse(savedBookmarks));
    }
  }, []);

  const toggleBookmark = (cardId: string) => {
    let updatedBookmarks;
    
    if (bookmarkedCards.includes(cardId)) {
      updatedBookmarks = bookmarkedCards.filter(id => id !== cardId);
      toast({
        title: "Bookmark Removed",
        description: "Card removed from your favorites.",
      });
    } else {
      updatedBookmarks = [...bookmarkedCards, cardId];
      toast({
        title: "Bookmark Added",
        description: "Card added to your favorites.",
      });
    }
    
    setBookmarkedCards(updatedBookmarks);
    localStorage.setItem('bookmarkedCards', JSON.stringify(updatedBookmarks));
  };

  return children({
    bookmarkedCards,
    toggleBookmark
  });
};
