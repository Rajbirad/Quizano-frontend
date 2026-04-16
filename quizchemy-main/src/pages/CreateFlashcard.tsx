import React from 'react';
import { BookText, Sparkles } from 'lucide-react';
import '@/components/ui/ShinyText.css';

import { ManualFlashcardCreator } from '@/components/flashcard-creator/ManualFlashcardCreator';
const CreateFlashcard: React.FC = () => {
  return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="relative mb-10">
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <BookText className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">Create Your Flashcards</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Design your own custom flashcards with rich content, images, and formatting.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-primary/20 rotate-12">
              <BookText className="h-10 w-10" />
            </div>
          </div>
          <div className="absolute top-10 right-1/4 transform translate-x-1/2 -translate-y-1/2">
            <div className="text-accent/30 -rotate-12">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
        </div>
        
        <ManualFlashcardCreator 
          initialFlashcards={[{
            id: crypto.randomUUID(),
            frontContent: '',
            backContent: '',
            hint: '',
            frontMediaType: 'none',
            frontMediaUrl: '',
            backMediaType: 'none',
            backMediaUrl: '',
            format: 'Question & Answer',
            difficulty: 'Standard'
          }]}
          flashcardSet={{
            id: crypto.randomUUID(),
            title: 'New Flashcard Set',
            flashcards: [],
            total_flashcards: 0,
            difficulty_level: 'Standard',
            card_format: 'Question & Answer',
            created_at: new Date().toISOString()
          }}
          saveLabel="Create Flashcards"
        />
      </div>
    );
};
export default CreateFlashcard;