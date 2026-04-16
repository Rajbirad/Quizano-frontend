
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  ListOrdered, 
  List, 
  Image, 
  Underline,
  Highlighter,
  Undo,
  Redo 
} from 'lucide-react';


interface FormattingToolbarProps {
  onFormatClick: (format: string) => void;
  onMediaUpload: (type: 'image') => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onFormatClick,
  onMediaUpload,
  onUndo,
  onRedo
}) => {
  const handleFormatClick = (format: string) => {
    onFormatClick(format);
  };

  const handleMediaClick = (type: 'image') => {
    onMediaUpload(type);
  };

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-md" style={{ opacity: 1, pointerEvents: 'auto' }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatClick('bold')}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatClick('italic')}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatClick('underline')}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatClick('ordered-list')}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatClick('unordered-list')}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border my-auto mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatClick('highlight')}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Highlight"
      >
        <Highlighter className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border my-auto mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border my-auto mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleMediaClick('image')}
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Add Image"
      >
        <Image className="h-4 w-4" />
      </Button>
    </div>
  );
};
