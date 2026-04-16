
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileVideo, Sparkles } from 'lucide-react';
import { useVideoContext } from '../VideoContext';
import { useToast } from '@/hooks/use-toast';
import BlobUrlManager from '@/lib/blob-url-manager';

export const UploadTab: React.FC = () => {
  const { setVideoFile, setVideoSource, isProcessing, setSummary, setCurrentStep } = useVideoContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleFileUpload(files[0]);
  };
  
  const handleFileUpload = (file: File) => {
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive"
      });
      return;
    }
    
    // No file size limit
    
    // Create a blob URL for the file using the manager
    const blobUrl = BlobUrlManager.createBlobUrl(file);
    
    // Create video file object
    const videoFileObj = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: 'file', // Set type as 'file' to distinguish from 'youtube'
      url: blobUrl,
      originalFile: file,
      chatData: undefined // Will be set after upload
    };
    
    setVideoFile(videoFileObj);
    
    // Store metadata in localStorage (not the actual file)
    localStorage.setItem('videoContext', JSON.stringify({
      videoFile: {
        ...videoFileObj,
        originalFile: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      },
      videoSource: 'file'
    }));
    
    setVideoSource('file');
    setSummary(null);
    

    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };
  
  const handleActionButton = () => {
    if (selectedFile) {
      handleFileUpload(selectedFile);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="video/*" 
      />
      
      <div 
        className={`border-2 border-dashed rounded-3xl p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center">
            <img src="/icons/video-upload.svg" alt="" className="w-full h-full" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-muted-foreground">
              Drag your video here, or <span className="text-primary underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>click here to upload</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: MP4, MOV, AVI, WebM
            </p>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-md">
              <p className="font-medium">File Limits:</p>
              <p>• Video: Max 100MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
