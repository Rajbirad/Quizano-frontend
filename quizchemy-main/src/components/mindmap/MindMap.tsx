import React from 'react';
import './mindmap.css';

interface MindMapProps {
  data: {
    central_topic: string;
    branches: {
      topic: string;
      overview: string;
      key_points: string[];
    }[];
  };
}

export const MindMap: React.FC<MindMapProps> = ({ data }) => {
  // Dynamic radius based on number of branches
  const BASE_RADIUS = 120;
  const RADIUS = BASE_RADIUS + data.branches.length * 20;

  // Calculate container height based on radius
  const containerHeight = RADIUS * 2 + 200; // Extra 200px for padding and content overflow

  const getPosition = (index: number, total: number) => {
    // Distribute nodes evenly in a full circle, starting from top
    const angleStep = (2 * Math.PI) / total;
    const angle = index * angleStep - Math.PI / 2;
    
    return {
      left: `calc(50% + ${Math.cos(angle) * RADIUS}px)`,
      top: `calc(50% + ${Math.sin(angle) * RADIUS}px)`,
      angle: angle,
    };
  };

  return (
    <div className="relative w-full pt-40 pb-40" style={{ minHeight: `${containerHeight}px` }}>
      {/* Center Node */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="bg-blue-500 text-white px-4 py-3 rounded-lg w-[160px] text-center text-sm font-medium shadow transition-all duration-300 hover:scale-[1.02]">
          {data.central_topic}
        </div>
      </div>

      {/* Branches */}
      {data.branches.map((branch, idx) => {
        const pos = getPosition(idx, data.branches.length);
        return (
          <React.Fragment key={idx}>
            {/* Connection Line */}
            <div
              className="absolute left-1/2 top-1/2 z-0 h-[2px]"
              style={{
                width: `${RADIUS + 20}px`, // Added buffer for better alignment
                transform: `rotate(${pos.angle}rad)`,
                transformOrigin: '0 50%',
                background: 'linear-gradient(to right, #93C5FD, #E0F2FE)'
              }}
            />

            {/* Branch Content */}
            <div
              className="absolute w-[180px] z-10"
              style={{
                left: pos.left,
                top: pos.top,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="bg-blue-50 px-4 py-3 rounded-lg text-sm border shadow transition-all duration-300 hover:scale-[1.02]">
                <h3 className="font-medium text-gray-700 mb-2 text-sm">{branch.topic}</h3>
                <p className="text-gray-600 text-xs leading-snug whitespace-normal">{branch.overview}</p>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
