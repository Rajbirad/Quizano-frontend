
import React from 'react';
import { Flashcard } from '@/lib/types';

interface GeneratedCardsSummaryProps {
  generatedCards: Flashcard[];
}

export const GeneratedCardsSummary: React.FC<GeneratedCardsSummaryProps> = ({ 
  generatedCards 
}) => {
  if (generatedCards.length === 0) return null;
  
  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Generated Flashcards ({generatedCards.length})</h3>
      <p className="text-muted-foreground mb-4">
        Your flashcards have been added to your collection. You can view and study them in your dashboard.
      </p>
    </div>
  );
};
