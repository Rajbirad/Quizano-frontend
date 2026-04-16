
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, Tag, Bell, Share2, Upload, Search, ExternalLink, Paperclip
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Note } from './types';

interface EditorActionButtonsProps {
  note: Note;
  onShare: () => void;
  onRemind: () => void;
  onColor: () => void;
}

export const EditorActionButtons: React.FC<EditorActionButtonsProps> = ({ 
  note,
  onShare, 
  onRemind,
  onColor
}) => {
  const { toast } = useToast();
  
  const handleAction = (action: string) => {
    toast({
      title: `${action} clicked`,
      description: `The ${action.toLowerCase()} feature will be available soon.`,
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-transparent border-gray-200"
        onClick={() => handleAction('Tags')}
      >
        <Tag className="h-4 w-4 mr-2" />
        Tags
      </Button>
      
      <Button 
        variant="outline"
        size="sm" 
        className="bg-transparent border-gray-200"
        onClick={onRemind}
      >
        <Bell className="h-4 w-4 mr-2" />
        Remind
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-transparent border-gray-200"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-transparent border-gray-200"
        onClick={onColor}
      >
        <span className="h-4 w-4 bg-purple-100 rounded-full mr-2"></span>
        Color
      </Button>
    </div>
  );
};
