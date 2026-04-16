
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Clock, BookOpen, Split, TestTube } from 'lucide-react';

interface StudyModeSelectorProps {
  activeMode: string;
  onModeChange: (mode: 'flashcard' | 'quiz' | 'stats' | 'splitScreen' | 'exam') => void;
}

export const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({ 
  activeMode, 
  onModeChange 
}) => {
  return (
    <div className="mb-8">
      <Tabs value={activeMode} className="w-full">
        <TabsList className="grid grid-cols-5 mb-2">
          <TabsTrigger 
            value="flashcard"
            onClick={() => onModeChange('flashcard')}
            className="flex gap-2 items-center"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Flashcards</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="quiz"
            onClick={() => onModeChange('quiz')}
            className="flex gap-2 items-center"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Quiz</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="splitScreen"
            onClick={() => onModeChange('splitScreen')}
            className="flex gap-2 items-center"
          >
            <Split className="h-4 w-4" />
            <span className="hidden sm:inline">Split View</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="exam"
            onClick={() => onModeChange('exam')}
            className="flex gap-2 items-center"
          >
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Exam</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="stats"
            onClick={() => onModeChange('stats')}
            className="flex gap-2 items-center"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
