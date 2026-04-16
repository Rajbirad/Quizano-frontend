import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '@/components/ai-chat-files/FileUploader';
import { ChatInterface } from '@/components/ai-chat-files/ChatInterface';
import { FileProvider, useFileContext } from '@/components/ai-chat-files/FileContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, FileText, Bot, List, Sparkles } from 'lucide-react';
import { SummaryOutput } from '@/components/ai-chat-files/tabs/SummaryOutput';
import { KeyPointsOutput } from '@/components/ai-chat-files/tabs/KeyPointsOutput';
import '@/components/ui/ShinyText.css';
import { DocumentViewer } from '@/components/ai-chat-files/DocumentViewer';
import { ChatSession, fetchConversation, fetchDocumentFromS3 } from '@/components/ai-chat-files/utils/conversationApi';
import { RecentConversations } from '@/components/ai-chat-files/RecentConversations';
import { trackRecentTool } from '@/utils/recentTools';

const FilesContainer = () => {
  const {
    currentStep,
    files,
    setCurrentStep,
    setConversationId,
    setSelectedFile,
    addFile,
    startNewConversation
  } = useFileContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleProceedToResults = () => {
    if (files.length > 0) {
      trackRecentTool('/app/chat-with-files');
      setCurrentStep('results');
    }
  };

  const handleGoBack = () => setCurrentStep('upload');

  const handleSelectSession = async (session: ChatSession) => {
    try {
      setSidebarOpen(false);

      const getFileType = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'application/pdf';
        if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (ext === 'doc') return 'application/msword';
        return 'application/pdf';
      };

      const detectTypeFromBlob = async (blob: Blob): Promise<string> => {
        try {
          const header = await blob.slice(0, 8).arrayBuffer();
          const bytes = new Uint8Array(header);
          // PDF magic bytes: %PDF → 0x25 0x50 0x44 0x46
          if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
            return 'application/pdf';
          }
          // ZIP-based (DOCX, XLSX, PPTX) magic bytes: PK → 0x50 0x4B
          if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          }
        } catch {}
        return 'application/pdf';
      };

      const fileType = getFileType(session.document_name);

      // Build a basic file immediately so we can jump to the results view right away
      const basicFile = {
        id: session.document_id,
        name: session.document_name,
        type: fileType,
        content: '',
        size: 0,
        originalFile: undefined,
        chatData: { document_id: session.document_id },
      };

      addFile(basicFile);
      setConversationId(session.conversation_id);
      setCurrentStep('results');

      // Fetch the full conversation + file in the background
      fetchConversation(session.conversation_id)
        .then(conversation => {
          const docName = conversation.document.document_name;
          const detectedType = getFileType(docName);
          fetchDocumentFromS3(conversation.document.id)
            .then(async blob => {
              // Detect real type from magic bytes — most reliable method
              const resolvedType = await detectTypeFromBlob(blob);
              const documentFile = new File(
                [blob],
                docName,
                { type: resolvedType }
              );
              setSelectedFile({
                ...basicFile,
                type: resolvedType,
                name: docName,
                originalFile: documentFile,
              });
            })
            .catch(err => console.error('Failed to load document:', err));
        })
        .catch(err => console.error('Failed to load conversation:', err));
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const handleNewChat = () => {
    startNewConversation();
    setSidebarOpen(false);
  };

  // ── Sidebar panel (same style as AiChatPage) ──────────────────────────────
  const SidebarPanel = () => (
    <div className={`flex-shrink-0 border-r border-border/60 bg-background flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-60' : 'w-0'}`}>
      {/* Close button */}
      <div className="flex items-center justify-end px-4 py-3 min-w-[15rem]">
        <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 w-7 h-7 flex items-center justify-center border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer" title="Close">
          <img src="/icons/sidebar.svg" alt="Close sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 min-w-[15rem] thin-scrollbar">
        <RecentConversations onSelectSession={handleSelectSession} />
      </div>
    </div>
  );

  // ── Toggle button (shown when sidebar is closed) ──────────────────────────
  const ToggleButton = ({ className = '' }: { className?: string }) => (
    !sidebarOpen ? (
      <button
        onClick={() => setSidebarOpen(true)}
        className={`flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer ${className}`}
        title="Recent chats"
      >
        <img src="/icons/side-menu.svg" alt="Open sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
      </button>
    ) : null
  );

  return (
    <div className="flex h-full overflow-hidden">
      <SidebarPanel />

      {/* Main content */}
      <div className={`flex-1 thin-scrollbar relative ${currentStep === 'results' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {currentStep === 'upload' && <ToggleButton className="absolute top-3 left-3 z-50" />}

        {currentStep === 'upload' && (
          <div className="container max-w-3xl mx-auto px-6 py-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex items-center gap-3 mb-2">
                <BookText className="h-8 w-8 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">AI Chat with Documents</h1>
                <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
              </div>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Upload documents and get insights, summaries, mind maps, and answers to your questions
              </p>
            </div>
            <FileUploader />
          </div>
        )}

        {currentStep === 'results' && (
          <div className="flex h-full p-4 gap-4">
            {/* Document viewer */}
            <div className="w-[50%] h-full bg-background border rounded-xl overflow-auto shadow-sm">
              <DocumentViewer />
            </div>
            {/* Analysis tabs */}
            <div className="flex-1 h-full overflow-hidden border rounded-xl shadow-sm bg-background">
              {files.length > 0 ? (
                <Tabs defaultValue="chat" className="w-full h-full flex flex-col p-3">
                  <TabsList className="modern-tabs grid grid-cols-3 rounded-full p-1 bg-muted/50 mb-2">
                    <TabsTrigger value="chat" className="modern-tab rounded-full flex items-center gap-2">
                      <Bot className="h-4 w-4" /><span>AI Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="modern-tab rounded-full flex items-center gap-2">
                      <FileText className="h-4 w-4" /><span>Summary</span>
                    </TabsTrigger>
                    <TabsTrigger value="keypoints" className="modern-tab rounded-full flex items-center gap-2">
                      <List className="h-4 w-4" /><span>Key Points</span>
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="chat" className="h-full mt-0"><ChatInterface /></TabsContent>
                    <TabsContent value="summary" className="h-full mt-0 overflow-auto"><SummaryOutput /></TabsContent>
                    <TabsContent value="keypoints" className="h-full mt-0 overflow-auto"><KeyPointsOutput /></TabsContent>
                  </div>
                </Tabs>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Document AI Assistant</h3>
                    <p className="text-muted-foreground">Upload a document to start analyzing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const AiChatWithFiles = () => {
  return (
    <div className="h-full">
      <FileProvider>
        <FilesContainer />
      </FileProvider>
    </div>
  );
};

export default AiChatWithFiles;