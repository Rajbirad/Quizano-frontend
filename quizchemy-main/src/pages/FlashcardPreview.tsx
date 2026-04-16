
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider as TooltipProviderPrimitive, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpenText, 
  Lightbulb, 
  RotateCcw, 
  Shuffle, 
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Save,
  Settings,
  Play,
  Pause,
  Share2,
  X,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { Flashcard } from '@/lib/types';
import { addFlashcard } from '@/lib/flashcard-operations';
import { defaultDecks } from '@/lib/default-data';
import { ShareDialog } from '@/components/flashcard/ShareDialog';
import { supabase } from '@/integrations/supabase/client';

interface FlashcardPreviewProps {
  isEmbedded?: boolean;
}

const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({ isEmbedded = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id; // Get ID from URL params
  const { flashcardsData, settings, inputType } = location.state || {};
  const isAIGenerated = Boolean(settings); // If we have settings, it's AI-generated

  const [flashcardId, setFlashcardId] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSet, setFlashcardSet] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  // Handle flashcards from either state or Supabase
  useEffect(() => {
    const loadFlashcards = async () => {
      setLoading(true);
      setError(null);

      // If we have state data, use that first
      if (flashcardsData) {
        try {
          console.log('Using flashcards from state:', flashcardsData);
          if (Array.isArray(flashcardsData)) {
            setFlashcards(flashcardsData);
            setLoading(false);
            return;
          } else if (flashcardsData.flashcards && Array.isArray(flashcardsData.flashcards)) {
            // New data structure from generator
            const transformedCards = flashcardsData.flashcards.map((card: any) => ({
              id: card.id,
              question: card.front,
              answer: card.back,
              hint: card.hint || null,
              deckId: flashcardsData.id,
              deckName: flashcardsData.title || 'Untitled Flashcard Set',
              createdAt: new Date(card.created_at),
              lastReviewed: null,
              nextReview: new Date(),
              difficulty: card.difficulty === 'Standard' ? 0.5 :
                         card.difficulty === 'Easy' ? 0.3 :
                         card.difficulty === 'Hard' ? 0.7 : 0.5,
              frontMedia: card.frontMedia || (card.front_media ? {
                type: card.front_media.type,
                url: card.front_media.url
              } : undefined),
              backMedia: card.backMedia || (card.back_media ? {
                type: card.back_media.type,
                url: card.back_media.url
              } : undefined),
              media: null
            }));
            setFlashcards(transformedCards);
            setFlashcardSet(flashcardsData);
            setLoading(false);
            return;
          } else if (flashcardsData.data?.cards) {
            const transformedCards = flashcardsData.data.cards.map((card: any) => ({
              id: card.id,
              question: card.front,
              answer: card.back,
              hint: card.hint || null,
              deckId: flashcardsData.data.flashcard_set_id,
              deckName: flashcardsData.data.title || 'Untitled Flashcard Set',
              createdAt: new Date(card.created_at),
              lastReviewed: null,
              nextReview: new Date(),
              difficulty: card.difficulty === 'Standard' ? 0.5 :
                         card.difficulty === 'Easy' ? 0.3 :
                         card.difficulty === 'Hard' ? 0.7 : 0.5,
              frontMedia: card.frontMedia || (card.front_media ? {
                type: card.front_media.type,
                url: card.front_media.url
              } : undefined),
              backMedia: card.backMedia || (card.back_media ? {
                type: card.back_media.type,
                url: card.back_media.url
              } : undefined),
              media: null
            }));
            console.log('Raw API cards data:', flashcardsData.data.cards);
            console.log('First raw card:', flashcardsData.data.cards[0]);
            console.log('Transformed cards with media:', transformedCards);
            console.log('First card media details:', {
              card0: transformedCards[0],
              frontMedia: transformedCards[0]?.frontMedia,
              backMedia: transformedCards[0]?.backMedia
            });
            setFlashcards(transformedCards);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error processing state data:', error);
          // Fall through to Supabase loading
        }
      }

      // If no state data or processing failed, try loading from Supabase
      if (id) {
        try {
          // Strip 'flashcard_' prefix if it exists
          const cleanId = id.replace('flashcard_', '');
          
          const { data: flashcardSet, error } = await supabase
            .from('flashcard_sets_normalized')
            .select('*')
            .eq('id', cleanId)
            .single();

          if (error) throw error;

          if (flashcardSet) {
            setFlashcardSet(flashcardSet);
            setFlashcardId(flashcardSet.id);
            
            // Fetch flashcard questions with answers and hints using correct schema
            const { data: flashcardData, error: flashcardError } = await supabase
              .from('flashcard_questions')
              .select(`
                *,
                answers:flashcard_answers(
                  id,
                  answer_text,
                  is_correct,
                  explanation
                ),
                hints:flashcard_hints(
                  id,
                  hint_text
                )
              `)
              .eq('set_id' as any, cleanId as any)
              .order('position');

            if (flashcardError) throw flashcardError;

            const transformedCards = flashcardData.map((card: any) => ({
              id: card.id,
              frontMedia: undefined, // Will need to handle media separately if needed
              backMedia: undefined, // Will need to handle media separately if needed
              question: card.question_text || 'No question',
              answer: card.answers?.[0]?.answer_text || 'No answer',
              hint: card.hints?.[0]?.hint_text || '',
              deckId: flashcardSet.id,
              deckName: flashcardSet.title || 'Untitled Set',
              createdAt: new Date(card.created_at || flashcardSet.created_at),
              lastReviewed: null,
              status: 'not_started'
            }));
            setFlashcards(transformedCards);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading from Supabase:', error);
          // Continue to fallback options
        }
      }

      // Fallback to state data if Supabase load failed or no ID
      if (flashcardsData) {
        try {
          console.log('Using flashcards from state:', flashcardsData);
          if (Array.isArray(flashcardsData)) {
            setFlashcards(flashcardsData);
          } else if (flashcardsData.data?.cards || flashcardsData.data?.updated_cards) {
            // Transform the cards if they're in a different format
            const cardsArray = flashcardsData.data.cards || flashcardsData.data.updated_cards;
            const transformedCards = cardsArray.map((card: any) => ({
              id: card.id,
              frontMedia: card.frontMedia || (card.front_media ? {
                type: card.front_media.type,
                url: card.front_media.url
              } : undefined),
              backMedia: card.backMedia || (card.back_media ? {
                type: card.back_media.type,
                url: card.back_media.url
              } : undefined),
              question: card.front || card.question,
              answer: card.back || card.answer,
              hint: card.hint || '',
              deckId: flashcardsData.data.flashcard_set_id,
              deckName: flashcardsData.data.title || 'Untitled Set',
              createdAt: new Date(card.created_at || new Date()),
              lastReviewed: null,
              status: 'not_started'
            }));
            setFlashcards(transformedCards);
          }
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error processing state data:', error);
          setError('Failed to load flashcards');
          setLoading(false);
        }
      }

      // If we have an ID, try to fetch from Supabase
      if (id) {
        try {
          // Remove 'flashcard_' prefix and any other non-UUID characters
          const cleanId = id.replace(/^flashcard_/, '').trim();
          
          if (!cleanId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            console.error('Invalid UUID format:', cleanId);
            setError('Invalid flashcard ID format');
            setLoading(false);
            return;
          }
          
          const { data: flashcardSet, error } = await supabase
            .from('flashcard_sets_normalized')
            .select('*')
            .eq('id', cleanId)
            .single();

          if (error) {
            console.error('Error fetching flashcard set:', error);
            setError('Could not load flashcard set');
            toast({
              title: 'Error',
              description: 'Could not load flashcard set',
              variant: 'destructive',
            });
            return;
          }

          if (flashcardSet) {
            setFlashcardSet(flashcardSet);
            try {
              // Fetch flashcard questions with answers and hints using correct schema
              const { data: flashcardData, error: flashcardError } = await supabase
                .from('flashcard_questions')
                .select(`
                  *,
                  answers:flashcard_answers(
                    id,
                    answer_text,
                    is_correct,
                    explanation
                  ),
                  hints:flashcard_hints(
                    id,
                    hint_text
                  )
                `)
                .eq('set_id' as any, cleanId as any)
                .order('position');

              if (flashcardError) throw flashcardError;

              const transformedFlashcards = flashcardData.map((card: any) => ({
                id: card.id,
                frontMedia: undefined, // Will need to handle media separately if needed
                backMedia: undefined, // Will need to handle media separately if needed
                question: card.question_text || 'No question',
                answer: card.answers?.[0]?.answer_text || 'No answer',
                hint: card.hints?.[0]?.hint_text || '',
                deckId: flashcardSet.id,
                deckName: flashcardSet.title,
                createdAt: new Date(card.created_at || flashcardSet.created_at),
                lastReviewed: null,
                status: 'not_started'
              }));
              setFlashcards(transformedFlashcards);
            } catch (parseError) {
              console.error('Error loading flashcards:', parseError);
              setError('Could not load flashcard data');
            }
          } else {
            setError('Flashcard set not found');
          }
        } catch (error) {
          console.error('Error:', error);
          setError('Could not load flashcard set');
          toast({
            title: 'Error',
            description: 'Could not load flashcard set',
            variant: 'destructive',
          });
        }
      } else if (!flashcardsData) {
        // No ID and no state data
        setError('No flashcard data available');
      }
      
      setLoading(false);
    };

    loadFlashcards();
  }, [id, flashcardsData, toast]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const generateFlashcardsFromAPI = () => {
    setLoading(true);
    
    try {
      if (!location.state?.flashcardsData?.data?.cards) {
        throw new Error('No valid flashcard data found');
      }

      const apiData = location.state.flashcardsData.data;
      console.log('Processing API data:', apiData);

      const newFlashcards: Flashcard[] = apiData.cards.map((card: any) => ({
        id: card.id,
        question: card.front,
        answer: card.back,
        hint: card.hint || null,
        deckId: apiData.flashcard_set_id,
        deckName: apiData.title || 'Untitled Flashcard Set',
        createdAt: new Date(card.created_at),
        lastReviewed: null,
        nextReview: new Date(),
        difficulty: card.difficulty === 'Standard' ? 0.5 :
                   card.difficulty === 'Easy' ? 0.3 :
                   card.difficulty === 'Hard' ? 0.7 : 0.5,
        media: null
      }));
      
      setFlashcards(newFlashcards);
      setLoading(false);
    } catch (error) {
      console.error('Error processing API flashcards:', error);
      toast({
        title: "Error",
        description: "Could not load flashcards. Please try again.",
        variant: "destructive"
      });
      setError("Failed to load flashcards");
      setLoading(false);
    }
  };

  // Add error and loading states at the start of render
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-4 no-scrollbar">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-pulse w-full space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || (!loading && !flashcards.length)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-4 no-scrollbar">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            {error ? (
              <>
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error Loading Flashcards</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
              </>
            ) : (
              <>
                <BookOpenText className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Flashcards Available</h2>
                <p className="text-muted-foreground mb-4">
                  There are no flashcards to display. Try creating some new ones!
                </p>
              </>
            )}
            <Button onClick={() => navigate('/app/create')}>
              Create Flashcards
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleError = () => {
    setError("No flashcard data available");
    setLoading(false);
    navigate('/app/create');
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      // First, ensure the card is showing the front face
      setFlipped(false);
      // Wait for the flip animation to complete before changing card
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
        setShowHint(false);
      }, 250); // Half of the flip animation duration (500ms)
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      // First, ensure the card is showing the front face
      setFlipped(false);
      // Wait for the flip animation to complete before changing card
      setTimeout(() => {
        setCurrentCardIndex(prev => prev - 1);
        setShowHint(false);
      }, 250); // Half of the flip animation duration (500ms)
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleShuffle = () => {
    setFlashcards(cards => [...cards].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setFlipped(false);
    setShowHint(false);
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setFlipped(false);
    setShowHint(false);
  };

  const handleToggleHint = () => {
    setShowHint(!showHint);
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleShare = async () => {
    if (!flashcardSet?.id && !location.state?.flashcardsData?.data?.flashcard_set_id) {
      toast({
        title: 'Cannot share yet',
        description: 'Please save the flashcard set first to share it',
        variant: 'destructive',
      });
      return;
    }

    // If we have a flashcard set ID either from state or location, open share dialog
    setIsShareDialogOpen(true);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // Stop auto-play
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true); // Set playing state immediately

      // Show answer for the current card first
      setTimeout(() => {
        if (!flipped) {
          setFlipped(true);
        }
      }, 3000);

      // Start auto-play with timing for both question and answer
      const id = setInterval(() => {
        setCurrentCardIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= flashcards.length) {
            // Auto-stop when reaching the end, showing the first card's question
            clearInterval(id);
            setIntervalId(null);
            setIsPlaying(false);
            setFlipped(false);
            return 0;
          }
          return nextIndex;
        });
        setFlipped(false); // Show question first
        setShowHint(false);
        
        // Show answer after 5 seconds of showing the question
        setTimeout(() => {
          // Only show answer if we're not on the last card
          const isLastCard = currentCardIndex === flashcards.length - 1;
          if (!isLastCard) {
            setFlipped(true);
          }
        }, 5000);
      }, 12000); // Show each card for 12 seconds total (5s question + 7s answer)
      
      setIntervalId(id);
    }
  };

  const currentCard = flashcards[currentCardIndex];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg">Generating your flashcards...</p>
      </div>
    );
  }

  return (
    <TooltipProviderPrimitive>
      <div className="min-h-screen bg-gradient-to-r from-primary to-primary/80 no-scrollbar">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Top Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      // Check if we came from dashboard or have a referring path
                      const referringPath = location.state?.from || '/app/dashboard';
                      navigate(referringPath);
                    }}
                    className="rounded-full p-3 backdrop-blur-sm bg-white/80 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close and return</p>
                </TooltipContent>
              </Tooltip>
              
              {isAIGenerated && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleToggleSettings}
                      className="rounded-full p-3 backdrop-blur-sm bg-white/80 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show AI generation settings</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleShare}
                    className="rounded-full p-3 backdrop-blur-sm bg-white/80 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share flashcards</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {/* Progress Slider */}
            <div className="flex-1 mx-8">
              <div className="relative">
                <div className="w-full h-3 bg-white rounded-full shadow-inner">
                  <div 
                    className="h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                  />
                </div>
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-green-500 to-green-400 rounded-full border-2 border-white shadow-lg transition-all duration-500 ease-out"
                  style={{ left: `${((currentCardIndex + 1) / flashcards.length) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                />
              </div>
            </div>
            
            <div className="text-sm font-medium text-muted-foreground bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm min-w-fit">
              {currentCardIndex + 1}/{flashcards.length}
            </div>
          </div>

          {/* Tap to Flip hint */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm animate-pulse">
              <BookOpenText className="h-4 w-4" />
              Tap To Flip
            </span>
          </div>
        
          {/* Settings Preview (Only for AI-generated flashcards) */}
          {isAIGenerated && showSettings && (
            <div className="mb-6 p-6 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm rounded-xl border shadow-lg animate-fade-in">
              <div className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Generation Settings:
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <span className="font-medium text-primary">Cards:</span> 
                  <div className="text-lg font-bold">{settings?.cardCount || 5}</div>
                </div>
                {inputType === 'file' && (
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <span className="font-medium text-secondary-foreground">Pages:</span> 
                    <div className="text-lg font-bold">{settings?.pageSelection === 'custom' ? settings?.customPages : 'All'}</div>
                  </div>
                )}
                <div className="bg-accent/10 p-3 rounded-lg">
                  <span className="font-medium text-accent-foreground">Difficulty:</span> 
                  <div className="text-lg font-bold">{settings?.difficulty || 'Standard'}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <span className="font-medium text-muted-foreground">Format:</span> 
                  <div className="text-lg font-bold">{settings?.format || 'Q&A'}</div>
                </div>
              </div>
            </div>
          )}
        
          {/* Flashcard Display */}
          <div className="mb-8 flex justify-center">
            <div 
              className={`relative h-96 w-full max-w-2xl rounded-2xl bg-white backdrop-blur-sm border-2 border-primary/40 shadow-2xl transition-all duration-500 cursor-pointer hover:shadow-3xl hover:scale-[1.02] hover:border-primary/60 transform-gpu ${flipped ? 'animate-scale-in' : ''}`}
              onClick={handleFlip}
              style={{
                boxShadow: `
                  0 20px 40px -12px hsl(var(--primary) / 0.15),
                  0 8px 32px -8px hsl(var(--secondary) / 0.1),
                  inset 0 1px 0 hsl(var(--background) / 0.8)
                `
              }}
            >
              {/* Speaker icon on left corner */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const text = flipped ? currentCard?.answer : currentCard?.question;
                  if (text && 'speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
                    speechSynthesis.speak(utterance);
                  }
                }}
                className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/90 hover:bg-primary/10 border border-primary/20 shadow-md transition-all duration-200 hover:scale-110"
                title="Read aloud"
              >
                <Volume2 className="h-4 w-4 text-primary" />
              </button>

              {/* Front of card */}
              <div 
                className={`absolute inset-4 flex items-center justify-center text-center transition-all duration-500 transform-gpu ${
                  flipped ? 'opacity-0 scale-95 rotate-y-180' : 'opacity-100 scale-100 rotate-y-0'
                }`}
              >
                <div className="space-y-4">
                  <div className="text-xs font-medium text-primary/60 uppercase tracking-wider">Question</div>
                  <div 
                    className="prose prose-lg max-w-none leading-relaxed"
                    style={{ color: '#4B5563', fontWeight: 500 }}
                    dangerouslySetInnerHTML={{ __html: currentCard?.question || "" }}
                  />
                  {(() => {
                    console.log('Front media check:', {
                      hasCard: !!currentCard,
                      hasFrontMedia: !!currentCard?.frontMedia,
                      mediaType: currentCard?.frontMedia?.type,
                      mediaUrl: currentCard?.frontMedia?.url,
                      shouldShow: currentCard?.frontMedia?.type === 'image' && currentCard.frontMedia.url
                    });
                    return null;
                  })()}
                  {currentCard?.frontMedia?.type === 'image' && currentCard.frontMedia.url && (
                    <div className="mt-4">
                      <img
                        src={currentCard.frontMedia.url}
                        alt="Front card media"
                        className="max-h-48 rounded-md object-contain mx-auto"
                        onLoad={() => console.log('Front image loaded successfully:', currentCard.frontMedia.url)}
                        onError={(e) => console.error('Front image failed to load:', {
                          url: currentCard.frontMedia.url,
                          error: e
                        })}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Back of card */}
              <div 
                className={`absolute inset-4 flex items-center justify-center text-center transition-all duration-500 transform-gpu ${
                  flipped ? 'opacity-100 scale-100 rotate-y-0' : 'opacity-0 scale-95 rotate-y-180'
                }`}
              >
                <div className="space-y-4">
                  <div className="text-xs font-medium text-secondary/60 uppercase tracking-wider">Answer</div>
                  <div 
                    className="prose prose-lg max-w-none leading-relaxed"
                    style={{ color: '#4B5563', fontWeight: 500 }}
                    dangerouslySetInnerHTML={{ __html: currentCard?.answer || "" }}
                  />
                  {currentCard?.backMedia?.type === 'image' && currentCard.backMedia.url && (
                    <div className="mt-4">
                      <img
                        src={currentCard.backMedia.url}
                        alt="Back card media"
                        className="max-h-48 rounded-md object-contain mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Hint display */}
          {showHint && currentCard?.hint && (
            <div className="max-w-2xl mx-auto animate-fade-in mb-8">
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-200/50 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <Lightbulb className="h-5 w-5" />
                  <span className="font-semibold">Hint:</span>
                </div>
                <p className="text-amber-800 leading-relaxed">{currentCard.hint}</p>
              </div>
            </div>
          )}
        
          {/* Bottom Controls */}
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handlePreviousCard} 
                    disabled={currentCardIndex === 0}
                    className="rounded-full p-4 bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous Card</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleToggleHint}
                      className={`rounded-full p-4 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
                        showHint ? 'bg-amber-100/80 text-amber-700' : 'bg-white/80'
                      }`}
                    >
                      <Lightbulb className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showHint ? 'Hide Hint' : 'Show Hint'}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleShuffle}
                      className="rounded-full p-4 bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-180"
                    >
                      <Shuffle className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Shuffle Cards</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRestart}
                      className="rounded-full p-4 bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-rotate-180"
                    >
                      <RotateCcw className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Restart from First Card</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handlePlayPause}
                      className={`rounded-full p-4 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
                        isPlaying ? 'bg-red-100/80 text-red-700' : 'bg-green-100/80 text-green-700'
                      }`}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleNextCard} 
                    disabled={currentCardIndex === flashcards.length - 1}
                    className="rounded-full p-4 bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next Card</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          </div>
        </div>
        
        {/* ShareDialog */}
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          flashcardId={id || location.state?.flashcardsData?.data?.flashcard_set_id || flashcardId}
        />
      </TooltipProviderPrimitive>
  );
};

export default FlashcardPreview;