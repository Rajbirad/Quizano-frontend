
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/lib/types';
import { Check, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface QuizModeProps {
  card: Flashcard;
  allCards: Flashcard[];
  onCorrectAnswer: () => void;
  onIncorrectAnswer: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  card,
  allCards,
  onCorrectAnswer,
  onIncorrectAnswer
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [quizType, setQuizType] = useState<'multiple-choice' | 'fill-in-blank'>('multiple-choice');
  const [options, setOptions] = useState<string[]>([]);
  
  // Determine quiz type randomly or based on card content
  useEffect(() => {
    // 70% chance for multiple choice, 30% for fill in blank
    const newQuizType = Math.random() > 0.3 ? 'multiple-choice' : 'fill-in-blank';
    setQuizType(newQuizType);
    
    // Reset state when card changes
    setSelectedAnswer('');
    setInputAnswer('');
    setShowFeedback(false);
    
    // Generate multiple choice options if needed
    if (newQuizType === 'multiple-choice') {
      // Get random cards for wrong answers, ensuring no duplicates
      const incorrectOptions = [...allCards]
        .filter(c => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.answer);
      
      // Combine with correct answer and shuffle
      const allOptions = [...incorrectOptions, card.answer]
        .sort(() => Math.random() - 0.5);
      
      setOptions(allOptions);
    }
  }, [card.id, allCards]);
  
  const checkAnswer = () => {
    let correct = false;
    
    if (quizType === 'multiple-choice') {
      correct = selectedAnswer === card.answer;
    } else {
      // For fill-in-blank, do a more flexible check (case insensitive, trim spaces)
      const normalizedInput = inputAnswer.toLowerCase().trim();
      const normalizedAnswer = card.answer.toLowerCase().trim();
      correct = normalizedInput === normalizedAnswer;
    }
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Wait a bit before proceeding to next card
    setTimeout(() => {
      if (correct) {
        onCorrectAnswer();
      } else {
        onIncorrectAnswer();
      }
      
      // Reset for next question
      setShowFeedback(false);
      setSelectedAnswer('');
      setInputAnswer('');
    }, 1500);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-6 shadow-lg border-primary/20">
        <CardHeader className="pb-3 text-center">
          <h3 className="text-2xl font-bold mb-2">
            {quizType === 'multiple-choice' ? 'Choose the correct answer' : 'Fill in the Blank'}
          </h3>
          <p className="text-muted-foreground">Test your knowledge</p>
        </CardHeader>
        
        <CardContent className="py-6">
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-center mb-6">{card.question}</h4>
            
            {/* Card media if available */}
            {card.media && (
              <div className="mb-6 flex justify-center">
                {card.media.type === 'image' && (
                  <img 
                    src={card.media.url} 
                    alt="Question image" 
                    className="max-h-60 rounded-md object-contain"
                  />
                )}
              </div>
            )}
            
            {/* Answer input based on quiz type */}
            {quizType === 'multiple-choice' ? (
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="mt-6 space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer w-full font-medium">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="mt-6">
                <Label htmlFor="answer-input" className="text-lg font-medium mb-2 block">Your answer:</Label>
                <Input
                  id="answer-input"
                  placeholder="Type your answer here..."
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  className="mt-2 p-4 text-lg"
                />
              </div>
            )}
          </div>
          
          {/* Feedback area */}
          {showFeedback && (
            <div className={`p-4 rounded-md mb-6 text-center ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex justify-center items-center gap-2">
                {isCorrect ? (
                  <>
                    <Check className="h-6 w-6 text-green-600" />
                    <span className="text-lg font-medium">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="h-6 w-6 text-red-600" />
                    <span className="text-lg font-medium">Incorrect. The correct answer is: {card.answer}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pt-4">
          <Button 
            onClick={checkAnswer} 
            disabled={quizType === 'multiple-choice' ? !selectedAnswer : !inputAnswer.trim() || showFeedback}
            className="w-full py-6 text-lg"
            size="lg"
          >
            Check Answer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
