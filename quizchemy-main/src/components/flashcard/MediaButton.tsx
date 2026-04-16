
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface MediaButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

export const MediaButton: React.FC<MediaButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  isActive
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClick}
      className={isActive ? 'bg-primary/10 border-primary' : ''}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};
