
import React from 'react';
import { FlashcardComponent } from '@/components/FlashcardComponent';
import { Flashcard } from '@/lib/types';

interface FlashcardPreviewProps {
  previewCard: Flashcard | null;
}

export const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({ previewCard }) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-xl font-medium mb-4">Preview</h3>
      {previewCard ? (
        <FlashcardComponent
          card={previewCard}
          onNext={() => {}}
          onPrevious={() => {}}
          showControls={false}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-6 bg-white/30 backdrop-blur-sm rounded-xl border min-h-[300px] text-center">
          <div className="max-w-md">
            <h4 className="text-lg font-medium mb-2">No preview available</h4>
            <p className="text-muted-foreground">
              Create or generate a flashcard to see a preview here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
