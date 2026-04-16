
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileIcon, getFileIconColor, formatFileSize } from './fileUtils';

interface FileItemProps {
  file: {
    id: string;
    name: string;
    size: number;
  };
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  isSelected,
  onSelect,
  onRemove,
}) => {
  const FileIcon = getFileIcon(file.name);
  const iconColorClass = getFileIconColor(file.name);
  
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
        isSelected ? 
        'bg-primary/10 border border-primary/30' : 
        'bg-accent/50 hover:bg-accent border border-transparent'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <FileIcon className={`h-4 w-4 ${iconColorClass}`} />
        <div className="overflow-hidden">
          <p className="truncate font-medium text-sm">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
