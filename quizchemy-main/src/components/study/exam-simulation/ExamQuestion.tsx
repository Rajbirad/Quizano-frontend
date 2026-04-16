
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { ExamQuestionProps } from './types';

export const ExamQuestion: React.FC<ExamQuestionProps> = ({
  card,
  showAnswer,
  onAnswer
}) => {
  return (
    <Card className="border border-primary/20 shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded mr-2 text-sm">Question</span>
        </h3>
        <div className="p-6 bg-muted/30 rounded-lg min-h-[120px] shadow-inner">
          <p className="text-lg font-medium">{card.question}</p>
        </div>
        
        {showAnswer && (
          <div className="mt-6 animate-fade-in">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded mr-2 text-sm">Answer</span>
            </h3>
            <div className="p-6 bg-green-50 text-green-900 rounded-lg min-h-[120px] shadow-inner">
              <p className="text-lg font-medium">{card.answer}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ExamAnswerButtons: React.FC<{ onAnswer: (text: string) => void }> = ({ onAnswer }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <Button 
        onClick={() => onAnswer("I know this")}
        className="h-20 flex flex-col bg-green-500 hover:bg-green-600 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      >
        <CheckCircle className="h-6 w-6 mb-1" />
        <span className="font-medium">I know this</span>
      </Button>
      
      <Button 
        onClick={() => onAnswer("I don't know")}
        className="h-20 flex flex-col bg-red-500 hover:bg-red-600 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      >
        <XCircle className="h-6 w-6 mb-1" />
        <span className="font-medium">I don't know</span>
      </Button>
    </div>
  );
};
