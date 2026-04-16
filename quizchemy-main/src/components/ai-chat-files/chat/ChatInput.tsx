import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  selectedFileName?: string | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSendMessage,
  isLoading,
  selectedFileName,
}) => {
  return (
    <div className="flex w-full items-center space-x-2 overflow-x-hidden">
      <div className="relative w-full overflow-x-hidden">
        <Input 
          placeholder={selectedFileName ? `Ask about ${selectedFileName}...` : "Type a message to start chatting..."} 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }} 
          disabled={isLoading} 
          className="pr-12 rounded-full px-4 py-6 h-12 bg-accent/30 border-primary/20 focus-visible:ring-primary/40" 
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || input.trim() === ''} 
          className="absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full h-9 w-9 bg-primary hover:bg-primary/90" 
          size="icon"
        >
          <SendHorizontal className="h-4 w-4 text-primary-foreground" />
        </Button>
      </div>
    </div>
  );
};