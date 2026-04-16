import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackToQuizButtonProps {
  className?: string;
  variant?: 'ghost' | 'outline' | 'default' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function BackToQuizButton({ 
  className = '', 
  variant = 'ghost',
  size = 'default'
}: BackToQuizButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/quiz');
  };

  return (
    <Button 
      onClick={handleBack} 
      variant={variant}
      size={size}
      className={className}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
}
