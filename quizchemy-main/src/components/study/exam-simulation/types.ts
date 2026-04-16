
import { Flashcard } from "@/lib/types";

export interface ExamSimulationProps {
  cards: Flashcard[];
  onComplete: (score: number, totalTime: number) => void;
  timeLimit?: number;  // in minutes
}

export interface ExamResultProps {
  score: number;
  totalTime: number;
  totalQuestions: number;
  answeredQuestions: number;
  onReview: () => void;
  onRetry: () => void;
}

export interface ExamQuestionProps {
  card: Flashcard;
  showAnswer: boolean;
  onAnswer: (text: string) => void;
}

export interface ExamReviewProps {
  cards: Flashcard[];
  currentIndex: number;
  answers: Record<string, string>;
  score: number;
  onNext: () => void; 
  onPrevious: () => void;
}

export interface ExamNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  isReviewMode?: boolean;
  nextButtonText?: string;
}

export interface ExamTimerProps {
  timeRemaining: number;
  timeProgress: number;
}

export interface ExamIntroProps {
  timeLimit: number;
  totalQuestions: number;
  onStart: () => void;
}
