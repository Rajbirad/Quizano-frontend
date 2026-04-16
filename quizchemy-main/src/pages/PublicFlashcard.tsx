import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, Lightbulb, ArrowLeft, ArrowRight, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlashcardProps {
  isEmbedded?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hints?: string[];
}

interface FlashcardSetResponse {
  success: boolean;
  flashcard_set: {
    title: string;
    cards: Flashcard[];
  };
}

const PublicFlashcard: React.FC<FlashcardProps> = ({ isEmbedded = false }) => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('Flashcard Set');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch(`${API_URL}/api/flashcards/shared/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error('Flashcard set not found or not publicly shared');
        }

        const data: FlashcardSetResponse = await response.json();
        
        if (data.success && data.flashcard_set) {
          setTitle(data.flashcard_set.title);
          setFlashcards(data.flashcard_set.cards);
        } else {
          throw new Error('Invalid flashcard data format');
        }
      } catch (err) {
        console.error('Error fetching flashcards:', err);
        setError('Could not load flashcards. The set may be private or no longer available.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFlashcards();
    }
  }, [id]);

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const previousCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const toggleFlip = () => setIsFlipped(!isFlipped);

  const resetFlashcards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${isEmbedded ? 'h-full' : 'min-h-screen'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || flashcards.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-center px-4 ${isEmbedded ? 'h-full' : 'min-h-screen'}`}>
        <h1 className="text-2xl font-semibold mb-4">Flashcard Set Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || 'This flashcard set may be private or no longer available.'}</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const containerClasses = isEmbedded
    ? "h-full bg-gradient-to-br from-primary/10 via-background to-secondary/10"
    : "min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10";

  const contentClasses = isEmbedded
    ? "container mx-auto px-2 py-4"
    : "container mx-auto px-4 py-8 max-w-4xl";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {flashcards.length}
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <Card 
          className="relative w-full aspect-video cursor-pointer perspective-1000"
          onClick={toggleFlip}
        >
          <div className={`transform-gpu transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''} preserve-3d`}>
            <CardContent className="absolute inset-0 backface-hidden p-8 flex flex-col items-center justify-center text-center">
              <div className="text-xl md:text-2xl font-medium">{currentCard.front}</div>
            </CardContent>

            <CardContent className="absolute inset-0 backface-hidden rotate-y-180 p-8 flex flex-col items-center justify-center text-center bg-primary/5">
              <div className="text-xl md:text-2xl font-medium">{currentCard.back}</div>
              {currentCard.hints?.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <Lightbulb className="inline-block w-4 h-4 mr-2" />
                  Hint: {currentCard.hints[0]}
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={previousCard}
            disabled={flashcards.length <= 1}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={resetFlashcards}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextCard}
            disabled={flashcards.length <= 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicFlashcard;
