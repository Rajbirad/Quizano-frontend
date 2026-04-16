import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { validateFile, FileValidationOptions, createFileSignature } from '@/utils/file-validation';

interface UseFileUploadOptions extends FileValidationOptions {
  onFileSelected?: (file: File) => void;
  trackProcessed?: boolean;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = useCallback((file: File) => {
    const validation = validateFile(file, options);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    
    if (options.onFileSelected) {
      options.onFileSelected(file);
    }
  }, [options, toast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const checkIfProcessed = useCallback((file: File, params: Record<string, any>) => {
    if (!options.trackProcessed) return false;
    const signature = createFileSignature(file, params);
    return processedFiles.has(signature);
  }, [options.trackProcessed, processedFiles]);

  const markAsProcessed = useCallback((file: File, params: Record<string, any>) => {
    if (!options.trackProcessed) return;
    const signature = createFileSignature(file, params);
    setProcessedFiles(prev => new Set(prev).add(signature));
  }, [options.trackProcessed]);

  return {
    uploadedFile,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeFile,
    checkIfProcessed,
    markAsProcessed
  };
}
