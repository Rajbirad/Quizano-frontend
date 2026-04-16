import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileItem } from './FileItem';
interface FileListProps {
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    content: string;
  }>;
  selectedFile: {
    id: string;
  } | null;
  onFileSelect: (file: any) => void;
  onFileRemove: (id: string) => void;
}
export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFile,
  onFileSelect,
  onFileRemove
}) => {
  if (files.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">
        No files uploaded yet
      </div>;
  }
  return <div>
      <p className="text-sm font-medium mb-2 text-left mx-px my-[10px] px-0">Uploaded Files ({files.length})</p>
      <ScrollArea className="max-h-64 pr-4">
        <div className="space-y-2">
          {files.map(file => <FileItem key={file.id} file={file} isSelected={selectedFile?.id === file.id} onSelect={() => onFileSelect(file)} onRemove={() => onFileRemove(file.id)} />)}
        </div>
      </ScrollArea>
    </div>;
};