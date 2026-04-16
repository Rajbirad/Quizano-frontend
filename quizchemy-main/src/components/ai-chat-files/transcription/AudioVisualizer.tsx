import React from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  isPaused: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, isPaused }) => {
  if (!isRecording) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-pink-500 to-red-400 rounded-full transition-all duration-150 ${
            isPaused ? 'h-2' : 'animate-pulse'
          }`}
          style={{
            height: isPaused ? '8px' : `${Math.random() * 32 + 8}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`
          }}
        />
      ))}
    </div>
  );
};