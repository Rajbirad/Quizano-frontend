import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TransformedSimilarQuestion } from '@/lib/types/similar-questions';

interface QuestionCardProps {
  question: TransformedSimilarQuestion;
  number: number;
  showSimilarityScore?: boolean;
}

export const SimilarQuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  number, 
  showSimilarityScore 
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {showSimilarityScore && question.similarityScore && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Similarity: {(question.similarityScore * 100).toFixed(0)}%
            </span>
            <Progress value={question.similarityScore * 100} className="w-24" />
          </div>
        )}
        <h3 className="font-medium mb-4">
          Question {number}: {question.question}
        </h3>
        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/40">
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )}
        {question.explanation && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};