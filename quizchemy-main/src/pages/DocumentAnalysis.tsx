import React, { useEffect, useState } from 'react';
import './DocumentAnalysisScrollbar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, FileText, List, Network, Loader2 } from 'lucide-react';
import { SummaryOutput } from '@/components/ai-chat-files/tabs/SummaryOutput';
import { KeyPointsOutput } from '@/components/ai-chat-files/tabs/KeyPointsOutput';
import { MindMapOutput } from '@/components/ai-chat-files/MindMapOutput';
import { ChatInterface } from '@/components/ai-chat-files/ChatInterface';
import { DocumentViewer } from '@/components/ai-chat-files/DocumentViewer';
import { FileProvider } from '@/components/ai-chat-files/FileContext';
import { Button } from '@/components/ui/button';
import { fetchConversation, fetchDocumentFromS3 } from '@/components/ai-chat-files/utils/conversationApi';

const DocumentAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  
  const locationState = location.state || {};
  
  // Load conversation data in the background if needed
  useEffect(() => {
    const loadConversationData = async () => {
      // If we already have a file from state, use it immediately
      if (locationState.file) {
        setFile(locationState.file);
        setMetadata(locationState.metadata);
        setConversationId(locationState.conversationId);
        return;
      }
      
      // If we need to load a conversation
      if (locationState.loadConversation && locationState.conversationId) {
        setIsLoading(true);
        setConversationId(locationState.conversationId);
        
        try {
          // Fetch conversation details
          const conversation = await fetchConversation(locationState.conversationId);
          
          // Create basic file structure immediately (without the PDF blob)
          const basicFile = {
            id: locationState.documentId || conversation.document.id,
            name: locationState.documentName || conversation.document.document_name,
            type: 'application/pdf',
            content: '',
            size: conversation.document.content_length,
            originalFile: null, // Will be loaded in background
            chatData: {
              document_id: conversation.document.id
            }
          };
          
          const basicMetadata = {
            duplicate: false,
            original_upload_date: conversation.document.created_at,
            original_document_name: conversation.document.document_name,
            file_size: conversation.document.content_length,
            ai_chat_suggestions: []
          };
          
          // Set file immediately so UI renders
          setFile(basicFile);
          setMetadata(basicMetadata);
          
          // Fetch PDF in background
          fetchDocumentFromS3(conversation.document.id)
            .then(blob => {
              const documentFile = new File(
                [blob], 
                conversation.document.document_name + '.pdf',
                { type: 'application/pdf' }
              );
              
              // Update file with actual PDF
              setFile(prev => ({
                ...prev,
                originalFile: documentFile
              }));
            })
            .catch(error => {
              console.error('Failed to load PDF:', error);
            })
            .finally(() => {
              setIsLoading(false);
            });
            
        } catch (error) {
          console.error('Failed to load conversation:', error);
          setIsLoading(false);
          navigate('/app/chat-with-files');
        }
      }
    };
    
    loadConversationData();
  }, [locationState, navigate]);
  // Remove outer scroll on mount, restore on unmount
  useEffect(() => {
    const originalHtml = document.documentElement.style.overflow;
    const originalBody = document.body.style.overflow;
    document.documentElement.style.height = '100vh';
    document.body.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = originalHtml;
      document.body.style.overflow = originalBody;
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);

  if (!file) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading conversation...</h2>
              <p className="text-muted-foreground">Please wait while we fetch your document</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">No Document Found</h1>
              <p className="text-muted-foreground mb-4">Please upload a document first.</p>
              <Button onClick={() => navigate('/app/chat-with-files')}>
                Back to Upload
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Default suggestions
  const defaultSuggestions = [
    { text: 'What is this document about?', type: 'question' },
    { text: 'Can you summarize the main points?', type: 'question' },
    { text: 'What are the key concepts discussed?', type: 'question' },
    { text: 'Explain this in simpler terms', type: 'command' },
    { text: 'Generate study questions', type: 'command' }
  ];

  const incomingSuggestions = metadata?.ai_chat_suggestions ?? [];
  const validatedSuggestions = Array.isArray(incomingSuggestions) && incomingSuggestions.length > 0
    ? incomingSuggestions.map(s => {
        if (typeof s === 'string') {
          return { text: s, type: 'question' };
        }
        if (s && typeof s === 'object' && typeof s.text === 'string') {
          return s;
        }
        return null;
      }).filter(Boolean)
    : defaultSuggestions;

  const finalMetadata = {
    duplicate: metadata?.duplicate ?? false,
    original_upload_date: metadata?.original_upload_date ?? new Date().toISOString(),
    original_document_name: metadata?.original_document_name ?? file?.name ?? '',
    file_size: metadata?.file_size ?? file?.size ?? 0,
    ai_chat_suggestions: validatedSuggestions
  };

 return (
  <FileProvider 
    key={file?.originalFile ? 'with-file' : 'without-file'}
    initialFile={file}
    initialMetadata={finalMetadata}
    initialConversationId={conversationId}>
    <div className="h-[calc(100vh-64px)] overflow-hidden overflow-x-hidden">
      <div className="container max-w-7xl mx-auto px-4 py-8 h-full overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full overflow-x-hidden">
          {/* Left: Document Viewer */}
          <div className="lg:col-span-2 bg-background border rounded-lg h-full overflow-hidden overflow-x-hidden">
            <div className="h-full ultra-thin-scrollbar overflow-x-hidden" style={{overflowY: 'auto', overflowX: 'hidden'}}>
              <DocumentViewer />
            </div>
          </div>

          {/* Right: Tabs */}
          <div className="lg:col-span-3 h-full overflow-hidden overflow-x-hidden">
            <Tabs defaultValue="chat" className="h-full flex flex-col overflow-x-hidden">
              {/* Tabs header */}
              <TabsList className="grid grid-cols-3 p-1 bg-transparent border rounded-full w-full max-w-2xl mx-auto mb-4 shrink-0">
                <TabsTrigger value="chat" className="rounded-full flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Bot className="h-4 w-4" /> <span>AI Chat</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="rounded-full flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-4 w-4" /> <span>Summary</span>
                </TabsTrigger>
                <TabsTrigger value="keypoints" className="rounded-full flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <List className="h-4 w-4" /> <span>Key Points</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden overflow-x-hidden">
                <TabsContent value="chat" className="h-full overflow-x-hidden">
                  <div className="h-full flex flex-col overflow-x-hidden">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden ultra-thin-scrollbar">
                      <ChatInterface />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="h-[calc(100vh-180px)] overflow-x-hidden">
                  <div className="h-full overflow-y-auto overflow-x-hidden ultra-thin-scrollbar">
                    <SummaryOutput />
                  </div>
                </TabsContent>

                <TabsContent value="keypoints" className="h-[calc(100vh-180px)] overflow-x-hidden">
                  <div className="h-full overflow-y-auto overflow-x-hidden ultra-thin-scrollbar">
                    <KeyPointsOutput />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  </FileProvider>
);

};

export default DocumentAnalysis;
