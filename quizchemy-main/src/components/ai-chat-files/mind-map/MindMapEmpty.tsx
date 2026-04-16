
import React from 'react';
import { Button } from '@/components/ui/button';
import { Network } from 'lucide-react';

interface MindMapEmptyProps {
  onGenerate: () => void;
}

export const MindMapEmpty: React.FC<MindMapEmptyProps> = ({ onGenerate }) => {
  return (
    <div className="text-center py-8">
      <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">
        Create a visual mind map to see the relationships between concepts in the document
      </p>
      <Button onClick={onGenerate}>
        <Network className="h-4 w-4 mr-2" />
        Generate Mind Map
      </Button>
    </div>
  );
};
