
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ListTree, Clipboard, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OutlineGeneratorProps {
  inputText: string;
  onOutlineGenerated: (outline: string) => void;
  selectedSubject: string;
}

export const OutlineGenerator: React.FC<OutlineGeneratorProps> = ({
  inputText,
  onOutlineGenerated,
  selectedSubject
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState('');
  const [showOutlineGenerator, setShowOutlineGenerator] = useState(false);

  const generateOutline = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to generate an outline.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      // Create an outline based on the input text
      const paragraphs = inputText.split('\n').filter(p => p.trim());
      let generatedOutline = `# ${selectedSubject} Outline\n\n`;
      
      // Extract main points from paragraphs
      paragraphs.forEach((paragraph, i) => {
        if (paragraph.length > 10) {
          // Extract a title from the first 5-8 words
          const words = paragraph.split(' ');
          const title = words.slice(0, Math.min(6, Math.floor(words.length / 2))).join(' ');
          
          generatedOutline += `## ${i + 1}. ${title}\n`;
          
          // Add 2-3 bullet points per section
          const sentences = paragraph.match(/[^\.!\?]+[\.!\?]+/g) || [paragraph];
          sentences.slice(0, Math.min(3, sentences.length)).forEach((sentence, j) => {
            if (sentence.trim().length > 5) {
              generatedOutline += `- ${sentence.trim()}\n`;
            }
          });
          
          generatedOutline += '\n';
        }
      });

      setOutline(generatedOutline);
      setIsGenerating(false);
    }, 1500);
  };

  const useOutline = () => {
    onOutlineGenerated(outline);
    toast({
      title: "Outline applied",
      description: "The outline has been added to your input text.",
    });
    setShowOutlineGenerator(false);
  };

  const copyOutline = () => {
    navigator.clipboard.writeText(outline);
    toast({
      title: "Copied to clipboard",
      description: "The outline has been copied to your clipboard.",
    });
  };

  if (!showOutlineGenerator) {
    return (
      <Button 
        variant="outline" 
        onClick={() => setShowOutlineGenerator(true)}
        className="mb-4 gap-2"
      >
        <ListTree className="h-4 w-4" />
        Generate Outline First
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTree className="h-5 w-5" />
          Outline Generator
        </CardTitle>
        <CardDescription>
          Generate a structured outline before creating flashcards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!outline ? (
          <div className="space-y-4">
            <Button 
              onClick={generateOutline} 
              disabled={isGenerating || !inputText.trim()}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Outline"}
            </Button>
            
            {isGenerating && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/30 whitespace-pre-wrap font-mono text-sm">
              {outline}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={copyOutline}
              >
                <Clipboard className="h-4 w-4" />
                Copy
              </Button>
              
              <Button 
                className="gap-2 ml-auto"
                onClick={useOutline}
              >
                Use This Outline
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
