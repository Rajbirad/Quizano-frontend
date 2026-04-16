
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Split, GraduationCap } from 'lucide-react';
import { Flashcard } from '@/lib/types';

interface StudyExtraControlsProps {
  currentCard: Flashcard;
  onSplitScreenMode: () => void;
  onExamMode: () => void;
}

export const StudyExtraControls: React.FC<StudyExtraControlsProps> = ({
  onSplitScreenMode,
  onExamMode
}) => {
  return (
    <Card className="border border-primary/20 shadow-md w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-purple-500">
          <Split className="h-5 w-5" />
          Study Modes
        </CardTitle>
        <CardDescription>Enhanced learning options</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-20 transition-all duration-200 border-purple-300 hover:bg-purple-50 hover:text-purple-600 text-purple-500 font-medium hover:scale-105 hover:shadow-md flex flex-col items-center"
          onClick={onSplitScreenMode}
        >
          <Split className="h-5 w-5 mb-2" />
          <span>Split Screen</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 transition-all duration-200 border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-blue-500 font-medium hover:scale-105 hover:shadow-md flex flex-col items-center"
          onClick={onExamMode}
        >
          <GraduationCap className="h-5 w-5 mb-2" />
          <span>Exam Mode</span>
        </Button>
      </CardContent>
    </Card>
  );
};
