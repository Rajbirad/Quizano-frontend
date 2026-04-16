
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Bot, AlignLeft, List, Sparkles, Languages } from 'lucide-react';
import { useFileContext } from './FileContext';
import { useToast } from '@/hooks/use-toast';
import { processUserQuery, downloadMessageContent } from './utils/chatHelpers';
import { Message, QuickAction } from './types';
import { ChatWelcome } from './chat/ChatWelcome';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { fetchConversation } from './utils/conversationApi';

export const ChatInterface: React.FC = () => {
  const { selectedFile, documentMetadata, conversationId } = useFileContext();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Get suggestions from metadata
  const suggestions = documentMetadata?.ai_chat_suggestions || [];

  // Log metadata and suggestions on mount and when they change
  useEffect(() => {
    console.log('🔍 ChatInterface metadata:', {
      hasMetadata: !!documentMetadata,
      metadata: documentMetadata,
      hasSuggestions: Array.isArray(documentMetadata?.ai_chat_suggestions),
      suggestionCount: documentMetadata?.ai_chat_suggestions?.length,
      suggestions: documentMetadata?.ai_chat_suggestions
    });
  }, [documentMetadata]);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    { 
      id: 'summary', 
      name: 'Summarize', 
      icon: <AlignLeft className="h-4 w-4" />, 
      prompt: 'Summarize this document.'
    },
    { 
      id: 'keypoints', 
      name: 'Key Points', 
      icon: <List className="h-4 w-4" />, 
      prompt: 'Extract the key points from this document.'
    },
    { 
      id: 'translate', 
      name: 'Translate', 
      icon: <Languages className="h-4 w-4" />, 
      prompt: 'Translate this document to Spanish.'
    }
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      // Clear messages when starting a new conversation
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      const conversation = await fetchConversation(convId);
      
      // Convert API messages to our Message format
      // Each message has a question and optionally an answer
      const loadedMessages: Message[] = [];
      
      conversation.messages.forEach((msg) => {
        // Add user question
        loadedMessages.push({
          id: `${msg.id}-question`,
          content: msg.question,
          sender: 'user',
          timestamp: new Date(msg.timestamp),
          type: 'text'
        });
        
        // Add bot answer if it exists
        if (msg.answer) {
          loadedMessages.push({
            id: `${msg.id}-answer`,
            content: msg.answer,
            sender: 'bot',
            timestamp: new Date(msg.timestamp),
            type: 'text'
          });
        }
      });
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (!selectedFile) {
      return;
    }
    
    setInput(action.prompt);
    handleSendMessage(action.prompt);
  };

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
      type: 'text'
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
    <Card className="h-full flex flex-col overflow-hidden overflow-x-hidden shadow-lg border-primary/20 bg-background/70 backdrop-blur-sm">
      <CardContent className="flex-1 overflow-hidden overflow-x-hidden p-0">
        {messages.length === 0 ? (
          <ChatWelcome 
            onStarterPrompt={handleStarterPrompt}
            suggestions={suggestions.map(s => typeof s === 'string' ? { text: s } : s)}
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
      <CardFooter className="pt-2 px-4 pb-4 overflow-x-hidden">
        <ChatInput 
          input={input}
          setInput={setInput}
          handleSendMessage={() => handleSendMessage()}
          isLoading={isLoading}
          selectedFileName={selectedFile?.name}
        />
      </CardFooter>
    </Card>
  );
};
