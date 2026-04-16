
import React from 'react';

interface MindMapVisualProps {
  zoom: number;
}

export const MindMapVisual: React.FC<MindMapVisualProps> = ({ zoom }) => {
  return (
    <div className="flex-1 overflow-auto">
      <div 
        className="mind-map-container relative bg-white border rounded-lg p-4 min-h-[400px] overflow-hidden" 
        style={{ transform: `scale(${zoom/100})`, transformOrigin: 'center center' }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            {/* Main topic */}
            <div className="absolute top-[120px] left-[160px] bg-primary/20 border border-primary rounded-full p-3 w-32 h-32 flex items-center justify-center text-center">
              Main Topic
            </div>
            
            {/* Subtopics */}
            <div className="absolute top-[50px] left-[60px] bg-blue-100 border border-blue-400 rounded-lg p-2 w-24 h-24 flex items-center justify-center text-center text-sm">
              Subtopic 1
            </div>
            
            <div className="absolute top-[180px] left-[40px] bg-green-100 border border-green-400 rounded-lg p-2 w-24 h-24 flex items-center justify-center text-center text-sm">
              Subtopic 2
            </div>
            
            <div className="absolute top-[50px] left-[260px] bg-purple-100 border border-purple-400 rounded-lg p-2 w-24 h-24 flex items-center justify-center text-center text-sm">
              Subtopic 3
            </div>
            
            <div className="absolute top-[180px] left-[280px] bg-orange-100 border border-orange-400 rounded-lg p-2 w-24 h-24 flex items-center justify-center text-center text-sm">
              Subtopic 4
            </div>
            
            {/* Connection lines */}
            <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <line x1="160" y1="120" x2="90" y2="70" stroke="#888" strokeWidth="1" />
              <line x1="160" y1="120" x2="80" y2="190" stroke="#888" strokeWidth="1" />
              <line x1="200" y1="120" x2="260" y2="70" stroke="#888" strokeWidth="1" />
              <line x1="200" y1="120" x2="280" y2="190" stroke="#888" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
