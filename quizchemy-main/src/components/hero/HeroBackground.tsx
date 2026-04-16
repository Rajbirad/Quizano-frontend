
import React from 'react';

export const HeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Light gradient background with illustration elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[hsl(var(--flashcard-concept))] opacity-20 blur-3xl transform rotate-45" />
      <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-[hsl(var(--flashcard-fact))] opacity-30 blur-3xl" />
      <div className="absolute bottom-10 right-20 w-40 h-40 rounded-full bg-[hsl(var(--flashcard-definition))] opacity-30 blur-3xl" />
      
      {/* Subtle illustration of students using AI tools */}
      <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none hidden lg:block">
        <img 
          src="https://via.placeholder.com/450x300?text=Students+Using+AI" 
          alt="Students using AI tools" 
          className="w-[450px]"
        />
      </div>
    </div>
  );
};
