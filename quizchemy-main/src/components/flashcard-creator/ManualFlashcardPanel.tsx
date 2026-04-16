
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormattingToolbar } from './FormattingToolbar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContentEditor } from './ContentEditor';
import { useToast } from '@/hooks/use-toast';

export const ManualFlashcardPanel = ({ onAddFlashcard }) => {
  const [title, setTitle] = useState('');
  const [frontContent, setFrontContent] = useState('');
  const [backContent, setBackContent] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    // Validate input
    if (!frontContent.trim()) {
      toast({
        title: "Front content required",
        description: "Please add content to the front of your flashcard.",
        variant: "destructive",
      });
      return;
    }
    
    if (!backContent.trim()) {
      toast({
        title: "Back content required",
        description: "Please add content to the back of your flashcard.",
        variant: "destructive",
      });
      return;
    }

    // Create new flashcard
    const newFlashcard = {
      title,
      frontContent,
      backContent
    };
    
    // Pass the new flashcard up to parent
    onAddFlashcard(newFlashcard);
    
    // Clear form
    setTitle('');
    setFrontContent('');
    setBackContent('');
    
    // Show success message
    toast({
      title: "Flashcard created!",
      description: "Your flashcard has been added to the deck.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Flashcard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          placeholder="Enter Flashcard Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium"
        />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Front</label>
            <ContentEditor
              content={frontContent}
              onContentChange={setFrontContent}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Back</label>
            <ContentEditor
              content={backContent}
              onContentChange={setBackContent}
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full hover:scale-[1.02] transition-transform"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Flashcard
        </Button>
      </CardContent>
    </Card>
  );
};
