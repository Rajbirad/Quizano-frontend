
import React, { ChangeEvent, useRef, useState } from 'react';
import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, FileText } from 'lucide-react';
import { ValidationMessage } from '@/components/ui/validation-message';

interface FileUploadTabProps {
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadTab: React.FC<FileUploadTabProps> = ({ handleFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationMessage, setValidationMessage] = useState<{ type: 'error' | 'success' | null; message: string | null }>({
    type: null,
    message: null
  });

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setValidationMessage({
        type: 'error',
        message: 'Please select a file to upload'
      });
      return false;
    }

    const validTypes = ['.pdf', '.docx', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      setValidationMessage({
        type: 'error',
        message: 'Please upload a PDF, DOCX, or TXT file'
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setValidationMessage({
        type: 'error',
        message: 'File size should be less than 10MB'
      });
      return false;
    }

    setValidationMessage({
      type: 'success',
      message: ''
    });
    return true;
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleFileInputClick();
  };

  const onFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (handleFileValidation(e)) {
      handleFileUpload(e);
    } else if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <ValidationMessage
        type={validationMessage.type}
        message={validationMessage.message}
        onDismiss={() => setValidationMessage({ type: null, message: null })}
      />
      
      <CardDescription className="text-center">
        Upload a PDF, DOCX, or text file to generate flashcards
      </CardDescription>
      
      <div className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
        validationMessage.type === 'error' 
          ? 'border-destructive/50 hover:border-destructive/70' 
          : validationMessage.type === 'success'
          ? 'border-emerald-500/50 hover:border-emerald-500/70'
          : 'border-primary/20 hover:border-primary/40'
      }`}>
        <input
          type="file"
          id="file-upload"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt"
          onChange={onFileUpload}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
          onClick={handleLabelClick}
        >
          <FileUp className="h-12 w-12 text-primary/50" />
          <span className="text-lg font-medium">Drag & drop files here</span>
          <span className="text-sm text-muted-foreground">
            or click to browse (PDF, DOCX, TXT)
          </span>
          <Button 
            className="mt-4 gradient-button"
            onClick={(e) => {
              e.preventDefault();
              handleFileInputClick();
            }}
          >
            Select File
          </Button>
        </label>
      </div>
    </div>
  );
};
