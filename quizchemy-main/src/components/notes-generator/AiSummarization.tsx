
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, ListChecks, AlignLeft, CheckCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { 
  generateBulletSummary, 
  generateParagraphSummary, 
  generateActionSummary 
} from '@/lib/ai-services';

interface AiSummarizationProps {
  noteContent: string;
  onApplySummary: (summary: string) => void;
}

export const AiSummarization: React.FC<AiSummarizationProps> = ({
  noteContent,
  onApplySummary,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryType, setSummaryType] = useState<'bullet' | 'paragraph' | 'action'>('bullet');
  
  const generateSummary = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Empty note",
        description: "Please add some content to your note first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let summary = '';
      
      switch (summaryType) {
        case 'bullet':
          summary = await generateBulletSummary(noteContent);
          break;
        case 'paragraph':
          summary = await generateParagraphSummary(noteContent);
          break;
        case 'action':
          summary = await generateActionSummary(noteContent);
          break;
      }
      
      onApplySummary(summary);
      
      toast({
        title: "Summary generated",
        description: `${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} summary has been created.`
      });
    } catch (error) {
      toast({
        title: "Failed to generate summary",
        description: "An error occurred while generating the summary.",
        variant: "destructive"
      });
      console.error("Summary generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-gray-200 flex items-center"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            AI Summarize
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem 
            onClick={() => {
              setSummaryType('bullet');
              generateSummary();
            }}
            className="flex items-center"
          >
            <ListChecks className="h-4 w-4 mr-2" />
            Bullet Summary
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              setSummaryType('paragraph');
              generateSummary();
            }}
            className="flex items-center"
          >
            <AlignLeft className="h-4 w-4 mr-2" />
            Paragraph Summary
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              setSummaryType('action');
              generateSummary();
            }}
            className="flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Action-Oriented Summary
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
