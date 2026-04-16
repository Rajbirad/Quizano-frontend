import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from '@/lib/toast';
import { makeAuthenticatedFormRequest } from "@/lib/api-utils";

export const HomeworkUploader: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB.");
        return;
      }
      
      setFile(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error(`Invalid file type. Please upload: ${allowedTypes.join(', ')}`);
        return;
      }
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await makeAuthenticatedFormRequest(
        'https://127.0.0.1:8000/api/document/generate-detailed-qa',
        formData
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to analyze document");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to analyze document");
      }

      navigate("/app/ai-humanizer-result", { state: { result } });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to analyze document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {file ? (
        <div className="space-y-4">
          <div className="border rounded-lg bg-background/95 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={isLoading}
                className="ml-2"
              >
                Change
              </Button>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyze Document
              </>
            )}
          </Button>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/40'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <label htmlFor="homework-file" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="/icons/upload.svg" alt="" className="w-full h-full" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">
                Click to upload <span className="text-primary">or drag and drop</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, Word Document, or Text File (max. 10MB)
              </p>
            </div>
            <input
              id="homework-file"
              type="file"
              className="hidden"
              accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>
        </div>
      )}
    </div>
  );
};