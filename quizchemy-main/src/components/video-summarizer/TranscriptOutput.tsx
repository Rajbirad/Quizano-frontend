
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, Download, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVideoContext } from './VideoContext';

interface TranscriptOutputProps {
  videoId: string;
}

export const TranscriptOutput: React.FC<TranscriptOutputProps> = ({ videoId }) => {
  const { isProcessing } = useVideoContext();
  const { toast } = useToast();
  const [transcript, setTranscript] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  const generateTranscript = () => {
    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setTranscript(`[00:00:00] Introduction to the topic
[00:01:15] First main point discussion begins
[00:03:42] Expert opinion is presented
[00:05:30] Second main concept introduced
[00:08:20] Comparison between different approaches
[00:10:55] Case study examples
[00:12:30] Key takeaway points
[00:14:15] Conclusion and final thoughts`);
      setIsGenerating(false); 
    }, 2500);
  };
  
  const copyToClipboard = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      toast({
        title: "Copied to clipboard",
        description: "Transcript has been copied to your clipboard"
      });
    }
  };
  
  const downloadTranscript = () => {
    if (transcript) {
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video-transcript.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Transcript downloaded",
        description: "Your transcript has been downloaded as a text file"
      });
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Video Transcript</CardTitle>
        {transcript && (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Clipboard className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={downloadTranscript}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isProcessing || isGenerating ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-pulse flex space-x-2 mb-4">
              <div className="h-3 w-3 bg-primary rounded-full"></div>
              <div className="h-3 w-3 bg-primary rounded-full"></div>
              <div className="h-3 w-3 bg-primary rounded-full"></div>
            </div>
            <p className="text-muted-foreground">Transcribing video content...</p>
          </div>
        ) : transcript ? (
          <div className="prose dark:prose-invert max-w-full">
            <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto">
              {transcript}
            </pre>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Generate a transcript to see the spoken content of this video
            </p>
            <Button onClick={generateTranscript}>
              <Search className="h-4 w-4 mr-2" />
              Generate Transcript
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
