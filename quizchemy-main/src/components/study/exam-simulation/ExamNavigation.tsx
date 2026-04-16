
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { ExamNavigationProps } from './types';

export const ExamNavigation: React.FC<ExamNavigationProps> = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  isReviewMode = false,
  nextButtonText
}) => {
  return (
    <div className="flex justify-between mt-4">
      <Button 
        onClick={onPrevious} 
        disabled={currentIndex === 0}
        variant="outline"
        className="px-6 py-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <Button 
        onClick={onNext}
        className="px-6 py-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
      >
        {nextButtonText || (currentIndex === totalQuestions - 1 ? (
          <>
            Finish Exam
            <CheckCircle className="h-4 w-4 ml-1" />
          </>
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        ))}
      </Button>
    </div>
  );
};
