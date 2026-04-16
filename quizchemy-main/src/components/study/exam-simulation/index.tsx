
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExamIntro } from './ExamIntro';
import { ExamQuestion, ExamAnswerButtons } from './ExamQuestion';
import { ExamResult } from './ExamResult';
import { ExamReview } from './ExamReview';
import { ExamNavigation } from './ExamNavigation';
import { ExamProgress } from './ExamTimer';
import { ExamSimulationProps } from './types';

export const ExamSimulation: React.FC<ExamSimulationProps> = ({
  cards,
  onComplete,
  timeLimit = 15  // default 15 minutes
}) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // convert to seconds
  const [examCompleted, setExamCompleted] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  // Timer effect
  useEffect(() => {
    if (!examStarted || examCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up!
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });

      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examCompleted]);

  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "Your exam has been submitted automatically.",
      variant: "destructive",
    });
    
    finishExam();
  };

  const startExam = () => {
    // Shuffle cards
    setExamStarted(true);
    toast({
      title: "Exam Started",
      description: `You have ${timeLimit} minutes to complete the exam.`,
    });
  };

  const handleAnswer = (text: string) => {
    if (isReviewing) return;

    setAnswers(prev => ({
      ...prev,
      [cards[currentIndex].id]: text
    }));

    setShowAnswer(true);
  };

  const moveToNext = () => {
    setShowAnswer(false);
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (!isReviewing) {
      finishExam();
    }
  };

  const moveToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(true); // Already answered this one
    }
  };

  const finishExam = () => {
    // Calculate score
    let correctCount = 0;
    const answeredCount = Object.keys(answers).length;
    
    // This is a simplified scoring system - in a real app,
    // you would need more sophisticated answer matching
    correctCount = answeredCount;
    
    const finalScore = Math.round((correctCount / cards.length) * 100);
    setScore(finalScore);
    setExamCompleted(true);
    
    // Call the callback with results
    onComplete(finalScore, totalTime);
  };

  const reviewExam = () => {
    setIsReviewing(true);
    setCurrentIndex(0);
    setShowAnswer(true);
  };

  // Progress percentage
  const progress = ((currentIndex + 1) / cards.length) * 100;
  
  // Time progress
  const timeProgress = ((timeLimit * 60 - timeRemaining) / (timeLimit * 60)) * 100;

  if (!examStarted) {
    return (
      <ExamIntro 
        timeLimit={timeLimit}
        totalQuestions={cards.length}
        onStart={startExam}
      />
    );
  }

  if (examCompleted) {
    return (
      <ExamResult
        score={score}
        totalTime={totalTime}
        totalQuestions={cards.length}
        answeredQuestions={Object.keys(answers).length}
        onReview={reviewExam}
        onRetry={() => window.location.reload()}
      />
    );
  }
  
  if (isReviewing) {
    return (
      <ExamReview
        cards={cards}
        currentIndex={currentIndex}
        answers={answers}
        score={score}
        onNext={moveToNext}
        onPrevious={moveToPrevious}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ExamProgress
        currentIndex={currentIndex}
        totalQuestions={cards.length}
        progress={progress}
        timeProgress={timeProgress}
        timeRemaining={timeRemaining}
      />
      
      <div className="space-y-4">
        <ExamQuestion
          card={cards[currentIndex]}
          showAnswer={showAnswer}
          onAnswer={handleAnswer}
        />
        
        {!showAnswer ? (
          <ExamAnswerButtons onAnswer={handleAnswer} />
        ) : (
          <ExamNavigation
            currentIndex={currentIndex}
            totalQuestions={cards.length}
            onPrevious={moveToPrevious}
            onNext={moveToNext}
          />
        )}
      </div>
    </div>
  );
};
