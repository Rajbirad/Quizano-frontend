
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MobileNavLinkProps {
  to: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const MobileNavLink: React.FC<MobileNavLinkProps> = ({ 
  to, 
  icon: Icon, 
  children 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`block px-3 py-2 rounded-md text-lg font-medium transition-colors ${
        isActive ? 'text-primary bg-accent/50' : 'text-foreground hover:bg-accent/30'
      } ${Icon ? 'flex items-center gap-2' : ''}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </Link>
  );
};
