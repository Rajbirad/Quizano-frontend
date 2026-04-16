import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface FlashcardHeaderProps {
  title: string;
  selectedDeck: string;
  decks: Array<{
    id: string;
    name: string;
  }>;
  onTitleChange: (title: string) => void;
  onDeckChange: (deckId: string) => void;
}
export const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({
  title,
  selectedDeck,
  decks,
  onTitleChange,
  onDeckChange
}) => {
  return <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Label htmlFor="flashcard-title" className="text-md font-medium mb-2 block">
          Flashcard Title
        </Label>
        <Input id="flashcard-title" placeholder="Enter Flashcard Title..." value={title} onChange={e => onTitleChange(e.target.value)} className="text-lg border-2" />
      </div>
      
      
    </div>;
};