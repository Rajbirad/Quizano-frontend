import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, CheckCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadTabProps {
  uploadedVideo: File | null;
  setUploadedVideo: (file: File | null) => void;
}

export const VideoUploadTab: React.FC<VideoUploadTabProps> = ({ uploadedVideo, setUploadedVideo }) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | null) => {
    if (file) {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      if (validTypes.includes(file.type)) {
        setUploadedVideo(file);

      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid video file.",
          variant: "destructive",
        });
      }
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-3xl p-6 text-center transition-colors ${
        dragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/40'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {uploadedVideo ? (
        <div className="space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <div>
            <p className="font-medium text-foreground">{uploadedVideo.name}</p>
            <p className="text-sm text-muted-foreground">
              {(uploadedVideo.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setUploadedVideo(null)}
            className="rounded-full"
          >
            Remove Video
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 flex items-center justify-center mx-auto">
            <img src="/icons/video-upload.svg" alt="" className="w-full h-full" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-muted-foreground">
              Drag your video here, or <span className="text-primary underline cursor-pointer" onClick={() => document.getElementById('video-upload')?.click()}>click here to upload</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: MP4, WebM, OGG, AVI, MOV
            </p>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-2xl">
              <p className="font-medium">File Limits:</p>
              <p>• Video: Max 100MB</p>
            </div>
          </div>
          <input
            type="file"
            onChange={handleVideoUpload}
            accept="video/*"
            className="hidden"
            id="video-upload"
          />
        </div>
      )}
    </div>
  );
};