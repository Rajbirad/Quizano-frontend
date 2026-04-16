
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Copy, Eye, EyeOff, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface QuestionProps {
  question: {
    id: string;
    type: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
  };
  number: number;
}

export const QuestionPreview: React.FC<QuestionProps> = ({ question, number }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  
  const handleCopy = () => {
    const textToCopy = `Q${number}: ${question.question}\n` + 
      (question.options ? 
        question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n') + '\n' : '') +
      `Answer: ${question.correctAnswer}\n` +
      (question.explanation ? `Explanation: ${question.explanation}` : '');
      
    navigator.clipboard.writeText(textToCopy);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">Question {number}</h3>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="mb-4 text-lg">{question.question}</p>
        
        {question.type === 'multiple-choice' && question.options && (
          <RadioGroup 
            value={selectedAnswer} 
            onValueChange={setSelectedAnswer}
            className="space-y-2"
          >
            {question.options.map((option, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent/30 ${
                  option === question.correctAnswer ? 'border border-green-500' : ''
                }`}
              >
                <RadioGroupItem value={option} id={`q${question.id}-opt-${index}`} />
                <Label 
                  htmlFor={`q${question.id}-opt-${index}`}
                  className="flex-grow cursor-pointer"
                >
                  {option}
                </Label>
                {option === question.correctAnswer && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))}
          </RadioGroup>
        )}
        
        {question.type === 'true-false' && (
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent/30 
              ${question.correctAnswer === 'True' ? 'border border-green-500' : ''}`}
            >
              <RadioGroupItem value="True" id={`q${question.id}-true`} />
              <Label htmlFor={`q${question.id}-true`}>True</Label>
              {question.correctAnswer === 'True' && <Check className="h-4 w-4 text-green-500" />}
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent/30 
              ${question.correctAnswer === 'False' ? 'border border-green-500' : ''}`}
            >
              <RadioGroupItem value="False" id={`q${question.id}-false`} />
              <Label htmlFor={`q${question.id}-false`}>False</Label>
              {question.correctAnswer === 'False' && <Check className="h-4 w-4 text-green-500" />}
            </div>
          </div>
        )}
        
        {question.type === 'checkbox' && question.options && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div 
                key={index}
                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent/30 ${
                  question.correctAnswer.includes(option) ? 'border border-green-500' : ''
                }`}
              >
                <Checkbox 
                  id={`q${question.id}-check-${index}`} 
                  checked={checked}
                  onCheckedChange={() => setChecked(!checked)}
                />
                <Label 
                  htmlFor={`q${question.id}-check-${index}`}
                  className="flex-grow cursor-pointer"
                >
                  {option}
                </Label>
                {question.correctAnswer.includes(option) && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {question.type === 'fill-blank' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Enter your answer..." 
                value={fillBlankAnswer}
                onChange={(e) => setFillBlankAnswer(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Correct answer:</span>
              <span className="text-green-600 font-medium">{question.correctAnswer}</span>
            </div>
          </div>
        )}
        
        {question.explanation && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2"
            >
              {showExplanation ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Explanation
                </>
              ) : (
                <>
                  <Info className="h-4 w-4" />
                  Show Explanation
                </>
              )}
            </Button>
            
            {showExplanation && (
              <div className="mt-2 p-3 bg-accent/20 rounded-md">
                <p className="text-sm">{question.explanation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
