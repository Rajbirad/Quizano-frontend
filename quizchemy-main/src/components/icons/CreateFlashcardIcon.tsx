import React from 'react';

export const CreateFlashcardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main document shape */}
    <path 
      d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" 
      fill="currentColor"
      fillOpacity="0.2"
    />
    {/* Text lines */}
    <path 
      d="M8 7H16M8 11H16M8 15H13" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    {/* TXT Label */}
    <path 
      d="M7 18H17" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M9.5 17v-2h1v2h-1zm2 0v-2h1v2h-1zm2 0v-2h1v2h-1z" 
      fill="currentColor"
    />
  </svg>
);
