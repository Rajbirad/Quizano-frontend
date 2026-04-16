import React from 'react';
import { Routes, useLocation } from 'react-router-dom';

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ children }) => {
  const location = useLocation();

  return (
    <Routes location={location}>
      {children}
    </Routes>
  );
};
