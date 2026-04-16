
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Suggestion {
  text: string;
  type?: string;
}

interface ChatWelcomeProps {
  onStarterPrompt?: (prompt: string) => void;
  suggestions?: Suggestion[];
  isLoading?: boolean;
}

import { useFileContext } from '../FileContext';
import FileUpload from '../components/FileUpload';

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({ 
  onStarterPrompt, 
  suggestions = [], 
  isLoading = false 
}) => {
  const { selectedFile } = useFileContext();
  
  // Fallback prompts if no suggestions are provided
  const defaultPrompts = [
    { text: "What is this document about?", type: "question" },
    { text: "Summarize the key message", type: "command" },
    { text: "Explain in simple terms", type: "command" },
    { text: "Extract important data and statistics", type: "command" },
    { text: "List 5 key findings", type: "command" }
  ];

  const displayPrompts = suggestions?.length > 0 ? suggestions : defaultPrompts;

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full p-8 overflow-x-hidden">
        <div className="max-w-md w-full space-y-6 overflow-x-hidden">
          <div className="flex justify-center items-center">
            <img src="/icons/AIBot.svg" alt="" className="h-16 w-16" />
          </div>
          <h2 className="text-2xl font-semibold text-center gradient-text">
            Upload a Document to Start
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Upload a document to chat with AI about its contents
          </p>
          <FileUpload className="max-w-md mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-center p-8 overflow-x-hidden">
      <div className="space-y-6 overflow-x-hidden">
        <div className="flex justify-center items-center">
          <img src="/icons/AIBot.svg" alt="" className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-semibold gradient-text">
          Ask Anything About This Document
        </h2>
        <p className="text-muted-foreground mb-6">
          Try these example questions:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {isLoading ? (
            <div className="text-muted-foreground">Loading suggestions...</div>
          ) : (
            displayPrompts.map((prompt, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors text-left"
                onClick={() => onStarterPrompt?.(prompt.text)}
              >
                {prompt.text}
              </Badge>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
