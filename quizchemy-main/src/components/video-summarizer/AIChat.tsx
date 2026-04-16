
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVideoContext } from './VideoContext';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';
import { fetchVideoConversation } from './utils/videoConversationApi';

// Define the message type with a proper type for sender
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot'; // Using a union type for sender
  timestamp: Date;
}

interface AIChatProps {
  videoId: string;
  initialSuggestions?: any[];
}

export const AIChat: React.FC<AIChatProps> = ({ videoId, initialSuggestions = [] }) => {
  const { isProcessing, conversationId } = useVideoContext();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>(initialSuggestions);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! I can answer questions about this video. What would you like to know?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    setSuggestions(initialSuggestions);
    console.log('🎯 AI suggestions updated in chat:', initialSuggestions);
  }, [initialSuggestions]);

  // Load conversation history when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      // Clear messages when starting a new conversation (keep initial bot message)
      setMessages([
        {
          id: '1',
          content: 'Hi! I can answer questions about this video. What would you like to know?',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [conversationId]);

  const loadConversation = async (convId: string) => {
    try {
      setIsLoadingConversation(true);
      const conversation = await fetchVideoConversation(convId);
      
      // Convert API messages to our Message format
      // Each message has a question and an answer
      const loadedMessages: Message[] = [];
      
      conversation.messages.forEach((msg) => {
        // Add user question
        loadedMessages.push({
          id: `${msg.id}-question`,
          content: msg.question,
          sender: 'user',
          timestamp: new Date(msg.timestamp)
        });
        
        // Add bot answer if it exists
        if (msg.answer) {
          loadedMessages.push({
            id: `${msg.id}-answer`,
            content: msg.answer,
            sender: 'bot',
            timestamp: new Date(msg.timestamp)
          });
        }
      });
      
      setMessages(loadedMessages);
      console.log('📹 Loaded conversation messages:', loadedMessages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingConversation(false);
    }
  };
  
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;
    if (!videoId) {
      const error = 'No video selected. Please upload a video first.';
      console.error(error);
      setError(error);
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return;
    }
    setError(null);
    
    // Clear suggestions when user starts chatting
    setSuggestions([]);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: 'user',
      timestamp: new Date()
    };
    
    console.log('Preparing to send chat message for video:', videoId);
    console.log('Message content:', textToSend);
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setError(null);
    
    try {
      console.log('Sending chat request for video:', videoId);
      
      const formData = new FormData();
      formData.append('video_id', videoId);
      formData.append('question', textToSend);

      // Add the video file if available from context
      const videoBase64 = localStorage.getItem('currentVideo');
      if (videoBase64) {
        try {
          // Convert base64 back to blob
          const binaryString = atob(videoBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'video/mp4' });
          const file = new File([blob], 'video.mp4', { type: 'video/mp4' });
          formData.append('file', file);
          console.log('Adding video file to chat request:', {
            name: file.name,
            size: file.size,
            type: file.type
          });
        } catch (error) {
          console.error('Error preparing video file:', error);
        }
      } else {
        console.log('No video file found in localStorage');
      }

      // Call the API
      const response = await makeAuthenticatedFormRequest(
        `${import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000'}/api/chat-video`,
        formData
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const data = await response.json();
      if (!data) {
        throw new Error('No data returned from API');
      }
      
      // Check if response is task-based (async processing)
      if (data.task_id && data.status === 'processing') {
        console.log('📊 Video chat task queued, polling for result:', data.task_id);
        
        // Poll for task completion
        pollVideoTaskStatus(data.task_id, (answer) => {
          const botMessage: Message = {
            id: Date.now().toString(),
            content: answer,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setIsSending(false);
        });
      } else {
        // Direct response (legacy behavior)
        const botMessage: Message = {
          id: Date.now().toString(),
          content: data.response || data.answer || 'No answer available',
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsSending(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
      toast({
        title: "Error",
        description: err.message || 'Failed to get response',
        variant: "destructive",
      });
      setIsSending(false);
    }
  };

  // Poll for video task status
  const pollVideoTaskStatus = async (
    taskId: string,
    callback: (answer: string) => void,
    maxAttempts: number = 60,
    interval: number = 1000
  ) => {
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        console.log(`📊 Polling video task status (attempt ${attempts}/${maxAttempts}): ${taskId}`);

        const response = await makeAuthenticatedRequest(
          `${import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000'}/api/task-status/${taskId}`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error(`Task status check failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📊 Video task status response:', data);

        // Check if processing is complete
        if (data.status === 'completed' && data.answer) {
          callback(data.answer);
          return;
        }

        // Check if there was an error
        if (data.status === 'failed' || data.status === 'error') {
          callback(data.message || 'Failed to process your question');
          return;
        }

        // Still processing, continue polling
        if (data.status === 'processing' && attempts < maxAttempts) {
          setTimeout(poll, interval);
          return;
        }

        // Max attempts reached
        if (attempts >= maxAttempts) {
          callback('Request timed out. Please try again.');
          setIsSending(false);
        }
      } catch (err: any) {
        console.error('❌ Error polling video task status:', err);
        callback(`Error checking status: ${err?.message || String(err)}`);
        setIsSending(false);
      }
    };

    poll();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 py-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${message.sender === 'user' ? 'bg-primary' : 'bg-primary/10'} flex items-center justify-center`}>
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div 
                  className={`rounded-xl p-3 text-sm ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent/50 border border-border/30'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-xl p-3 bg-accent/50 border border-border/30">
                  <div className="flex space-x-1 items-center h-5">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* AI Suggestions Section - Full text with line wrapping */}
      {suggestions.length > 0 && (
        <div className="px-3 py-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => {
              const text = suggestion.text || suggestion;
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-sm h-auto py-2 px-3 rounded-full bg-background/50 hover:bg-accent border-primary/20 text-muted-foreground hover:text-foreground whitespace-normal text-left break-words leading-relaxed min-h-[2rem]"
                  onClick={() => {
                    setSuggestions([]); // Clear suggestions immediately
                    sendMessage(text); // Send the full original text
                  }}
                >
                  {text}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="p-3 mt-auto">
        <div className="relative">
          <Input
            placeholder="Ask about this video..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing || isSending}
            className="pr-12 rounded-full px-4 py-6 h-12 bg-accent/30 border-primary/20 focus-visible:ring-primary/40"
          />
          <Button 
            size="icon" 
            onClick={() => sendMessage()} 
            disabled={isProcessing || isSending || !input.trim()}
            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};
