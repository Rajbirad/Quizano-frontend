
import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface CardAudioProps {
  text: string;
}

export const CardAudio: React.FC<CardAudioProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    
    // Use Speech Synthesis API
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    
    // Event handler for when speech is done
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      className="mt-3 flex items-center gap-1 text-sm text-primary/70 hover:text-primary"
      onClick={playAudio}
    >
      <Volume2 className="h-3 w-3" />
      <span className="text-xs">Listen</span>
    </button>
  );
};
