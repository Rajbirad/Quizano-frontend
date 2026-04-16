
import React from 'react';
import { Bot, User, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onDownload: (message: Message) => void;
}

// Function to parse and render text with bold formatting
const parseTextWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** markers and make text bold
      const boldText = part.slice(2, -2);
      return (
        <span key={index} className="font-bold">
          {boldText}
        </span>
      );
    }
    return part;
  });
};

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isLoading, 
  messagesEndRef,
  onDownload
}) => {
  return (
    <ScrollArea className="h-full px-6 overflow-x-hidden">
      <div className="space-y-6 py-4 overflow-x-hidden">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex overflow-x-hidden ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm overflow-x-hidden break-words ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent/50 border border-border/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${message.sender === 'user' ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                    {message.sender === 'ai' ? (
                      <Bot className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {message.sender === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>
                {message.sender === 'ai' && message.type && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-primary/10"
                    onClick={() => onDownload(message)}
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-wrap-anywhere">
                {parseTextWithBold(message.content)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start overflow-x-hidden">
            <div className="bg-accent/50 border border-border/30 rounded-2xl p-4 max-w-[80%] shadow-sm overflow-x-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <div className="flex space-x-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
