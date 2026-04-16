
import React from 'react';
import { Menu, X } from 'lucide-react';

interface NavToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

export const NavToggle: React.FC<NavToggleProps> = ({ isOpen, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="md:hidden rounded-md p-2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle menu"
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
};
