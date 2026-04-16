
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface TextInputTabProps {
  inputText: string;
  setInputText: (text: string) => void;
  renderMediaPreview: () => React.ReactNode;
  selectedSubject?: string;
}

export const TextInputTab: React.FC<TextInputTabProps> = ({ 
  inputText, 
  setInputText, 
  renderMediaPreview,
  selectedSubject = 'General'
}) => {
  return (
    <Card className="figma-card">
      <CardHeader>
        <CardTitle>Text Input</CardTitle>
        <CardDescription>
          Enter your text to generate {selectedSubject} flashcards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={`Enter text for ${selectedSubject} flashcards. You can include paragraphs, lists, or key points.`}
          className="min-h-[200px] resize-none"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </CardContent>
    </Card>
  );
};
