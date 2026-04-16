
import React, { useEffect, useRef } from 'react';
import { HeroHeading } from './hero/HeroHeading';
import { HeroButtons } from './hero/HeroButtons';
import { HeroBackground } from './hero/HeroBackground';

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroElement = heroRef.current;
      
      if (heroElement) {
        // Parallax effect
        heroElement.style.backgroundPositionY = `${scrollY * 0.5}px`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden" ref={heroRef}>
      {/* Background Elements */}
      <HeroBackground />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-32 md:pb-40">
        <HeroHeading />
        <HeroButtons />
        {/* FeatureCards removed */}
      </div>
    </div>
  );
};
