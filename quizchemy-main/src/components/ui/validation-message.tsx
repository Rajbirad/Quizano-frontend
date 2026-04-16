import React from 'react';
import { Button } from './button';
import { X } from 'lucide-react';

export interface ValidationMessageProps {
  type: 'error' | 'success' | null;
  message: string | null;
  onDismiss?: () => void;
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ 
  type, 
  message, 
  onDismiss,
  className = ''
}) => {
  if (!message) return null;

  return (
    <div 
      className={`p-4 rounded-lg flex items-center justify-between ${
        type === 'error' 
          ? 'bg-destructive/10 text-destructive border border-destructive/20' 
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      } ${className}`}
    >
      <span className="text-sm">{message}</span>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 hover:bg-transparent"
        >
          <span className="sr-only">Dismiss</span>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
