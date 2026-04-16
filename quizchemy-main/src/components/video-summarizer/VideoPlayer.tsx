import React, { useEffect, useState, useRef } from 'react';
import { useVideoContext } from './VideoContext';
import { FileVideo } from 'lucide-react';
import { cleanupBlobUrl } from '@/lib/video-url-utils';
import { ProductionVideoStrategy, VideoSourceConfig } from '@/lib/production-video-strategy';

interface VideoPlayerProps {
  className?: string;
  videoId?: string;
  videoUrl?: string;
  videoType?: 'file' | 'youtube' | 'drive';
  s3Key?: string;
  bucketName?: string;
  uploadStatus?: 'uploading' | 'processing' | 'completed' | 'failed';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  className = '', 
  videoId, 
  videoUrl: propVideoUrl,
  videoType,
  s3Key,
  bucketName,
  uploadStatus = 'completed'
}) => {
  const { videoFile } = useVideoContext();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const previousVideoUrlRef = useRef<string | null>(null);
  
  // Cleanup effect - runs when component unmounts or videoUrl changes
  useEffect(() => {
    return () => {
      // Clean up current video URL when component unmounts
      cleanupBlobUrl(videoUrl);
    };
  }, []);

  useEffect(() => {
    console.log('🎥 PRODUCTION: Video source effect triggered with:', {
      videoFile,
      videoId,
      propVideoUrl,
      videoType,
      s3Key,
      bucketName,
      uploadStatus
    });

    // Clean up previous blob URL to prevent memory leaks
    if (previousVideoUrlRef.current !== videoUrl) {
      cleanupBlobUrl(previousVideoUrlRef.current);
      previousVideoUrlRef.current = videoUrl;
    }

    const setVideoSource = () => {
      try {
        // Create video source config for production strategy
        const videoConfig: VideoSourceConfig = {
          videoId,
          s3Key: s3Key || videoFile?.s3Key,
          bucketName: bucketName || videoFile?.bucketName,
          type: videoType || videoFile?.type,
          url: propVideoUrl || videoFile?.url,
          uploadStatus: uploadStatus
        };

        // Use production video strategy (like real apps)
        const result = ProductionVideoStrategy.getVideoUrl(videoConfig);
        
        if (result.url) {
          console.log(`🎥 PRODUCTION: Using ${result.source} URL:`, result.url);
          setVideoUrl(result.url);
          
          // Clean up blob URL if we switched to production URL
          if (result.shouldCleanupBlob && previousVideoUrlRef.current?.startsWith('blob:')) {
            cleanupBlobUrl(previousVideoUrlRef.current);
          }
        } else {
          console.log('❌ PRODUCTION: No valid video source found');
          setVideoUrl(null);
        }
      } catch (error) {
        console.error('❌ PRODUCTION: Error setting video source:', error);
        setVideoUrl(null);
      }
    };
    
    setVideoSource();
  }, [videoId, propVideoUrl, videoFile?.url, s3Key, bucketName, videoType, uploadStatus]);
  
  console.log('VideoPlayer render with videoFile:', videoFile, 'videoId:', videoId, 'videoUrl:', propVideoUrl);
  
  if (!videoUrl) {
    console.log('No video URL available');
    return (
      <div className={`rounded-lg overflow-hidden relative ${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <FileVideo className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Video not available</p>
        </div>
      </div>
    );
  }

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
  };

  const handleVideoLoadStart = () => {
    console.log('Video load started:', videoUrl);
  };

  const handleVideoError = (e: any) => {
    console.error('Video loading error:', e);
    // Instead of trying backend API (which doesn't exist), try blob URL as fallback
    if (videoUrl && !videoUrl.startsWith('blob:') && videoFile?.url && videoFile.url.startsWith('blob:')) {
      console.log('Falling back to blob URL:', videoFile.url);
      setVideoUrl(videoFile.url);
    }
  };

  // No video URL available, show placeholder
  if (!videoUrl) {
    return (
      <div className={`rounded-lg overflow-hidden relative ${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <FileVideo className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">No video selected</p>
        </div>
      </div>
    );
  }

  const isYouTubeVideo = videoFile?.type === 'youtube' || 
    videoUrl?.includes('youtube.com/embed/') || 
    propVideoUrl?.includes('youtube.com');

  return (
    <div className={`rounded-lg overflow-hidden relative ${className}`}>
      {isYouTubeVideo ? (
        <iframe
          key={videoUrl}
          src={videoUrl}
          className="w-full aspect-video min-h-[300px] bg-gray-100"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video 
          key={videoUrl}
          src={videoUrl}
          controls 
          className="w-full h-auto min-h-[300px] bg-gray-100"
          controlsList="nodownload"
          preload="auto"
          onLoadStart={() => console.log('Video load started:', videoUrl)}
          onLoadedData={() => console.log('Video loaded successfully')}
          onError={(e) => console.error('Video error:', e)}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};
