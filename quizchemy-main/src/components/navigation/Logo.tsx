
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link 
      to="/" 
      className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
    >
      Quizano
    </Link>
  );
};
