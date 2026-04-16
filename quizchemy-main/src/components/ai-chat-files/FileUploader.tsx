import React, { useRef, useState } from 'react';
import { useFileContext, FileType } from './FileContext';
import { useToast } from '@/hooks/use-toast';
import { UploadArea } from './file-uploader/UploadArea';
import { FileList } from './file-uploader/FileList';
import { UploadProgress } from './file-uploader/UploadProgress';
import { validateFileSize, isSupportedFileType } from './file-uploader/fileUtils';
import DirectUploadService from './services/DirectUploadService';

export const FileUploader: React.FC = () => {
  const {
    files,
    addFile,
    removeFile,
    setSelectedFile,
    selectedFile,
    currentStep,
    setCurrentStep
  } = useFileContext();

  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<string>('');

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    await processFiles(selectedFiles);
    resetFileInput(); // allow re-upload of same file later
  };

  const processFiles = async (selectedFiles: FileList) => {
    const file = selectedFiles[0]; // we only handle the first file
    console.log('🚀 Starting file processing for:', file.name, 'Type:', file.type, 'Size:', file.size);
    setUploadingFile(file.name);
    setIsLoading(true);
    setUploadProgress(0);

    // File validations
    if (!validateFileSize(file)) {
      setIsLoading(false);
      return;
    }

    if (!isSupportedFileType(file.name)) {
      setIsLoading(false);
      return;
    }

    try {
      const uploadService = new DirectUploadService();

      // Use DirectUploadService for the upload with progress tracking
      const result = await uploadService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      // Extract file content for preview
      let extractedContent = '';
      try {
        const textContent = await file.text();
        extractedContent = textContent.substring(0, 5000); // First 5000 chars for preview
      } catch (error) {
        console.error('⚠️ Error extracting content for preview:', error);
        extractedContent = `[Error extracting content from ${file.name}]`;
      }

      // Extract suggestions and other metadata from the result
      const metadata = {
        ai_chat_suggestions: result.result?.ai_chat_suggestions || [],
        original_document_name: file.name,
        file_size: file.size,
        original_upload_date: new Date().toISOString(),
        duplicate: false,
        document_id: result.document_id
      };

      const newFile: FileType = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        content: extractedContent,
        originalFile: file,
        chatData: { document_id: result.document_id }
      };

      // ✅ Pass metadata into context
      addFile(newFile, metadata);

      // Set final progress and small delay for UI smoothness
      setUploadProgress(100);
      setTimeout(() => {
        setCurrentStep('results');
      }, 600);
    } catch (error: any) {
      console.error('Error in file upload process:', error);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input reference is not available');
    }
  };

  const handleFileClick = (file: any) => {
    setSelectedFile(selectedFile?.id === file.id ? null : file);
  };

  const handleProceedToResults = () => {
    if (files.length > 0) {
      setCurrentStep('results');
    }
  };

  return (
    <div className="h-full">
      <input
        type="file"
        id="file-upload"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="text/plain,.txt,application/javascript,.js,.jsx,application/typescript,.ts,.tsx,application/json,.json,text/markdown,.md,text/css,.css,text/html,.html,application/xml,text/xml,.xml,text/csv,.csv,application/x-yaml,text/yaml,.yml,.yaml,text/plain,.log,application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/vnd.ms-powerpoint,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx,image/jpeg,.jpg,.jpeg,image/png,.png,image/gif,.gif,image/bmp,.bmp,image/webp,.webp"
        multiple
      />

      {currentStep === 'upload' && (
        <>
          {!isLoading ? (
            <UploadArea
              isLoading={isLoading}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleUploadClick={handleUploadClick}
            />
          ) : (
            <UploadProgress fileName={uploadingFile} progress={uploadProgress} />
          )}
        </>
      )}

      {files.length > 0 && !isLoading && currentStep === 'results' && (
        <div className="space-y-4">
          <FileList
            files={files}
            selectedFile={selectedFile}
            onFileSelect={handleFileClick}
            onFileRemove={removeFile}
          />
          <div className="flex justify-end">
            <button className="btn" onClick={handleProceedToResults}>
              View Results
            </button>
          </div>
        </div>
      )}

      {files.length === 0 && !isLoading && currentStep === 'results' && (
        <div className="py-8 text-center text-muted-foreground">
          No files uploaded yet
        </div>
      )}
    </div>
  );
};
