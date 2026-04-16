import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit3, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardGenerationCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcardCount: number;
  onEdit: () => void;
  onPreview: () => void;
}

export const FlashcardGenerationCompleteDialog: React.FC<FlashcardGenerationCompleteDialogProps> = ({
  open,
  onOpenChange,
  flashcardCount,
  onEdit,
  onPreview,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src="/icons/checklist.svg" alt="Success" className="h-16 w-16" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Flashcards Generated Successfully!
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            {flashcardCount} flashcard{flashcardCount !== 1 ? 's' : ''} ready for you.
            <br />
            What would you like to do next?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-6">
          <Button
            onClick={onEdit}
            className={cn(
              "w-full h-auto py-4 px-6 flex items-center justify-start gap-4",
              "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <img src="/icons/edit.svg" alt="Edit" className="h-8 w-8 flex-shrink-0" />
            <div className="text-left flex-1">
              <div className="font-semibold text-lg">Edit Flashcards</div>
              <div className="text-sm opacity-90 font-normal">
                Customize cards or add more before saving
              </div>
            </div>
          </Button>

          <Button
            onClick={onPreview}
            variant="outline"
            className={cn(
              "w-full h-auto py-4 px-6 flex items-center justify-start gap-4",
              "border-2 hover:bg-accent"
            )}
          >
            <img src="/icons/preview.svg" alt="Preview" className="h-8 w-8 flex-shrink-0" />
            <div className="text-left flex-1">
              <div className="font-semibold text-lg">Preview Now</div>
              <div className="text-sm text-muted-foreground font-normal">
                Start studying immediately
              </div>
            </div>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          You can always edit your flashcards later from your library
        </p>
      </DialogContent>
    </Dialog>
  );
};
