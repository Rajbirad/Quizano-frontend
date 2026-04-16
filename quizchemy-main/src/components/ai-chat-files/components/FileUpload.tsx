import React, { useState, useCallback } from 'react';
import DirectUploadService from '../services/DirectUploadService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (result: any) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadComplete,
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const { toast } = useToast();

  const uploadService = new DirectUploadService();

  const monitorProcessing = async (taskId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await uploadService.getUploadStatus(taskId);
        
        if (status.status === 'completed') {
          return status;
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Processing failed');
        } else {
          // Update status message
          setProcessingStatus(status.message || 'Processing...');
          
          // Wait 5 seconds before next check
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;
        }
      } catch (err) {
        if (attempts >= maxAttempts - 1) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }
    
    throw new Error('Processing timeout');
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStatus('Preparing upload...');

    try {
      // Upload with progress tracking
      const result = await uploadService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
        if (progress < 100) {
          setProcessingStatus(`Uploading... ${Math.round(progress)}%`);
        } else {
          setProcessingStatus('Upload complete, starting processing...');
        }
      });

      // Monitor processing status
      setProcessingStatus('Processing document...');
      await monitorProcessing(result.task_id);

      onUploadComplete?.(result);
      setProcessingStatus('Document processed successfully!');

    } catch (error: any) {
      setProcessingStatus('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isUploading 
            ? "border-primary/50 bg-secondary/50" 
            : "border-border hover:border-primary/50 hover:bg-secondary/50",
          className
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!isUploading ? (
          <>
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: PDF, DOCX, TXT, MD
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <File className="h-4 w-4" />
                Choose File
              </label>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm font-medium">{processingStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;