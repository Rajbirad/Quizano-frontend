
import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Processing your files...' 
}) => {
  return (
    <div className="py-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
