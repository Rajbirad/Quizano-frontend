
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, ArrowRight } from 'lucide-react';

interface GeneratorControlsProps {
  isGenerating: boolean;
  onGenerateFlashcards: () => void;
  hasContent: boolean;
  selectedSubject: string;
  showRegenerateOption?: boolean;
  forceNewFlashcards?: boolean;
  onRegenerateChange?: (checked: boolean) => void;
}

import { Switch } from '@/components/ui/switch';
import { RefreshCw } from 'lucide-react';

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  isGenerating,
  onGenerateFlashcards,
  hasContent,
  selectedSubject,
  showRegenerateOption = false,
  forceNewFlashcards = false,
  onRegenerateChange,
}) => {
  return (
    <div className="mt-8 mb-4 space-y-4">
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showRegenerateOption 
            ? 'max-h-32 opacity-100 mb-4' 
            : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        <div className="p-5 border rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/60 backdrop-blur-sm transform transition-transform duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-white shadow-sm border border-green-100">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-semibold text-gray-700">Generate fresh flashcards</h4>
                <p className="text-xs text-gray-600 mt-0.5">You've processed this content before - get different flashcards?</p>
              </div>
            </div>
            
            {/* Custom Styled Switch */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium transition-colors duration-200 ${
                !forceNewFlashcards ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                Same
              </span>
              <Switch
                checked={forceNewFlashcards}
                onCheckedChange={onRegenerateChange}
                className={`${forceNewFlashcards 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' 
                  : 'bg-gradient-to-r from-gray-200 to-gray-300'}`}
              />
              <span className={`text-xs font-medium transition-colors duration-200 ${
                forceNewFlashcards ? 'text-blue-600' : 'text-muted-foreground'
              }`}>
                Different
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="w-full justify-center py-6 text-lg"
        disabled={isGenerating || !hasContent}
        onClick={onGenerateFlashcards}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Generating...
          </>
        ) : (
          <>
            Generate Flashcards
          </>
        )}
      </Button>
      
      <p className="text-center text-sm text-muted-foreground mt-3">
        {!hasContent ? 
          "Add some content first to generate flashcards." : 
          "Our AI will analyze your content and create detailed flashcards."
        }
      </p>
    </div>
  );
};
