
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Save } from 'lucide-react';
import { OcclusionRect } from './types';

interface OcclusionControlsProps {
  showLabels: boolean;
  toggleLabels: () => void;
  handleSave: () => void;
  rectsCount: number;
}

export const OcclusionControls: React.FC<OcclusionControlsProps> = ({
  showLabels,
  toggleLabels,
  handleSave,
  rectsCount
}) => {
  return (
    <div className="flex justify-between mb-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={toggleLabels}
      >
        {showLabels ? (
          <>
            <EyeOff className="h-4 w-4" />
            Hide Labels
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Show Labels
          </>
        )}
      </Button>
      
      <Button
        variant="default"
        size="sm"
        className="gap-2"
        onClick={handleSave}
        disabled={rectsCount === 0}
      >
        <Save className="h-4 w-4" />
        Create Flashcards
      </Button>
    </div>
  );
};
