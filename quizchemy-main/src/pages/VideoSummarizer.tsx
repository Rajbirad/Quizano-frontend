
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/components/ui/ShinyText.css';

import { VideoSummarizerContainer } from '@/components/video-summarizer/VideoSummarizerContainer';
import { VideoProvider } from '@/components/video-summarizer/VideoContext';
import { RecentVideoSummaries } from '@/components/video-summarizer/RecentVideoSummaries';
import { VideoChatSession } from '@/components/video-summarizer/utils/videoConversationApi';
import { FileVideo, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VideoSummarizer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelectSession = async (session: VideoChatSession) => {
    try {
      navigate('/app/video-analysis', {
        state: {
          conversationId: session.conversation_id,
          videoId: session.video_id,
          videoName: session.video_name,
          loadConversation: true,
        }
      });
      setSidebarOpen(false);
    } catch (error) {
      console.error('Failed to navigate to video conversation:', error);
      toast({ title: 'Error', description: 'Failed to load conversation. Please try again.', variant: 'destructive' });
    }
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
          <p className="text-xs text-muted-foreground font-medium">Recent Summaries</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 min-w-[15rem] thin-scrollbar">
          <RecentVideoSummaries onSelectSession={handleSelectSession} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto thin-scrollbar relative">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-50 flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer"
            title="Recent summaries"
          >
            <img src="/icons/side-menu.svg" alt="Open sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
          </button>
        )}
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FileVideo className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">AI Video Summarizer</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Transform your videos into comprehensive summaries, transcripts, mind maps, and have AI-powered conversations about the content.
            </p>
          </div>
          <VideoProvider>
            <VideoSummarizerContainer />
          </VideoProvider>
        </div>
      </div>
    </div>
  );
};

export default VideoSummarizer;
