
import React from 'react';

export const MindMapLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-6 flex-1">
      <div className="animate-pulse flex space-x-2 mb-4">
        <div className="h-3 w-3 bg-primary rounded-full"></div>
        <div className="h-3 w-3 bg-primary rounded-full"></div>
        <div className="h-3 w-3 bg-primary rounded-full"></div>
      </div>
      <p className="text-muted-foreground">Generating mind map...</p>
    </div>
  );
};
