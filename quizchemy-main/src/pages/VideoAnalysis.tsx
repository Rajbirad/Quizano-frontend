import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileVideo, Bot, FileText, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-summarizer/VideoPlayer';
import { SummaryOutput } from '@/components/video-summarizer/SummaryOutput';
import { VideoKeyPointsOutput } from '@/components/video-summarizer/VideoKeyPointsOutput';
import { MindMapOutput } from '@/components/video-summarizer/MindMapOutput';
import { AIChat } from '@/components/video-summarizer/AIChat';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';
import { VideoProvider, useVideoContext } from '@/components/video-summarizer/VideoContext';
import { fetchVideoConversation, fetchVideoFromS3 } from '@/components/video-summarizer/utils/videoConversationApi';

interface MindMapData {
  central_topic: string;
  branches: {
    topic: string;
    overview: string;
    key_points: string[];
  }[];
}

interface NewMindMapData {
  mindmap: MindMapData;
  success: boolean;
}

interface LegacyMindMapData {
  summary: MindMapData;
  success: boolean;
}

const VideoAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('aichat');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<any>(null);
  const [videoType, setVideoType] = useState<string | undefined>(undefined);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [mindMapLoading, setMindMapLoading] = useState(false);
  const [mindMapError, setMindMapError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load conversation data if navigated from history
  useEffect(() => {
    const loadConversationData = async () => {
      const locationState = location.state || {};
      
      // If we need to load a conversation
      if (locationState.loadConversation && locationState.conversationId) {
        setIsLoading(true);
        setConversationId(locationState.conversationId);
        
        try {
          // Fetch conversation details
          const conversation = await fetchVideoConversation(locationState.conversationId);
          console.log('📹 Loaded conversation:', conversation);
          
          // Check video type and handle accordingly
          const videoFileType = conversation.video.file_type;
          setVideoId(conversation.video.id);
          
          if (videoFileType === 'youtube') {
            // For YouTube videos, use the s3_key which contains the YouTube URL
            console.log('📹 YouTube video detected, using URL:', conversation.video.s3_key);
            setVideoUrl(conversation.video.s3_key || null);
            setVideoType('youtube');
            setIsLoading(false);
          } else {
            // For uploaded files, fetch from S3
            console.log('📹 File upload detected, fetching from S3');
            const blob = await fetchVideoFromS3(conversation.video.id);
            const videoFile = new File(
              [blob],
              conversation.video.video_name,
              { type: 'video/mp4' }
            );
            
            const url = URL.createObjectURL(videoFile);
            setVideoUrl(url);
            setVideoFile(videoFile);
            setVideoType('file');
            console.log('✅ Video loaded from S3');
            setIsLoading(false);
          }
            
        } catch (error) {
          console.error('Failed to load conversation:', error);
          setIsLoading(false);
          navigate('/app/video-summarizer');
        }
        return;
      }
      
      // Original logic for direct navigation
      if (locationState?.video_id && locationState?.videoUrl) {
        console.log('📹 Setting video from navigation state:', {
          video_id: locationState.video_id,
          videoUrl: locationState.videoUrl,
          videoType: locationState.videoType
        });
        setVideoId(locationState.video_id);
        setVideoUrl(locationState.videoUrl);
        
        const suggestions = locationState?.metadata?.ai_chat_suggestions || [];
        setAiSuggestions(suggestions);
      } else {
        // Try to get from localStorage as fallback
        const videoContext = JSON.parse(localStorage.getItem('videoContext') || '{}');
        
        if (videoContext?.videoFile?.chatData?.video_id) {
          setVideoId(videoContext.videoFile.chatData.video_id);
          setVideoUrl(videoContext.videoFile.url);
          
          const suggestions = videoContext?.metadata?.ai_chat_suggestions || [];
          setAiSuggestions(suggestions);
        } else {
          setVideoId(null);
          setVideoUrl(null);
        }
      }
    };
    
    loadConversationData();
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchMindMap = async () => {
      if (videoId && activeTab === 'mindmap') {
        setMindMapLoading(true);
        setMindMapError(null);
        
        try {
          // Prepare form data
          const formData = new FormData();
          formData.append('video_id', videoId);

          // Make API request
          const response = await makeAuthenticatedFormRequest(
            `${import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000'}/api/mindmap-video`,
            formData
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Mind map API error:', errorText);
            throw new Error('Failed to generate mind map. Please try again.');
          }

          const data = await response.json();
          console.log('Mind map API response:', data); // For debugging
          if (data?.success && data?.mindmap) {
            // New API format with mindmap object
            const newFormatData = data as NewMindMapData;
            setMindMapData(newFormatData.mindmap);
          } else if (data?.success && data?.summary) {
            // Legacy API format with summary object
            const legacyFormatData = data as LegacyMindMapData;
            if (legacyFormatData.summary && typeof legacyFormatData.summary === 'object' && 'central_topic' in legacyFormatData.summary && 'branches' in legacyFormatData.summary) {
              setMindMapData(legacyFormatData.summary);
            } else {
              setMindMapError('Invalid mind map data format received');
            }
          } else {
            setMindMapError('Invalid API response format');
          }
        } catch (err: any) {
          setMindMapError(err.message || 'Failed to generate mind map');
        } finally {
          setMindMapLoading(false);
        }
      }
    };

    fetchMindMap();
  }, [videoId, activeTab]);

  // Check if we're loading a conversation from history
  const isLoadingConversation = location.state?.loadConversation && !videoId;

  if (!videoId && !isLoadingConversation) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <FileVideo className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No video selected</h2>
          <p className="text-muted-foreground mb-4">Please upload a video first to analyze it.</p>
          <Button onClick={() => navigate('/app/video-summarizer')}>
            Go to Video Summarizer
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingConversation) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading page...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <VideoProvider initialConversationId={conversationId}>
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 pt-4 pb-8 h-full">
        <div className="flex flex-col lg:flex-row h-full gap-6">
          {/* Video player section */}
          <div className="lg:w-5/12 flex flex-col justify-start relative lg:pr-4">
            <div className="w-full">
              <div className="aspect-video bg-black/5 rounded-lg mb-4">
                <VideoPlayer 
                  key={`video-player-${videoId}-${activeTab}`}
                  videoId={videoId || ''} 
                  videoUrl={location.state?.videoUrl || videoUrl}
                  videoType={location.state?.videoType || videoType}
                  s3Key={location.state?.metadata?.result?.s3_key}
                  bucketName={location.state?.metadata?.bucketName}
                  uploadStatus="completed"
                  className="w-full h-full" 
                />
              </div>
              {videoId ? (
                <div className="text-sm text-muted-foreground text-center">
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center">
                  Loading video...
                </div>
              )}
            </div>
            {/* Full height border */}
            <div className="absolute right-0 top-0 bottom-0 w-px bg-border hidden lg:block"></div>
          </div>

          {/* AI assistant panel */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="grid grid-cols-3 p-1 bg-transparent border rounded-full w-full max-w-2xl mx-auto mb-4 shrink-0">
                <TabsTrigger value="aichat" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span>AI Chat</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Summary</span>
                </TabsTrigger>
                <TabsTrigger value="keypoints" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span>Key Points</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="aichat" className="h-full">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto px-6">
                      <AIChat videoId={videoId} initialSuggestions={aiSuggestions} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="h-[calc(100vh-180px)]">
                  <div className="h-full overflow-y-auto">
                    <SummaryOutput videoId={videoId} />
                  </div>
                </TabsContent>

                <TabsContent value="keypoints" className="h-[calc(100vh-180px)]">
                  <div className="h-full overflow-y-auto">
                    <VideoKeyPointsOutput videoId={videoId} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
    </VideoProvider>
  );
};

export default VideoAnalysis;