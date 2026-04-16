import React, { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UploadArea } from './file-uploader/UploadArea';
import { UploadProgress } from './file-uploader/UploadProgress';
import { validateFileSize } from './file-uploader/fileUtils';
import { useNavigate } from 'react-router-dom';
import VideoUploadService from './services/VideoUploadService';
import BlobUrlManager from '@/lib/blob-url-manager';

interface VideoUploaderProps {
  onUploadComplete?: (result: any) => void;
  className?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onUploadComplete,
  className
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState('');

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isVideoFile = (file: File): boolean => {
    const videoTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ];
    return videoTypes.includes(file.type) || /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(file.name);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    await processFiles(selectedFiles);
    resetFileInput();
  };

  const processFiles = async (selectedFiles: FileList) => {
    const file = selectedFiles[0];
    console.log('🚀 Starting video processing for:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    setUploadingFile(file.name);
    setIsLoading(true);
    setUploadProgress(0);
    setProcessingStatus('Preparing upload...');

    // File validations
    if (file.size > 100 * 1024 * 1024) { // 100MB limit for videos
      setIsLoading(false);
      return;
    }

    if (!isVideoFile(file)) {
      setIsLoading(false);
      return;
    }

    try {
      const uploadService = new VideoUploadService();

      // Use VideoUploadService for the upload with progress tracking
      const result = await uploadService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
        if (progress < 50) {
          setProcessingStatus(`Uploading... ${Math.round(progress)}%`);
        } else if (progress < 60) {
          setProcessingStatus('Upload complete, starting processing...');
        } else if (progress < 100) {
          setProcessingStatus('Processing video and generating transcript...');
        } else {
          setProcessingStatus('Video processed successfully!');
        }
      });

      if (!result.success) {
        throw new Error(result.message || 'Video upload failed');
      }

      console.log('📄 Complete upload result:', result);
      console.log('🎯 AI suggestions in result:', result.result?.ai_chat_suggestions);

      // Prepare metadata for navigation
      const metadata = {
        ai_chat_suggestions: result.result?.ai_chat_suggestions || [],
        original_video_name: file.name,
        file_size: file.size,
        original_upload_date: new Date().toISOString(),
        duplicate: false,
        video_id: result.video_id,
        transcript: result.result?.transcript || '',
        duration: result.result?.duration || 0
      };

      console.log('📄 Metadata prepared for navigation:', metadata);

      // Create a video file object for navigation
      const videoFile = {
        id: result.video_id,
        name: file.name,
        type: file.type,
        size: file.size,
        originalFile: file
      };

      // Navigate to video analysis page
      const blobUrl = BlobUrlManager.createBlobUrl(file);
      console.log('🚀 Navigating to video analysis with state:', {
        video_id: result.video_id,
        videoUrl: blobUrl,
        metadata: metadata
      });
      
      navigate('/app/video-analysis', {
        state: {
          video_id: result.video_id,
          videoUrl: blobUrl,
          metadata: metadata
        }
      });

      onUploadComplete?.(result);

    } catch (error: any) {
      console.error('Error in video upload process:', error);
      toast({
        title: "Video upload failed",
        description: error.message,
        variant: "destructive"
      });
      setProcessingStatus('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {isLoading ? (
        <UploadProgress 
          progress={uploadProgress}
          fileName={uploadingFile}
        />
      ) : (
        <UploadArea
          isLoading={false}
          dragActive={dragActive}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          handleUploadClick={handleUploadClick}
        />
      )}
    </div>
  );
};

export default VideoUploader;