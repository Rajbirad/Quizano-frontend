import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/components/ui/ShinyText.css';
import { AudioTranscription } from '@/components/ai-chat-files/transcription/AudioTranscription';
import { Mic, Sparkles } from 'lucide-react';
import { AudioTranscriptionUseCases } from '@/components/ai-chat-files/transcription/AudioTranscriptionUseCases';
import { RecentAudioTranscriptions } from '@/components/ai-chat-files/transcription/RecentAudioTranscriptions';
import { CreditsButton } from '@/components/CreditsButton';
import { CreditsInfo } from '@/utils/credits';
import { useCredits } from '@/contexts/CreditsContext';

const AudioTranscriptionPage: React.FC = () => {
  const { credits: creditsData } = useCredits();
  const [credits, setCredits] = useState<CreditsInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = creditsData as any;
    if (data?.ai_audio) {
      setCredits({
        cost: 0,
        balance: data.ai_audio.balance ?? 0,
        unlimited: data.ai_audio.unlimited === true,
        transaction_id: undefined,
      });
    }
  }, [creditsData]);

  const handleSelectTranscription = (transcription: any) => {
    navigate('/app/transcription-result', {
      state: {
        transcription: transcription.transcription || '',
        utterances: transcription.utterances || [],
        plainText: transcription.plain_text || '',
        metadata: transcription.metadata || {},
        summary: transcription.summary || '',
        fileName: transcription.title || transcription.audio_name || transcription.filename || transcription.name || 'Audio',
        audioUrl: transcription.audioUrl || transcription.audio_url || transcription.s3_url || undefined,
        audioMimeType: transcription.audioMimeType || 'audio/mp4',
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
          <RecentAudioTranscriptions onSelectTranscription={handleSelectTranscription} />
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
                <Mic className="h-8 w-8 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">Audio Transcription</h1>
                <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
              </div>
              <div className="flex-1 flex justify-end">
                <CreditsButton balance={credits?.balance} />
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-16">
              Upload audio files or record your voice to convert to text using AI transcription technology.
            </p>
          </div>
          <AudioTranscription />
          <AudioTranscriptionUseCases />
        </div>
      </div>
    </div>
  );
};

export default AudioTranscriptionPage;