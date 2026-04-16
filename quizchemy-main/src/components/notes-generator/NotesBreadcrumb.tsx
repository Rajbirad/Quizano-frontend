
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface NotesBreadcrumbProps {
  path: Array<{id: string, name: string, type: 'folder' | 'note'}>;
  onNavigate: (id: string) => void;
}

export const NotesBreadcrumb: React.FC<NotesBreadcrumbProps> = ({ path, onNavigate }) => {
  if (path.length === 0) {
    return (
      <div className="flex items-center px-2 py-1.5 text-sm border-b border-gray-200">
        <Home className="h-4 w-4 mr-1 text-muted-foreground" />
        <span>Notes</span>
      </div>
    );
  }

  return (
    <div className="flex items-center overflow-x-auto px-2 py-1.5 text-sm gap-1 scrollbar-hide whitespace-nowrap border-b border-gray-200">
      <Home 
        className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          // Navigate to root
          onNavigate('root');
        }}
      />
      
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground mx-1" />
          <span 
            className={`cursor-pointer hover:text-primary transition-colors truncate max-w-xs ${
              index === path.length - 1 ? 'font-medium' : ''
            } ${item.type === 'folder' ? 'text-gray-600' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id);
            }}
          >
            {item.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};
