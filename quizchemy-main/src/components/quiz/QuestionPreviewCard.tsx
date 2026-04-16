import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { SimilarQuestions } from './SimilarQuestions';
import { TransformedSimilarQuestion } from '@/lib/types/similar-questions';

interface QuestionPreviewCardProps {
  question: {
    id: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    type?: string;
  };
  number: number;
  onEdit?: () => void;
  isEditing?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const QuestionPreviewCard: React.FC<QuestionPreviewCardProps> = ({
  question,
  number,
  onEdit,
  isEditing,
  isOpen,
  onToggle
}) => {
  const [showSimilarQuestions, setShowSimilarQuestions] = React.useState(false);
  const [similarQuestions, setSimilarQuestions] = React.useState<TransformedSimilarQuestion[]>([]);

  const handleSimilarQuestionsGenerated = (questions: TransformedSimilarQuestion[]) => {
    setSimilarQuestions(questions);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium">Question {number}</h3>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-4">
            <div className="mt-4">
              <p className="text-lg">{question.question}</p>

              {question.options && (
                <div className="mt-4 space-y-2">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        option === question.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-border'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}

              {question.explanation && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSimilarQuestions(!showSimilarQuestions)}
                >
                  {showSimilarQuestions ? 'Hide Similar Questions' : 'Show Similar Questions'}
                </Button>

                {showSimilarQuestions && (
                  <div className="mt-4">
                    <SimilarQuestions
                      originalQuestion={question.question}
                      onQuestionsGenerated={handleSimilarQuestionsGenerated}
                    />
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};