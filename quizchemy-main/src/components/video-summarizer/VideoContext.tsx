
import React, { createContext, useContext, useState } from 'react';

type VideoSource = 'upload' | 'youtube' | 'drive' | 'dropbox' | 'file' | null;

interface VideoFile {
  id: string;
  name: string;
  type: 'file' | 'youtube' | 'drive';
  url: string;
  originalFile?: File;
  duration?: number;
  embedUrl?: string;
  previewUrl?: string;
  s3Key?: string;
  bucketName?: string;
  uploadStatus?: 'uploading' | 'processing' | 'completed' | 'failed';
  chatData?: {
    video_id: string;
  };
}

interface VideoContextType {
  videoFile: VideoFile | null;
  videoSource: VideoSource;
  summary: string | null;
  transcript: string | null;
  isProcessing: boolean;
  currentStep: 'upload' | 'results';
  conversationId: string | null;
  setVideoFile: (file: VideoFile | null) => void;
  setVideoSource: (source: VideoSource) => void;
  setSummary: (summary: string | null) => void;
  setTranscript: (transcript: string | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setCurrentStep: (step: 'upload' | 'results') => void;
  setConversationId: (id: string | null) => void;
  clearVideo: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

interface VideoProviderProps {
  children: React.ReactNode;
  initialConversationId?: string | null;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children, initialConversationId = null }) => {
  // Initialize state from localStorage if available
  const [videoFile, setVideoFile] = useState<VideoFile | null>(() => {
    const saved = localStorage.getItem('videoContext');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.videoFile) {
          // Don't try to recreate the File object from localStorage
          // Just return the metadata and URL
          return {
            ...parsed.videoFile,
            originalFile: undefined // Clear originalFile since we can't restore it from storage
          };
        }
      } catch (e) {
        console.error('Error parsing video context:', e);
      }
    }
    return null;
  });
  const [videoSource, setVideoSource] = useState<VideoSource>(() => 
    (localStorage.getItem('videoSource') as VideoSource) || null
  );
  const [summary, setSummary] = useState<string | null>(() => 
    localStorage.getItem('videoSummary')
  );
  const [transcript, setTranscript] = useState<string | null>(() => 
    localStorage.getItem('videoTranscript')
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'results'>('upload');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);

  const clearVideo = () => {
    // Clear all state
    setVideoFile(null);
    setVideoSource(null);
    setSummary(null);
    setTranscript(null);
    setCurrentStep('upload');

    // Clear video context from localStorage
    localStorage.removeItem('videoContext');

    // Clear any blob URLs to prevent memory leaks
    if (videoFile?.url && videoFile.url.startsWith('blob:')) {
      URL.revokeObjectURL(videoFile.url);
    }

    console.log('Video data cleared from context and storage');
  };

  // Update localStorage when video file changes
  React.useEffect(() => {
    if (videoFile) {
      try {
        // Store video file and source in videoContext
        localStorage.setItem('videoContext', JSON.stringify({
          videoFile,
          videoSource
        }));

        // Store only video metadata
        if (videoFile.originalFile instanceof File) {
          const videoData = {
            videoFile: {
              ...videoFile,
              // Don't store the actual file data
              originalFile: {
                name: videoFile.originalFile.name,
                size: videoFile.originalFile.size,
                type: videoFile.originalFile.type
              }
            },
            videoSource: 'file'
          };
          localStorage.setItem('videoContext', JSON.stringify(videoData));
          console.log('Video metadata stored in localStorage:', {
            name: videoFile.originalFile.name,
            size: videoFile.originalFile.size,
            type: videoFile.originalFile.type
          });
        }
      } catch (error) {
        console.error('Error saving video to localStorage:', error);
      }
    }
  }, [videoFile]);

  React.useEffect(() => {
    if (videoSource) {
      localStorage.setItem('videoSource', videoSource);
    }
  }, [videoSource]);

  React.useEffect(() => {
    if (summary) {
      localStorage.setItem('videoSummary', summary);
    }
  }, [summary]);

  React.useEffect(() => {
    if (transcript) {
      localStorage.setItem('videoTranscript', transcript);
    }
  }, [transcript]);

  return (
    <VideoContext.Provider
      value={{
        videoFile,
        videoSource,
        summary,
        transcript,
        isProcessing,
        currentStep,
        conversationId,
        setVideoFile,
        setVideoSource,
        setSummary,
        setTranscript,
        setIsProcessing,
        setCurrentStep,
        setConversationId,
        clearVideo
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};
