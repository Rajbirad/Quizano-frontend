
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ContentEditor } from '@/components/flashcard-creator/ContentEditor';

interface FlashcardFormProps {
  frontContent: string;
  backContent: string;
  frontMediaType: 'none' | 'image' | 'video' | 'youtube';
  frontMediaUrl: string;
  backMediaType: 'none' | 'image' | 'video' | 'youtube';
  backMediaUrl: string;
  onFrontContentChange: (content: string) => void;
  onBackContentChange: (content: string) => void;
  onFrontMediaChange: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
  onBackMediaChange: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
  onClearFrontMedia: () => void;
  onClearBackMedia: () => void;
}

export const FlashcardForm: React.FC<FlashcardFormProps> = ({
  frontContent,
  backContent,
  frontMediaType,
  frontMediaUrl,
  backMediaType,
  backMediaUrl,
  onFrontContentChange,
  onBackContentChange,
  onFrontMediaChange,
  onBackMediaChange,
  onClearFrontMedia,
  onClearBackMedia
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Front of Card */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Front of Card</Label>
        
        <ContentEditor
          content={frontContent}
          onContentChange={onFrontContentChange}
          mediaType={frontMediaType}
          mediaUrl={frontMediaUrl}
          onMediaChange={onFrontMediaChange}
          onClearMedia={onClearFrontMedia}
          placeholder="Enter the front content of your flashcard..."
        />
      </div>
      
      {/* Back of Card */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Back of Card</Label>
        
        <ContentEditor
          content={backContent}
          onContentChange={onBackContentChange}
          mediaType={backMediaType}
          mediaUrl={backMediaUrl}
          onMediaChange={onBackMediaChange}
          onClearMedia={onClearBackMedia}
          placeholder="Enter the back content of your flashcard..."
        />
      </div>
    </div>
  );
};
