
import React, { createContext, useContext, useState } from 'react';

export interface FileType {
  id: string;
  name: string;
  type: string;
  content: string;
  size: number;
  originalFile?: File; // Store the original File object for display
  chatData?: {
    document_id: string;
  };
}

interface Suggestion {
  text: string;
  type?: string;
}


interface DocumentMetadata {
  duplicate: boolean;
  original_upload_date: string;
  original_document_name: string;
  file_size: number;
  ai_chat_suggestions?: Suggestion[];
}

interface FileContextType {
  files: FileType[];
  selectedFile: FileType | null;
  isProcessing: boolean;
  currentStep: 'upload' | 'results';
  documentMetadata: DocumentMetadata | null;
  conversationId: string | null;
  addFile: (file: FileType, metadata?: DocumentMetadata) => void;
  removeFile: (id: string) => void;
  setSelectedFile: (file: FileType | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setCurrentStep: (step: 'upload' | 'results') => void;
  clearFiles: () => void;
  setDocumentMetadata: (metadata: DocumentMetadata | null) => void;
  setConversationId: (conversationId: string | null) => void;
  startNewConversation: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

interface FileProviderProps {
  children: React.ReactNode;
  initialFile?: FileType;
  initialMetadata?: DocumentMetadata;
  initialConversationId?: string;
}

export const FileProvider: React.FC<FileProviderProps> = ({ 
  children, 
  initialFile,
  initialMetadata,
  initialConversationId
}) => {
  console.log('FileProvider initializing with:', {
    hasInitialFile: !!initialFile,
    fileName: initialFile?.name,
    hasInitialMetadata: !!initialMetadata,
    suggestions: initialMetadata?.ai_chat_suggestions,
    initialConversationId: initialConversationId
  });

  // Initialize files state
  const [files, setFiles] = useState<FileType[]>(initialFile ? [initialFile] : []);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(initialFile || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'results'>(initialFile ? 'results' : 'upload');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  
  // Log incoming metadata
  console.log('📦 Incoming FileProvider metadata:', {
    hasMetadata: !!initialMetadata,
    metadata: initialMetadata,
    hasSuggestions: Array.isArray(initialMetadata?.ai_chat_suggestions),
    suggestionCount: initialMetadata?.ai_chat_suggestions?.length
  });

  // Ensure we have valid metadata with suggestions
  const validInitialMetadata = initialMetadata ? {
    duplicate: initialMetadata.duplicate ?? false,
    original_upload_date: initialMetadata.original_upload_date ?? new Date().toISOString(),
    original_document_name: initialMetadata.original_document_name ?? initialFile?.name ?? '',
    file_size: initialMetadata.file_size ?? initialFile?.size ?? 0,
    ai_chat_suggestions: Array.isArray(initialMetadata.ai_chat_suggestions) 
      ? initialMetadata.ai_chat_suggestions 
      : []
  } : null;
  
  console.log('✨ Validated FileProvider metadata:', {
    hasMetadata: !!validInitialMetadata,
    suggestionCount: validInitialMetadata?.ai_chat_suggestions?.length,
    suggestions: validInitialMetadata?.ai_chat_suggestions
  });

  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(validInitialMetadata);

  const addFile = (file: FileType, metadata?: DocumentMetadata) => {
    console.log('📥 addFile received metadata:', {
      hasMetadata: !!metadata,
      original_document_name: metadata?.original_document_name,
      file_size: metadata?.file_size,
      ai_chat_suggestions: metadata?.ai_chat_suggestions,
      suggestionCount: metadata?.ai_chat_suggestions?.length
    });

    setFiles(prev => [...prev, file]);
    if (files.length === 0) {
      setSelectedFile(file);
    }
    
    if (metadata) {
      // Validate and create metadata with suggestions
      const validatedMetadata = {
        duplicate: metadata.duplicate ?? false,
        original_upload_date: metadata.original_upload_date ?? new Date().toISOString(),
        original_document_name: metadata.original_document_name ?? file.name,
        file_size: metadata.file_size ?? file.size,
        ai_chat_suggestions: Array.isArray(metadata.ai_chat_suggestions)
          ? metadata.ai_chat_suggestions
          : []
      };

      console.log('📋 Setting document metadata:', {
        fileName: validatedMetadata.original_document_name,
        suggestionCount: validatedMetadata.ai_chat_suggestions.length,
        suggestions: validatedMetadata.ai_chat_suggestions
      });

      setDocumentMetadata(validatedMetadata);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    if (selectedFile && selectedFile.id === id) {
      const remainingFiles = files.filter(file => file.id !== id);
      setSelectedFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setSelectedFile(null);
    setCurrentStep('upload');
    setConversationId(null);
  };

  const startNewConversation = () => {
    setConversationId(null);
  };

  return (
    <FileContext.Provider
      value={{
        files,
        selectedFile,
        isProcessing,
        currentStep,
        documentMetadata,
        conversationId,
        addFile,
        removeFile,
        setSelectedFile,
        setIsProcessing,
        setCurrentStep,
        clearFiles,
        setDocumentMetadata,
        setConversationId,
        startNewConversation
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};
