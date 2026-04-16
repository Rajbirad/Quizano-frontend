
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './navigation/Logo';
import { DesktopNav } from './navigation/DesktopNav';
import { MobileNav } from './navigation/MobileNav';
import { NavToggle } from './navigation/NavToggle';

export const Nav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <DesktopNav onGetStarted={handleGetStarted} />
          <NavToggle isOpen={isOpen} onClick={toggleMenu} />
        </div>
      </div>
      
      <MobileNav isOpen={isOpen} onGetStarted={handleGetStarted} />
    </header>
  );
};
