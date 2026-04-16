
import React from 'react';
import { Card } from '@/components/ui/card';

interface UploadedFile {
  name: string;
  type: string;
  content: string;
}

interface FilePreviewProps {
  uploadedFile: UploadedFile | null;
  onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ uploadedFile, onRemove }) => {
  if (!uploadedFile) return null;
  
  return (
    <Card className="p-4 mt-4 bg-primary/5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{uploadedFile.name}</h3>
          <p className="text-sm text-muted-foreground">
            Ready to generate flashcards
          </p>
        </div>
        <button 
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </Card>
  );
};
