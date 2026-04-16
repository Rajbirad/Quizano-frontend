import React from 'react';
import { Button } from '@/components/ui/button';
import { TransformedSimilarQuestion } from '@/lib/types/similar-questions';
import { useAsyncSimilarQuestions } from '@/hooks/use-async-similar-questions';
import { useToast } from '@/hooks/use-toast';

interface SimilarQuestionsProps {
  originalQuestion: string;
  onQuestionsGenerated: (questions: TransformedSimilarQuestion[]) => void;
}

export const SimilarQuestions: React.FC<SimilarQuestionsProps> = ({
  originalQuestion,
  onQuestionsGenerated,
}) => {
  const { toast } = useToast();
  const { generateSimilarQuestions, isProcessing, progress, error } = useAsyncSimilarQuestions();

  const handleGenerateSimilarQuestions = async () => {
    try {
      const questions = await generateSimilarQuestions(originalQuestion);
      onQuestionsGenerated(questions);
      toast({
        title: "Success",
        description: "Similar questions generated successfully.",
      });
    } catch (err) {
      console.error('Error generating similar questions:', err);
      toast({
        title: "Error",
        description: error || "Failed to generate similar questions. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGenerateSimilarQuestions} 
        disabled={isProcessing}
      >
        {isProcessing ? progress : 'Generate Similar Questions'}
      </Button>
    </div>
  );
};
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Similar Questions</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateSimilarQuestions}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? 'Generating...' : 'Generate Similar Questions'}
        </Button>
      </div>

      {similarQuestions.length > 0 && (
        <div className="space-y-4">
          {similarQuestions.map((question, index) => (
            <SimilarQuestionCard
              key={question.id}
              question={question}
              number={index + 1}
              showSimilarityScore={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};