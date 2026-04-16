import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file: File;
  id: string;
}

interface UploadZoneProps {
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  disabled?: boolean;
}

export function UploadZone({ files, onFilesAdded, onFileRemove, disabled }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"]
    },
    disabled,
    multiple: false
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "min-h-64 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
          isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover-elevate"
        )}
        data-testid="dropzone-upload"
      >
        <input {...getInputProps()} data-testid="input-file" />
        <div className={cn(
          "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform",
          isDragActive && "scale-110"
        )}>
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-semibold mb-2">
          {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse files
        </p>
        <p className="text-xs text-muted-foreground">
          Supports PDF files up to 50MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 p-3 bg-card rounded-lg border border-card-border"
              data-testid={`file-item-${uploadedFile.id}`}
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.file.size)}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(uploadedFile.id);
                }}
                data-testid={`button-remove-${uploadedFile.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
