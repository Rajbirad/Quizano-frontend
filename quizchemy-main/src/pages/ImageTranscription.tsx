
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/components/ui/ShinyText.css';
import { ImageTranscription } from '@/components/ai-chat-files/transcription/ImageTranscription';
import { ImageTranscriptionUseCases } from '@/components/ai-chat-files/transcription/ImageTranscriptionUseCases';
import { RecentImageTranscriptions } from '@/components/ai-chat-files/transcription/RecentImageTranscriptions';
import { Image, Sparkles } from 'lucide-react';
import { CreditsButton } from '@/components/CreditsButton';
import { useCredits } from '@/contexts/CreditsContext';

const ImageTranscriptionPage: React.FC = () => {
  const { credits: creditsData, loading } = useCredits();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const dynamicImageCredits = Object.entries((creditsData as Record<string, any>) || {}).find(
    ([key, value]) => key.toLowerCase().includes('image') && value && typeof value === 'object' && 'balance' in value
  )?.[1];

  const imageCredits =
    (creditsData as any)?.image_transcription ||
    (creditsData as any)?.ai_image_transcription ||
    (creditsData as any)?.ai_image ||
    dynamicImageCredits ||
    null;

  const handleSelectTranscription = (transcription: any) => {
    navigate('/app/image-text-result', {
      state: {
        extractedText: transcription.structured_content || transcription.text_preview,
        imageFile: null,
        confidence: transcription.metadata || {}
      }
    });
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className={`flex-shrink-0 border-r border-border/60 bg-background flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-60' : 'w-0'}`}>
        <div className="flex items-center justify-end px-4 py-3 min-w-[15rem]">
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 w-7 h-7 flex items-center justify-center border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer" title="Close">
            <img src="/icons/sidebar.svg" alt="Close sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
          </button>
        </div>
        <div className="px-4 py-2 min-w-[15rem]">
          <p className="text-xs text-muted-foreground font-medium">Recent Transcriptions</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 min-w-[15rem] thin-scrollbar">
          <RecentImageTranscriptions onSelectTranscription={handleSelectTranscription} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto thin-scrollbar relative">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-50 flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer"
            title="Recent transcriptions"
          >
            <img src="/icons/side-menu.svg" alt="Open sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
          </button>
        )}
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex-1"></div>
              <div className="flex items-center gap-3">
                <Image className="h-8 w-8 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">Image Summarizer</h1>
                <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
              </div>
              <div className="flex-1 flex justify-end">
                <CreditsButton
                  balance={imageCredits?.balance}
                  isLoading={loading}
                  isUnlimited={imageCredits?.unlimited === true}
                />
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-16">
              Upload images or take photos to extract text content using advanced OCR technology.
            </p>
          </div>
          <ImageTranscription />
          <ImageTranscriptionUseCases />
        </div>
      </div>
    </div>
  );
};

export default ImageTranscriptionPage;
