import React from 'react';

export const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    height="24" 
    width="24" 
    viewBox="0 0 50 58" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g fill="none" fillRule="evenodd">
      <g fillRule="nonzero">
        <path d="m46 30h2c1.1045695 0 2 .8954305 2 2s-.8954305 2-2 2h-46c-1.1045695 0-2-.8954305-2-2s.8954305-2 2-2z" fill="currentColor" opacity="0.2" />
        <path d="m4 34v-32c.0032948-1.10320187.89679813-1.9967052 2-2h32l8 8v26z" fill="currentColor" />
        <path d="m46 50v6c-.0032948 1.1032019-.8967981 1.9967052-2 2h-38c-1.10320187-.0032948-1.9967052-.8967981-2-2v-6z" fill="currentColor" opacity="0.8" />
        <path d="m38 0v6c0 1.1045695.8954305 2 2 2h6z" fill="currentColor" opacity="0.6" />
        <g fill="currentColor" opacity="0.4">
          <path d="m41 14h-32c-.55228475 0-1-.4477153-1-1s.44771525-1 1-1h32c.5522847 0 1 .4477153 1 1s-.4477153 1-1 1z" />
          <path d="m41 19h-32c-.55228475 0-1-.4477153-1-1s.44771525-1 1-1h32c.5522847 0 1 .4477153 1 1s-.4477153 1-1 1z" />
          <path d="m41 24h-32c-.55228475 0-1-.4477153-1-1s.44771525-1 1-1h32c.5522847 0 1 .4477153 1 1s-.4477153 1-1 1z" />
          <path d="m29 29h-20c-.55228475 0-1-.4477153-1-1s.44771525-1 1-1h20c.5522847 0 1 .4477153 1 1s-.4477153 1-1 1z" />
        </g>
      </g>
    </g>
  </svg>
);
