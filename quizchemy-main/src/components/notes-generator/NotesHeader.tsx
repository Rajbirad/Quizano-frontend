
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, ImportIcon, Globe, Search as SearchIcon, Plus, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotesHeaderProps {
  onSearch: (query: string) => void;
  onImport: () => void;
  onWebClipper: () => void;
  onNewNote: () => void;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  onSearch,
  onImport,
  onWebClipper,
  onNewNote
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-white">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Notecraft</h1>
        <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition-colors">
          <Home className="h-5 w-5 mr-1" />
          <span className="text-sm">Home</span>
        </Link>
        <Button variant="ghost" size="icon" className="text-gray-600">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 mx-4 max-w-xl">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-9 bg-gray-100 border-gray-200 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onImport} className="flex items-center">
          <ImportIcon className="h-4 w-4 mr-2" />
          Import
        </Button>
        
        <Button variant="outline" size="sm" onClick={onWebClipper} className="flex items-center">
          <Globe className="h-4 w-4 mr-2" />
          Web Clipper
        </Button>
      </div>
      
      <div className="ml-2">
        <Button variant="default" size="sm" onClick={onNewNote} className="bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>
    </header>
  );
};
