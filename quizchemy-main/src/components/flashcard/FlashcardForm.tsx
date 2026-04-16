
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2 } from 'lucide-react';
import { MediaSelector } from './MediaSelector';
import { Deck } from '@/lib/types';

interface FlashcardFormProps {
  decks: Deck[];
  deckId: string;
  inputText: string;
  question: string;
  answer: string;
  hint: string;
  mediaType: 'none' | 'image' | 'video' | 'youtube';
  mediaUrl: string;
  youtubeUrl: string;
  generating: boolean;
  loading: boolean;
  onDeckChange: (value: string) => void;
  onInputTextChange: (value: string) => void;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onHintChange: (value: string) => void;
  onMediaChange: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
  onYoutubeUrlChange: (url: string) => void;
  onClearMedia: () => void;
  onGenerate: () => void;
  onSave: () => void;
}

export const FlashcardForm: React.FC<FlashcardFormProps> = ({
  decks,
  deckId,
  inputText,
  question,
  answer,
  hint,
  mediaType,
  mediaUrl,
  youtubeUrl,
  generating,
  loading,
  onDeckChange,
  onInputTextChange,
  onQuestionChange,
  onAnswerChange,
  onHintChange,
  onMediaChange,
  onYoutubeUrlChange,
  onClearMedia,
  onGenerate,
  onSave,
}) => {
  // Find the subject-specific decks
  const subjectDecks = decks.filter(deck => 
    ['math', 'physics', 'science'].includes(deck.id) || deck.id === 'general'
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deck">Select Subject</Label>
        <Select value={deckId} onValueChange={onDeckChange}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {subjectDecks.map((deck) => (
              <SelectItem key={deck.id} value={deck.id}>
                {deck.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="input-text">Input Text (for AI generation)</Label>
        <Textarea
          id="input-text"
          placeholder={`Enter text to generate ${deckId ? decks.find(d => d.id === deckId)?.name : 'subject'}-specific flashcards...`}
          className="min-h-[120px] resize-none"
          value={inputText}
          onChange={(e) => onInputTextChange(e.target.value)}
        />
        <Button 
          onClick={onGenerate} 
          className="w-full mt-2"
          disabled={generating || !inputText.trim()}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate {deckId ? decks.find(d => d.id === deckId)?.name : ''} Flashcard
            </>
          )}
        </Button>
      </div>
      
      <div className="pt-4 border-t">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="Enter the question..."
              value={question}
              onChange={(e) => onQuestionChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer..."
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hint">Hint (optional)</Label>
            <Input
              id="hint"
              placeholder="Enter a hint..."
              value={hint}
              onChange={(e) => onHintChange(e.target.value)}
            />
          </div>
          
          {/* Media section */}
          <div className="space-y-2 pt-2">
            <Label>Add Media (optional)</Label>
            <MediaSelector 
              mediaType={mediaType}
              mediaUrl={mediaUrl}
              youtubeUrl={youtubeUrl}
              onMediaChange={onMediaChange}
              onYoutubeUrlChange={onYoutubeUrlChange}
              onClearMedia={onClearMedia}
            />
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onSave} 
        className="w-full"
        disabled={loading || !question.trim() || !answer.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Flashcard"
        )}
      </Button>
    </div>
  );
};
