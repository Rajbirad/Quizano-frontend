import React from 'react';
import { FileText, Upload, CheckCircle } from 'lucide-react';

interface UploadProgressProps {
  fileName: string;
  progress: number;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  progress
}) => {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
      <div className="flex flex-col items-center gap-4">
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
            Uploading...
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          AI may produce inaccurate information about people, places, or facts.
        </p>
      </div>
    </div>
  );
};