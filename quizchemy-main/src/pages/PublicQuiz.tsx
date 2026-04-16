import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  RotateCcw,
  Award,
  Trophy,
  Star,
  Sparkles
} from 'lucide-react';
import { makeAuthenticatedRequest } from '@/lib/api-utils';

import { API_URL } from '@/lib/api-utils';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  type?: string;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: { [key: number]: string };
  showAnswer: boolean;
  quizCompleted: boolean;
  score: number;
  selectedAnswer: string | null;
}

interface PublicQuizProps {
  mode?: 'default' | 'embed';
}

const PublicQuiz: React.FC<PublicQuizProps> = ({ mode = 'default' }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('Quiz');
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    showAnswer: false,
    quizCompleted: false,
    score: 0,
    selectedAnswer: null
  });

  // Helper to validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Use the quiz ID directly from the route params
        if (!quizId) {
          throw new Error('Quiz ID is required');
        }

        // Validate quizId format
        if (!isValidUUID(quizId)) {
          throw new Error('Invalid quiz ID format');
        }

        // Make request to the shared quiz API endpoint
        const response = await fetch(
          `${API_URL}/api/quiz/shared/${quizId}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Quiz not found or not publicly shared');
        }

        const data = await response.json();
        
        if (data.success && data.quiz && Array.isArray(data.quiz.questions)) {
          setQuizTitle(data.quiz.title || 'Quiz');
          // Transform questions to match the expected format
          const transformedQuestions = data.quiz.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: Array.isArray(q.options) 
              ? q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text)
              : [],
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            type: q.type || 'Multiple Choice'
          }));
          
          setQuestions(transformedQuestions);
          setQuizTitle(data.quiz.title || 'Shared Quiz');
        } else {
          throw new Error('Invalid quiz data format');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        toast({
          title: "Error",
          description: "Could not load the quiz. It may be private or no longer available.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, toast, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-2xl font-semibold mb-4">Quiz Not Found</h1>
        <p className="text-muted-foreground mb-6">This quiz may be private or no longer available.</p>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = quizState.currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answer: string) => {
    if (quizState.showAnswer) return;
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showAnswer: true,
      answers: {
        ...prev.answers,
        [prev.currentQuestionIndex]: answer
      }
    }));
  };

  const handleNextQuestion = () => {
    const isCorrect = quizState.selectedAnswer === currentQuestion.correctAnswer;
    const newScore = quizState.score + (isCorrect ? 1 : 0);

    if (isLastQuestion) {
      setQuizState(prev => ({
        ...prev,
        quizCompleted: true,
        score: newScore
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showAnswer: false,
        selectedAnswer: null,
        score: newScore
      }));
    }
  };

  const handleRetakeQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      showAnswer: false,
      quizCompleted: false,
      score: 0,
      selectedAnswer: null
    });
  };

  if (quizState.quizCompleted) {
    const scorePercentage = Math.round((quizState.score / questions.length) * 100);
    const isPerfectScore = scorePercentage === 100;
    
    return (
      <div className={`min-h-screen ${isPerfectScore ? 'bg-gradient-to-br from-primary via-purple-600 to-blue-600' : 'bg-gradient-to-br from-primary/10 via-background to-secondary/10'} relative overflow-hidden`}>
        {/* Celebration Effects for Perfect Score */}
        {isPerfectScore && (
          <>
            {/* Confetti Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                >
                  <div className={`w-2 h-2 ${['bg-primary/70', 'bg-purple-300', 'bg-blue-300', 'bg-indigo-300', 'bg-violet-300'][Math.floor(Math.random() * 5)]} rotate-45 opacity-80`} />
                </div>
              ))}
            </div>
            
            {/* Floating Stars */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <Star
                  key={i}
                  className="absolute text-white/80 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    fontSize: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-2xl mx-auto">
            <Card className={`border-0 shadow-xl ${isPerfectScore ? 'bg-white/95 border-2 border-primary/50' : 'bg-card/80'} backdrop-blur-sm ${isPerfectScore ? 'animate-pulse' : ''}`}>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  {isPerfectScore ? (
                    <div className="relative">
                      <Trophy className="h-20 w-20 text-primary mx-auto mb-4 animate-bounce" />
                      <div className="absolute -top-2 -right-2">
                        <Sparkles className="h-8 w-8 text-purple-500 animate-spin" />
                      </div>
                      <div className="absolute -bottom-2 -left-2">
                        <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                  )}
                  
                  <h1 className={`text-3xl font-bold mb-2 ${isPerfectScore ? 'text-primary animate-bounce' : 'text-foreground'}`}>
                    {isPerfectScore ? '🎉 PERFECT SCORE! 🎉' : 'Quiz Completed!'}
                  </h1>
                  <p className={`${isPerfectScore ? 'text-primary/80 font-semibold text-lg' : 'text-muted-foreground'}`}>
                    {isPerfectScore ? 'Outstanding! You got every question right!' : 'Great job finishing the quiz'}
                  </p>
                </div>
                
                <div className={`${isPerfectScore ? 'bg-gradient-to-r from-primary/10 to-purple-100 border-2 border-primary/30' : 'bg-primary/10'} rounded-xl p-6 mb-6 ${isPerfectScore ? 'shadow-lg' : ''}`}>
                  <div className={`text-4xl font-bold mb-2 ${isPerfectScore ? 'text-primary' : 'text-primary'}`}>
                    {quizState.score}/{questions.length}
                  </div>
                  <div className={`text-2xl font-semibold mb-1 ${isPerfectScore ? 'text-primary/90' : 'text-foreground'}`}>
                    {scorePercentage}%
                  </div>
                  <p className={`${isPerfectScore ? 'text-primary/80 font-semibold' : 'text-muted-foreground'}`}>
                    {isPerfectScore ? "🌟 Absolutely Amazing! 🌟" :
                     scorePercentage >= 80 ? "Excellent work!" : 
                     scorePercentage >= 60 ? "Good job!" : 
                     "Keep practicing!"}
                  </p>
                  
                  {isPerfectScore && (
                    <div className="mt-4 flex justify-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 text-primary fill-current animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={handleRetakeQuiz}
                    className={`flex items-center gap-2 ${isPerfectScore ? 'bg-primary hover:bg-primary/90 text-white shadow-lg' : ''}`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {isPerfectScore ? 'Try Again?' : 'Retake Quiz'}
                  </Button>
                  {mode === 'default' && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/')}
                      className={isPerfectScore ? 'border-primary text-primary hover:bg-primary/5' : ''}
                    >
                      Back to Home
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getAnswerStyle = (option: string) => {
    if (!quizState.showAnswer) {
      return option === quizState.selectedAnswer 
        ? "bg-primary/20 border-2 border-primary text-primary font-medium shadow-md" 
        : "bg-card hover:bg-muted border-2 border-border text-foreground hover:border-primary/40 hover:shadow-sm";
    }

    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === quizState.selectedAnswer;
    
    if (isCorrect) {
      return "bg-green-100 border-2 border-green-400 text-green-900 animate-scale-in font-semibold shadow-md";
    }
    
    if (isSelected && !isCorrect) {
      return "bg-red-100 border-2 border-red-400 text-red-900 animate-scale-in font-medium shadow-md";
    }
    
    return "bg-muted/50 border-2 border-border text-muted-foreground";
  };

  const getAnswerIcon = (option: string) => {
    if (!quizState.showAnswer) return null;
    
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === quizState.selectedAnswer;
    
    if (isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    if (isSelected && !isCorrect) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    
    return null;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {mode === 'default' && (
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {quizState.currentQuestionIndex + 1} / {questions.length}
                </div>
              )}
            </div>
            
            {mode === 'default' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate('/')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Return to Home</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8 w-full">
            <Progress value={progress} className="h-2 bg-muted/50 w-full" />
          </div>

          {/* Question and Options Card */}
          <div className="w-full">
            <Card className="border border-primary/30 shadow-xl bg-card/80 backdrop-blur-sm mb-6 hover:border-primary/50 transition-colors duration-300 w-full">
              <CardContent className="p-8">
                {/* Question */}
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Answer Options */}
                <div className="space-y-4 mb-8">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={quizState.showAnswer}
                      className={`w-full p-4 rounded-xl border border-border transition-all duration-300 text-left flex items-center justify-between group ${getAnswerStyle(option)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm lg:text-base font-medium text-gray-800">{option}</span>
                      </div>
                      {getAnswerIcon(option)}
                    </button>
                  ))}
                </div>

                {/* Explanation */}
                {quizState.showAnswer && (
                  <div className="space-y-4 mb-6 animate-fade-in">
                    {/* Correct Answer - Show for fill-in-blank or when answer is revealed */}
                    {(currentQuestion.type === 'fill-in-blank' || currentQuestion.options.length === 0) && currentQuestion.correctAnswer && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Correct Answer
                        </h4>
                        <p className="text-green-800 text-sm font-medium">{currentQuestion.correctAnswer}</p>
                      </div>
                    )}
                    
                    {/* Explanation */}
                    {currentQuestion.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Explanation
                        </h4>
                        <p className="text-blue-800 text-sm font-medium">{currentQuestion.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Button */}
                {quizState.showAnswer && (
                  <div className="flex justify-end animate-fade-in">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleNextQuestion}
                          className="flex items-center gap-2"
                          size="default"
                        >
                          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isLastQuestion ? 'Complete the quiz' : 'Go to next question'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PublicQuiz;
