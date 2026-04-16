import React from 'react';
import { Loader2, Network } from 'lucide-react';
import D3MindMap from '@/components/ai-chat-files/D3MindMap';

interface Branch {
  topic: string;
  overview: string;
  key_points: string[];
  headings?: string[];
  paragraphs?: string[];
}

interface MindMapData {
  central_topic: string;
  branches: Branch[];
}

interface MindMapOutputProps {
  videoId: string;
  mindMapData: MindMapData | null;
  loading: boolean;
  error: string | null;
}

export const MindMapOutput: React.FC<MindMapOutputProps> = ({ videoId, mindMapData, loading, error }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Generating mind map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!mindMapData) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <Network className="h-12 w-12 mb-2 opacity-50" />
        <p>No mind map available</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] relative">
    <D3MindMap summary={mindMapData} />
    </div>
  );
};
