import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFileContext } from '../FileContext';
import { useToast } from '@/hooks/use-toast';
import { processUserQuery, downloadMessageContent } from '../utils/chatHelpers';
import { Message } from '../types';
import { ChatWelcome } from './ChatWelcome';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

export const ChatInterface: React.FC = () => {
  const { selectedFile, documentMetadata } = useFileContext();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt);
    handleSendMessage(prompt);
  };

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || input;
    if (messageToSend.trim() === '') return;

    if (!selectedFile) {
      return;
    }

    const newUserMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content: messageToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput('');
    setIsLoading(true);
    
    // Process the user's query
    processUserQuery(messageToSend, selectedFile, (response) => {
      setMessages((prevMessages) => [...prevMessages, response]);
      setIsLoading(false);
    });
  };

  const handleDownload = (message: Message) => {
    const fileName = downloadMessageContent(message);
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Ask Anything About This Document</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/icons/AIBot.svg" alt="" className="h-6 w-6" />
          <p className="text-muted-foreground">AI assistant ready to help</p>
        </div>
      </div>



      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-hidden p-0">
          {messages.length === 0 ? (
            <ChatWelcome 
              onStarterPrompt={handleStarterPrompt}
              suggestions={documentMetadata?.ai_chat_suggestions}
              isLoading={isLoading}
            />
          ) : (
            <ChatMessages 
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              onDownload={handleDownload}
            />
          )}
        </CardContent>
      </Card>

      <div>
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={() => handleSendMessage()}
          isLoading={isLoading}
          selectedFileName={selectedFile?.name}
        />
      </div>
    </div>
  );
};