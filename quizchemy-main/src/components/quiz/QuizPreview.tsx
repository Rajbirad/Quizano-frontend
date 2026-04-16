import React from 'react';
import { QuestionPreviewCard } from './QuestionPreviewCard';

interface QuizPreviewProps {
  questions: Array<{
    id: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    type?: string;
  }>;
  onEditQuestion?: (index: number) => void;
}

export const QuizPreview: React.FC<QuizPreviewProps> = ({ questions, onEditQuestion }) => {
  const [openQuestionIndex, setOpenQuestionIndex] = React.useState<number | null>(0);

  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto">
      {questions.map((question, index) => (
        <QuestionPreviewCard
          key={question.id}
          question={question}
          number={index + 1}
          onEdit={onEditQuestion ? () => onEditQuestion(index) : undefined}
          isOpen={openQuestionIndex === index}
          onToggle={() => setOpenQuestionIndex(openQuestionIndex === index ? null : index)}
        />
      ))}
    </div>
  );
};