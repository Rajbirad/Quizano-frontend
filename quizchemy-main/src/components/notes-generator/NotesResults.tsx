import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, FileText, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotesResultsProps {
  notes: string;
  onStartOver: () => void;
}

export const NotesResults: React.FC<NotesResultsProps> = ({ notes, onStartOver }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        description: 'Notes copied to clipboard!',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy notes',
        variant: 'destructive',
      });
    }
  };

  const downloadNotes = () => {
    const blob = new Blob([notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-generated-notes.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      description: 'Notes downloaded successfully!',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="relative">
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button 
            onClick={handleCopy} 
            className="p-2 hover:bg-accent rounded-full transition-colors duration-200"
            title="Copy notes"
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />}
          </button>
          <button 
            onClick={downloadNotes} 
            className="p-2 hover:bg-accent rounded-full transition-colors duration-200"
            title="Download notes"
          >
            <Download className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Notes
              </CardTitle>
              <CardDescription>
                Your AI-powered notes are ready
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onStartOver}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
              {notes}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};