
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MobileNavLink } from './MobileNavLink';

interface MobileNavProps {
  isOpen: boolean;
  onGetStarted: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onGetStarted }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="md:hidden">
      <div className="px-4 pt-2 pb-4 space-y-1 bg-background/95 backdrop-blur-lg border-b animate-fade-in">
        <MobileNavLink to="/features">Features</MobileNavLink>
        <MobileNavLink to="/use-cases">Use Cases</MobileNavLink>
        <MobileNavLink to="/blog">Blog</MobileNavLink>
        <MobileNavLink to="/pricing">Pricing</MobileNavLink>
        
        <div className="pt-2 space-y-2">
          <Button variant="ghost" className="w-full" onClick={handleLogin}>
            Login
          </Button>
          <Button className="w-full gradient-button" onClick={onGetStarted}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};
