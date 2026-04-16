import React from 'react';
import { Link } from 'lucide-react';

interface WebsiteUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const WebsiteUrlInput: React.FC<WebsiteUrlInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Enter website URL (e.g., https://example.com)',
  className = '',
  error,
}) => {
  return (
    <div className="relative">
      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-4 pl-12 border-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-xl focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
