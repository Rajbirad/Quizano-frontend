
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, PenLine } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FloatingNewButtonProps {
  onNewNote: () => void;
}

export const FloatingNewButton: React.FC<FloatingNewButtonProps> = ({ 
  onNewNote
}) => {
  return (
    <div className="fixed right-6 bottom-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onNewNote} className="cursor-pointer">
            <PenLine className="mr-2 h-4 w-4" />
            New Note
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
