import { makeAuthenticatedFormRequest } from '@/lib/api-utils';
import React, { useState, useLayoutEffect } from 'react';
import { trackRecentTool } from '@/utils/recentTools';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileVideo, Youtube, HardDrive, Upload, ExternalLink, Sparkles } from 'lucide-react';
import { useVideoContext } from './VideoContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { UploadTab } from './tabs/UploadTab';
import { YouTubeTab } from './tabs/YouTubeTab';
import { DriveTab } from './tabs/DriveTab';
import { VideoPlayer } from './VideoPlayer';
import VideoUploadService from '@/components/ai-chat-files/services/VideoUploadService';

export const VideoUploader: React.FC = () => {
  const { videoFile, setVideoFile } = useVideoContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [mounted, setMounted] = useState(false);

  // Polling for video upload tasks
  const pollForUploadResult = async (taskId: string): Promise<any> => {
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const checkStatus = async (): Promise<void> => {
        try {
          attempts++;
          console.log(`📹 Upload polling attempt ${attempts} for task ${taskId}`);
          
          const { makeAuthenticatedRequest } = await import('@/lib/api-utils');
          const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000'}/api/task-status/${taskId}`);
          const statusData = await response.json();
          
          console.log('📹 Upload task status response:', statusData);

          if (statusData.status === 'completed' && statusData.result) {
            console.log('📹 Upload task completed:', statusData.result);
            console.log('📹 Full task result structure:', JSON.stringify(statusData, null, 2));
            resolve(statusData.result);
          } else if (statusData.status === 'failed') {
            console.error('📹 Upload task failed:', statusData.error);
            reject(new Error(statusData.error || 'Upload task failed'));
          } else if (statusData.status === 'processing') {
            // Continue polling - KEEP POLLING until completed or failed
            if (attempts < maxAttempts) {
              console.log(`📹 Task still processing, will poll again in 5 seconds (attempt ${attempts}/${maxAttempts})`);
              setTimeout(checkStatus, 5000); // Poll again after 5 seconds
            } else {
              reject(new Error('Upload task timeout - exceeded maximum polling attempts'));
            }
          } else {
            // Unknown status - keep polling
            console.log(`📹 Unknown status '${statusData.status}', continuing to poll...`);
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 5000);
            } else {
              reject(new Error('Upload task timeout'));
            }
          }
        } catch (err: any) {
          console.error('📹 Error polling upload task status:', err);
          // Don't immediately reject on network errors, retry a few times
          if (attempts < maxAttempts) {
            console.log(`📹 Network error, retrying in 5 seconds... (${attempts}/${maxAttempts})`);
            setTimeout(checkStatus, 5000);
          } else {
            reject(err);
          }
        }
      };

      // Start the first poll immediately
      checkStatus();
    });
  };

  useLayoutEffect(() => {
    // Set mounted and prevent initial animations
    let timeout: NodeJS.Timeout;
    timeout = setTimeout(() => {
      setMounted(true);
    }, 0);
    
    return () => {
      clearTimeout(timeout);
      setMounted(false);
    };
  }, []);

