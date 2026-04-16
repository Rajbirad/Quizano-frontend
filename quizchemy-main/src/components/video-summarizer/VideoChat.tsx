import React, { useState } from 'react';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoChatProps {
  videoId: string;
}

export const VideoChat: React.FC<VideoChatProps> = ({ videoId }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !videoId) return;

    const userQuestion = question.trim();
    setQuestion('');
    setIsLoading(true);

    // Add user's question to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);

    try {
      // Make API request
      const formData = new FormData();
      formData.append('video_id', videoId);
      formData.append('question', userQuestion);

      const response = await makeAuthenticatedFormRequest(
        'https://127.0.0.1:8000/api/chat-video',
        formData
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      const answer = data.response || data.answer;

      // Add AI's response to chat
      setChatHistory(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive"
      });

      // Remove user's question if there was an error
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full p-4">
      {/* Chat History */}
      <div className="flex-1 overflow-auto mb-4 space-y-4">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                : 'bg-muted mr-auto max-w-[80%]'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the video..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !question.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Card>
  );
};
