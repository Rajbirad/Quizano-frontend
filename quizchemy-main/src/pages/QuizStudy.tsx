import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Settings, 
  X, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  RotateCcw,
  Award,
  Share2,
  Trophy,
  Star,
  Sparkles,
  Volume2
} from 'lucide-react';
import { ShareDialog } from '@/components/ShareDialog';

interface Question {
  id: string;
  question: string;
  question_text?: string;
  options: string[];
  correctAnswer: string;
  correct_answer?: string;
  explanation?: string;
  type?: string;
  question_type?: string;
  settings?: string;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: { [key: number]: string };
  showAnswer: boolean;
  quizCompleted: boolean;
  score: number;
  selectedAnswer: string | null;
}

const QuizStudy: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { questions, quizTitle, quizId } = location.state || {};
  
  // Extract quiz ID from URL if not in state
  const quizIdFromUrl = window.location.pathname.split('/').pop();
  const currentQuizId = quizId || (quizIdFromUrl !== 'quiz-study' ? quizIdFromUrl : undefined);
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    showAnswer: false,
    quizCompleted: false,
    score: 0,
    selectedAnswer: null
  });
  
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      toast({
        title: "No quiz data found",
        description: "Please generate a quiz first.",
        variant: "destructive",
      });
      navigate('/app/quiz-preview');
    }
  }, [questions, navigate, toast]);

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return null;
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
    let isCorrect = false;
    
    if (currentQuestion.type === 'Short Answer' || currentQuestion.question_type === 'Short Answer') {
      // For short answer, give credit if user provided any meaningful answer
      isCorrect = quizState.selectedAnswer && quizState.selectedAnswer.trim().length > 0;
    } else if (currentQuestion.type === 'Fill in the Blank' || currentQuestion.question_type === 'Fill in the Blank') {
      // For fill in the blank, check if answer contains the correct answer (case insensitive)
      const userAnswer = (quizState.selectedAnswer || '').trim().toLowerCase();
      const correctAnswer = (
        currentQuestion.correctAnswer ||
        currentQuestion.correct_answer ||
        JSON.parse(currentQuestion.settings || '{}').correct_answer ||
        ''
      ).trim().toLowerCase();
      isCorrect = userAnswer === correctAnswer || userAnswer.includes(correctAnswer);
    } else {
      // For multiple choice/true-false, check exact match
      isCorrect = quizState.selectedAnswer === currentQuestion.correctAnswer;
    }
    
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

  const handleCloseQuiz = () => {
    navigate('/app/quiz');
  };

  const speakQuestion = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question_text || currentQuestion.question);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleCheckAnswer = () => {
    setQuizState(prev => ({
      ...prev,
      showAnswer: true,
      answers: {
        ...prev.answers,
        [prev.currentQuestionIndex]: prev.selectedAnswer || ''
      }
    }));
  };

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
                  <Button 
                    variant="outline" 
                    onClick={handleCloseQuiz}
                  >
                    Back to Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      {currentQuizId && (
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          quizId={currentQuizId}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    onClick={speakQuestion}
                    className="text-white hover:text-white/80 hover:bg-transparent p-2"
                  >
                    <Volume2 style={{ width: '30px', height: '30px' }} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Listen to Question</p>
                </TooltipContent>
              </Tooltip>
              {currentQuizId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsShareDialogOpen(true)}
                      className="text-white hover:text-white/80 hover:bg-transparent p-2"
                    >
                      <Share2 style={{ width: '30px', height: '30px' }} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share Quiz</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  onClick={handleCloseQuiz}
                  className="text-white hover:text-white/80 hover:bg-transparent p-2"
                >
                  <X style={{ width: '35px', height: '35px' }} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close Quiz</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Question Counter and Progress Bar */}
          <div className="mb-8 w-full flex items-center gap-4">
            <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
              {quizState.currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="flex-1 h-2 bg-white/30 rounded-full relative flex items-center">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-indigo-600 rounded-full"
                style={{ left: `calc(${progress}% - 10px)` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="w-full">
            <Card className="border border-primary/30 shadow-xl bg-card/80 backdrop-blur-sm mb-6 hover:border-primary/50 transition-colors duration-300 w-full">
              <CardContent className="p-8">
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
                  {currentQuestion.question_text || currentQuestion.question}
                </h2>

              {/* Answer Options */}
              <div className="space-y-4 mb-8">
                {(currentQuestion.type === 'Short Answer' || currentQuestion.question_type === 'Short Answer') ? (
                  // Short Answer Input
                  <div className="space-y-4">
                    <textarea
                      value={quizState.selectedAnswer || ''}
                      onChange={(e) => setQuizState(prev => ({ ...prev, selectedAnswer: e.target.value }))}
                      disabled={quizState.showAnswer}
                      placeholder="Type your answer here..."
                      className={`w-full p-4 text-sm sm:text-base rounded-lg border transition-all duration-200 min-h-[120px] resize-none
                        ${quizState.showAnswer 
                          ? 'bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'
                        }`}
                      rows={4}
                    />
                    {!quizState.showAnswer && quizState.selectedAnswer && quizState.selectedAnswer.trim().length > 0 && (
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCheckAnswer}
                          className="flex items-center gap-2"
                        >
                          Check Answer
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {quizState.showAnswer && currentQuestion.correctAnswer && (
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <h4 className="font-medium text-green-600 mb-2">Correct Answer:</h4>
                        <p className="text-green-600 font-medium whitespace-pre-wrap">{currentQuestion.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                ) : (currentQuestion.type === 'Fill in the Blank' || currentQuestion.question_type === 'Fill in the Blank') ? (
                  // Fill in the Blank Input
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={quizState.selectedAnswer || ''}
                      onChange={(e) => setQuizState(prev => ({ ...prev, selectedAnswer: e.target.value }))}
                      disabled={quizState.showAnswer}
                      placeholder="Your Answer..."
                      className={`w-full p-4 text-sm sm:text-base rounded-lg border transition-all duration-200
                        ${quizState.showAnswer 
                          ? 'bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'
                        }`}
                    />
                    {!quizState.showAnswer && quizState.selectedAnswer && quizState.selectedAnswer.trim().length > 0 && (
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCheckAnswer}
                          className="flex items-center gap-2"
                        >
                          Check Answer
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {quizState.showAnswer && (
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <h4 className="font-medium text-green-600 mb-2">Correct Answer:</h4>
                        <p className="text-green-600 font-medium">
                          {currentQuestion.correctAnswer ||
                           currentQuestion.correct_answer ||
                           JSON.parse(currentQuestion.settings || '{}').correct_answer ||
                           'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Multiple Choice Options
                  currentQuestion.options.map((option, index) => (
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
                  ))
                )}
              </div>

              {/* Explanation */}
              {quizState.showAnswer && currentQuestion.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-fade-in">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Explanation
                  </h4>
                  <p className="text-blue-800 text-sm font-medium">{currentQuestion.explanation}</p>
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

export default QuizStudy;