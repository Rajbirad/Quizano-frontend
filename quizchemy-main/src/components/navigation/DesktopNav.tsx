
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavLink } from './NavLink';

interface DesktopNavProps {
  onGetStarted: () => void;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <NavLink to="/features" className="text-sm font-medium">Features</NavLink>
      <NavLink to="/use-cases" className="text-sm font-medium">Use Cases</NavLink>
      <NavLink to="/blog" className="text-sm font-medium">Blog</NavLink>
      <NavLink to="/pricing" className="text-sm font-medium">Pricing</NavLink>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={handleLogin}>
          Login
        </Button>
        <Button size="sm" className="gradient-button" onClick={onGetStarted}>
          Get Started
        </Button>
      </div>
    </nav>
  );
};
