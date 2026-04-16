
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface SettingsTabProps {
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedFormat: string;
  setSelectedFormat: (format: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  selectedDifficulty,
  setSelectedDifficulty,
  selectedFormat,
  setSelectedFormat
}) => {
  const difficultyLevels = ["Basic", "Standard", "Advanced", "Expert"];
  const cardFormats = ["Q&A", "Fill-in", "True/False", "Definition"];
  
  return (
    <Card className="figma-card">
      <CardHeader>
        <CardTitle>Generation Settings</CardTitle>
        <CardDescription>
          Customize how your flashcards are generated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 flex flex-col gap-2">
            <h3 className="font-medium">Difficulty Level</h3>
            <div className="flex flex-wrap gap-2">
              {difficultyLevels.map((level) => (
                <Button
                  key={level}
                  variant="outline"
                  className={level === selectedDifficulty ? "bg-primary/10 border-primary/30" : ""}
                  onClick={() => setSelectedDifficulty(level)}
                >
                  {level === selectedDifficulty && <Check className="h-3 w-3 mr-1" />}
                  {level}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="border rounded-lg p-4 flex flex-col gap-2">
            <h3 className="font-medium">Card Format</h3>
            <div className="flex flex-wrap gap-2">
              {cardFormats.map((format) => (
                <Button
                  key={format}
                  variant="outline"
                  className={format === selectedFormat ? "bg-primary/10 border-primary/30" : ""}
                  onClick={() => setSelectedFormat(format)}
                >
                  {format === selectedFormat && <Check className="h-3 w-3 mr-1" />}
                  {format}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
