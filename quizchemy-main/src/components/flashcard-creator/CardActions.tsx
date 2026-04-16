
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Plus, PenTool } from 'lucide-react';

interface CardActionsProps {
  onSave: () => void;
  onAddCard: () => void;
  saving: boolean;
  cardsCount: number;
  saveLabel?: string;
  isDisabled?: boolean;
}

export const CardActions: React.FC<CardActionsProps> = ({ onSave, onAddCard, saving, cardsCount, saveLabel, isDisabled = false }) => {
  return (
    <div className="flex flex-col space-y-4">
      <Button 
        onClick={onAddCard} 
        variant="outline"
        className="flex items-center py-4 text-base font-medium border-dashed border-2 hover:bg-secondary/20"
        type="button"
      >
        <Plus className="mr-2 h-5 w-5 text-primary" />
        Add card(s)
        <span className="ml-auto bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
          {cardsCount}
        </span>
      </Button>
      
      <Button 
        onClick={onSave}
        disabled={saving || isDisabled}
        className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
          saving || isDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-lg hover:scale-[1.02]'
        } bg-gradient-to-r from-primary to-purple-600`}
        type="button"
      >
        <PenTool className="mr-2 h-5 w-5" />
        {saving ? (saveLabel ? `Saving...` : 'Creating...') : (saveLabel || 'Create')}
      </Button>
    </div>
  );
};
