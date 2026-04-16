
import React from 'react';
import { FileText, Upload } from 'lucide-react';

interface UploadAreaProps {
  isLoading: boolean;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleUploadClick: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  isLoading,
  dragActive,
  handleDrag,
  handleDrop,
  handleUploadClick,
}) => {
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/40'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
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
            Drag your file here, or <span className="text-primary underline">click here to upload</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: PDF, DOC, DOCX, TXT, MD
          </p>
          <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-md">
            <p className="font-medium">File Limits:</p>
            <p>• PDF: Max 30MB, 100 pages</p>
          </div>
        </div>
      </label>
    </div>
  );
};
