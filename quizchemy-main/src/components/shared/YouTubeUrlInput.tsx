import React from 'react';

interface YouTubeUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const YouTubeUrlInput: React.FC<YouTubeUrlInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'https://www.youtube.com/watch?v=...',
  className = '',
  error,
}) => {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M23.498 6.186a2.9 2.9 0 0 0-2.04-2.054C19.644 3.6 12 3.6 12 3.6s-7.644 0-9.458.532A2.9 2.9 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.9 2.9 0 0 0 2.04 2.054C4.356 20.4 12 20.4 12 20.4s7.644 0 9.458-.532a2.9 2.9 0 0 0 2.04-2.054C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.75 12l-6 3.568z" />
      </svg>
      <input
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-4 pl-12 border-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
