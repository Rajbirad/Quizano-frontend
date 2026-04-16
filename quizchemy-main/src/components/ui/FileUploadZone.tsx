import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload, X } from 'lucide-react';

interface FileUploadZoneProps {
  uploadedFile: File | null;
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  acceptedFileTypes: string;
  acceptedFileTypesLabel: string;
  disabled?: boolean;
  maxSizeInfo?: React.ReactNode;
  dragAndDropLabel?: string;
  uploadPromptLabel?: string;
}

export function FileUploadZone({
  uploadedFile,
  onFileUpload,
  onFileRemove,
  acceptedFileTypes,
  acceptedFileTypesLabel,
  disabled = false,
  maxSizeInfo,
  dragAndDropLabel = "Drag your file here, or",
  uploadPromptLabel = "click here to upload"
}: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && !disabled) {
      onFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && !disabled) {
      onFileUpload(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  if (uploadedFile) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{uploadedFile.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatFileSize(uploadedFile.size)}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onFileRemove}
            disabled={disabled}
            className="text-destructive hover:text-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        id="file-upload-zone" 
        className="hidden" 
        onChange={handleFileChange} 
        accept={acceptedFileTypes}
        disabled={disabled}
      />
      <label 
        htmlFor="file-upload-zone" 
        className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center gap-4`}
      >
        <div className="relative">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <Upload className="h-3 w-3 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            {dragAndDropLabel} <span className="text-primary underline">{uploadPromptLabel}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: {acceptedFileTypesLabel}
          </p>
          {maxSizeInfo && (
            <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-md">
              {maxSizeInfo}
            </div>
          )}
        </div>
      </label>
    </div>
  );
}
