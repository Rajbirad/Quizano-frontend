import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
interface NavLinkProps {
  to: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}
export const NavLink: React.FC<NavLinkProps> = ({
  to,
  icon: Icon,
  children,
  className = ''
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return <Link to={to} className={`font-medium transition-colors flex items-center gap-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} ${className}`}>
      {Icon && <Icon className="h-4 w-4" />}
      <span className="text-sm font-medium my-0 py-0 px-0 mx-0 text-slate-900">{children}</span>
    </Link>;
};