const handleAnalyzeVideo = async () => {
  if (!videoFile) {
    toast({
      title: "No video selected",
      description: "Please upload a video first",
      variant: "destructive"
    });
    return;
  }

  setIsUploading(true);
  
  try {
    let videoId: string;
    let metadata: any = undefined;

    // For file upload type - use VideoUploadService (same as documents)
    if (videoFile.type === 'file') {
      if (!videoFile.originalFile) {
        throw new Error('No file found for upload');
      }
      
      console.log('Uploading video file using VideoUploadService:', {
        name: videoFile.originalFile.name,
        size: videoFile.originalFile.size,
        type: videoFile.originalFile.type
      });

      const videoUploadService = new VideoUploadService();
      const result = await videoUploadService.uploadFile(videoFile.originalFile, (progress) => {
        console.log('Video upload progress:', progress);
        // You could update UI with progress here if needed
      });

      if (!result.success) {
        throw new Error(result.message || 'Video upload failed');
      }

      console.log('📄 Video upload result:', result);
      console.log('🎯 AI suggestions from video upload:', result.result?.ai_chat_suggestions);

      videoId = result.video_id || '';
      if (!videoId) {
        throw new Error('No video ID received from upload service');
      }

      // Extract AI suggestions from the upload result
      const aiSuggestions = result.result?.ai_chat_suggestions || [];
      console.log('🎯 Extracted AI suggestions:', aiSuggestions);

      // Store AI suggestions for later use
      metadata = {
        ai_chat_suggestions: aiSuggestions,
        original_video_name: videoFile.originalFile.name,
        file_size: videoFile.originalFile.size,
        original_upload_date: new Date().toISOString(),
        video_id: videoId,
        transcript: result.result?.transcript || '',
        duration: result.result?.duration || 0
      };
    }
    // For YouTube and Google Drive videos - process URLs
    else {
      const formData = new FormData();
      
      if (videoFile.type === 'youtube' && videoFile.url) {
        console.log('📹 YouTube video details:', {
          type: videoFile.type,
          url: videoFile.url,
          name: videoFile.name,
          embedUrl: videoFile.embedUrl
        });
        formData.append('video_url', videoFile.url);
        formData.append('video_name', videoFile.name);
        formData.append('source_type', 'youtube');
        console.log('📹 FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`📹 ${key}:`, value);
        }
      }
      else if (videoFile.type === 'drive' && videoFile.url) {
        formData.append('video_url', videoFile.url);
        formData.append('video_name', videoFile.name);
        formData.append('source_type', 'google_drive');
        console.log('Processing Drive video:', videoFile.url);
      }
      else {
        throw new Error('Invalid or incomplete video source');
      }

      console.log('Sending video URL processing request...');
      
      // Process URL-based videos using the correct upload endpoint
      const response = await makeAuthenticatedFormRequest(
        `${import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000'}/api/video/upload`,
        formData
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error('URL processing failed:', errorText);
        throw new Error(`Failed to process video: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📹 Video upload API response:', data);
      
      if (data.success) {
        // Check if background processing is enabled and we have a task_id
        if (data.metadata?.background_processing && data.metadata?.task_id) {
          console.log('📹 Background processing detected, polling for task:', data.metadata.task_id);
          
          // Use the video_id from the initial response
          videoId = data.video_id;
          
          // Use AI suggestions from immediate response first (they're already available!)
          let aiSuggestions = data.ai_chat_suggestions || [];
          console.log('📹 Using immediate AI suggestions from upload response:', aiSuggestions);
          
          // Still poll for task completion to get final results if needed
          const taskResult = await pollForUploadResult(data.metadata.task_id);
          
          // If task result has additional AI suggestions, use those instead
          if (taskResult.result?.ai_chat_suggestions) {
            aiSuggestions = taskResult.result.ai_chat_suggestions;
            console.log('📹 Updated with AI suggestions from task result.ai_chat_suggestions');
          } else if (taskResult.result?.result?.ai_chat_suggestions) {
            aiSuggestions = taskResult.result.result.ai_chat_suggestions;
            console.log('📹 Updated with AI suggestions from task result.result.ai_chat_suggestions');
          } else if (taskResult.ai_chat_suggestions) {
            aiSuggestions = taskResult.ai_chat_suggestions;
            console.log('📹 Updated with AI suggestions from task ai_chat_suggestions');
          }
          
          console.log('📹 Final AI suggestions to use:', aiSuggestions);
          
          metadata = {
            ai_chat_suggestions: aiSuggestions,
            original_video_name: videoFile.name,
            video_url: videoFile.url,
            source_type: videoFile.type,
            original_upload_date: new Date().toISOString(),
            video_id: videoId,
            background_processing: true,
            task_id: data.metadata.task_id,
            processing_metadata: taskResult.result?.result?.metadata || taskResult.result?.metadata
          };
        } 
        // Check if we need to poll for task completion (alternative format)
        else if (data.task_id && data.status === 'processing') {
          console.log('📹 Polling for upload task:', data.task_id);
          const taskResult = await pollForUploadResult(data.task_id);
          
          // Extract video_id from task result
          if (taskResult.video_id) {
            videoId = taskResult.video_id;
          } else if (taskResult.result?.video_id) {
            videoId = taskResult.result.video_id;
          } else if (taskResult.result?.result?.video_id) {
            videoId = taskResult.result.result.video_id;
          } else {
            throw new Error('No video ID received from upload task');
          }
          
          // Extract AI suggestions from nested task result structure
          let aiSuggestions = [];
          console.log('📹 Task result for AI extraction (alt format):', JSON.stringify(taskResult, null, 2));
          
          if (taskResult.result?.ai_chat_suggestions) {
            aiSuggestions = taskResult.result.ai_chat_suggestions;
            console.log('📹 Found AI suggestions in taskResult.result.ai_chat_suggestions (alt)');
          } else if (taskResult.result?.result?.ai_chat_suggestions) {
            aiSuggestions = taskResult.result.result.ai_chat_suggestions;
            console.log('📹 Found AI suggestions in taskResult.result.result.ai_chat_suggestions (alt)');
          } else if (taskResult.ai_chat_suggestions) {
            aiSuggestions = taskResult.ai_chat_suggestions;
            console.log('📹 Found AI suggestions in taskResult.ai_chat_suggestions (alt)');
          } else {
            console.log('📹 No AI suggestions found in task result (alt)');
          }
          
          console.log('📹 Extracted AI suggestions from task result (alt):', aiSuggestions);
          
          metadata = {
            ai_chat_suggestions: aiSuggestions,
            original_video_name: videoFile.name,
            video_url: videoFile.url,
            source_type: videoFile.type,
            original_upload_date: new Date().toISOString(),
            video_id: videoId,
            processing_metadata: taskResult.result?.result?.metadata || taskResult.result?.metadata
          };
        } 
        else if (data.video_id) {
          // Immediate response with video_id (no polling needed)
          videoId = data.video_id;
          
          // Extract AI suggestions if available
          const aiSuggestions = data.ai_chat_suggestions || [];
          metadata = {
            ai_chat_suggestions: aiSuggestions,
            original_video_name: videoFile.name,
            video_url: videoFile.url,
            source_type: videoFile.type,
            original_upload_date: new Date().toISOString(),
            video_id: videoId
          };
        } else {
          throw new Error('No video ID received from upload response');
        }
      } else {
        throw new Error(data.message || 'Video upload failed');
      }
    }

    // Update video file with server response data including S3 info
    const updatedVideoFile = {
      ...videoFile,
      chatData: { video_id: videoId },
      s3Key: videoFile.type === 'file' ? metadata?.result?.s3_key : undefined,
      bucketName: videoFile.type === 'file' ? metadata?.bucketName : undefined
    };
    setVideoFile(updatedVideoFile);

    // Store metadata including AI suggestions in localStorage
    console.log('📦 Storing metadata in localStorage:', metadata);
    localStorage.setItem('videoContext', JSON.stringify({
      videoFile: {
        ...updatedVideoFile,
        originalFile: videoFile.type === 'file' ? {
          name: videoFile.originalFile?.name,
          size: videoFile.originalFile?.size,
          type: videoFile.originalFile?.type
        } : undefined
      },
      videoSource: videoFile.type,
      metadata: metadata // Always store metadata, not just for file uploads
    }));
    console.log('📦 VideoContext stored in localStorage');

    // Navigate to analysis page with AI suggestions
    console.log('🚀 Navigating to video analysis with metadata:', {
      video_id: videoId,
      videoUrl: videoFile.type === 'youtube' ? videoFile.embedUrl : videoFile.url,
      videoType: videoFile.type,
      metadata: metadata // Always log metadata
    });

    trackRecentTool('/app/video-summarizer');
    navigate('/app/video-analysis', { 
      state: { 
        video_id: videoId,
        videoUrl: videoFile.type === 'youtube' ? videoFile.embedUrl : videoFile.url,
        videoType: videoFile.type,
        metadata: metadata // Always pass metadata, not just for file uploads
      }
    });
  } catch (error) {
    console.error('Error during video analysis:', error);
    toast({
      title: "Analysis failed",
      description: error instanceof Error ? error.message : "Failed to analyze video",
      variant: "destructive"
    });
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className={`space-y-6 min-h-[500px] w-full max-w-5xl mx-auto transition-all duration-300 ease-out ${
      !mounted ? 'opacity-0' : 'opacity-100'
    }`}>
      {!videoFile ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 gap-1 p-1 bg-background/50 border-2 rounded-full w-full max-w-3xl mx-auto mb-6 h-auto">
            <TabsTrigger value="upload" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Upload className="h-4 w-4 mr-1" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Youtube className="h-4 w-4 mr-1" />
              <span>YouTube</span>
            </TabsTrigger>
            <TabsTrigger value="drive" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HardDrive className="h-4 w-4 mr-1" />
              <span>Drive</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="relative min-h-[400px]">
            <div className="absolute inset-0">
              <TabsContent value="upload" className="space-y-4 mt-6 absolute inset-0 transition-opacity duration-300">
                <UploadTab />
              </TabsContent>
              
              <TabsContent value="youtube" className="space-y-4 mt-6 absolute inset-0 transition-opacity duration-300">
                <YouTubeTab />
              </TabsContent>
              
              <TabsContent value="drive" className="space-y-4 mt-6 absolute inset-0 transition-opacity duration-300">
                <DriveTab />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      ) : (
        <div className="space-y-6 w-full max-w-xl mx-auto">
          <div className="rounded-lg overflow-hidden bg-black/5">
            <div className="aspect-video">
              {videoFile.type === 'youtube' ? (
                <iframe
                  src={videoFile.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video player"
                />
              ) : (
                <VideoPlayer 
                  videoUrl={videoFile.url} 
                  videoType={videoFile.type}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={handleAnalyzeVideo}
              className="rounded-full gradient-button px-8 py-3 text-lg"
              size="lg"
              disabled={isUploading}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isUploading ? "Analyzing..." : "Analyze Video"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
