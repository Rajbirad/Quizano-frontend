
import React from 'react';

export const HeroHeading: React.FC = () => {
  return (
    <div className="text-center animate-fade-in">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
        <span className="gradient-text">
          Master Any Subject Effortlessly
        </span>
        <br />
        <span>with AI-Powered Learning!</span>
      </h1>
      
      <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
        Transform your notes, PDFs, and videos into flashcards, quizzes, and interactive study guides—powered by AI.
      </p>
    </div>
  );
};
