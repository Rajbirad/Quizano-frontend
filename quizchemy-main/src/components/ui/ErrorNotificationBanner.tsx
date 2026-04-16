import { AlertCircle, X } from 'lucide-react';

interface ErrorNotificationBannerProps {
  show: boolean;
  message: string | null;
  onDismiss: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorNotificationBanner({
  show,
  message,
  onDismiss,
  variant = 'error'
}: ErrorNotificationBannerProps) {
  if (!show || !message) return null;

  const variants = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      button: 'text-red-600 hover:text-red-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      button: 'text-amber-600 hover:text-amber-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      button: 'text-blue-600 hover:text-blue-700'
    }
  };

  const style = variants[variant];

  return (
    <div className={`mb-8 p-4 ${style.bg} border ${style.border} rounded-lg flex items-center gap-3 justify-between`}>
      <div className="flex items-center gap-3">
        <AlertCircle className={`h-5 w-5 ${style.icon} flex-shrink-0`} />
        <p className={`${style.text} font-medium`}>{message}</p>
      </div>
      <button 
        onClick={onDismiss}
        className={`${style.button} transition-colors flex-shrink-0`}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
