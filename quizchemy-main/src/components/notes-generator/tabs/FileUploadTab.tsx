import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadTabProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  isGenerating?: boolean;
}

export const FileUploadTab: React.FC<FileUploadTabProps> = ({ uploadedFile, setUploadedFile, isGenerating = false }) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | null) => {
    if (file) {
      const validTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (validTypes.includes(file.type)) {
        setUploadedFile(file);

      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, TXT, or DOC file.",
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
      {uploadedFile ? (
        <div className="space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <div>
            <p className="font-medium text-foreground">{uploadedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setUploadedFile(null)}
            disabled={isGenerating}
            className="rounded-full"
          >
            Remove File
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative mx-auto w-fit">
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Upload className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-muted-foreground">
              Drag your file here, or <span className="text-primary underline cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>click here to upload</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: PDF, DOC, DOCX, TXT, MD
            </p>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-2xl">
              <p className="font-medium">File Limits:</p>
              <p>• PDF: Max 30MB, 100 pages</p>
              <p>• Other files: Max 10MB</p>
            </div>
          </div>
          <input
            type="file"
            onChange={handleFileUpload}
            accept="application/pdf,.pdf,text/plain,.txt,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
            className="hidden"
            id="file-upload"
          />
        </div>
      )}
    </div>
  );
};