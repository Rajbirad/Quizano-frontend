
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MindMapControlsProps {}

export const MindMapControls: React.FC<MindMapControlsProps> = () => {
  const { toast } = useToast();
  
  const downloadMindMap = () => {
  };

  const openInNewTab = () => {
    // Instead of creating a new window with HTML, we'll open a new tab with the current URL
    // This ensures the app will properly load and initialize in the new tab
    const newTabUrl = window.location.href;
    window.open(newTabUrl, '_blank');
  };

  return null;
};
