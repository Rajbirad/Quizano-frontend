import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface LoadingTransitionProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  loadingText = "Loading...",
  children
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Quizano
          </h2>
          <p className="text-slate-600">
            {loadingText}
          </p>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
};
