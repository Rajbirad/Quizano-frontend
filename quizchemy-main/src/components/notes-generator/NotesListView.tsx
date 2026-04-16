
import React from 'react';
import { Note } from './types';
import { formatDistanceToNow } from 'date-fns';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface NotesListViewProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onToggleStar,
  onDeleteNote
}) => {
  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...notes].sort((a, b) => {
    // Pinned notes first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by updated date
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  
  const getColorClass = (color: string) => {
    switch (color) {
      case 'pink': return 'border-l-pink-400';
      case 'purple': return 'border-l-purple-400';
      case 'blue': return 'border-l-blue-400';
      case 'green': return 'border-l-green-400';
      case 'yellow': return 'border-l-yellow-400';
      default: return 'border-l-transparent';
    }
  };
  
  return (
    <div className="w-72 border-r border-gray-200 flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <h2 className="font-medium">Notes ({notes.length})</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No notes found
            </div>
          ) : (
            sortedNotes.map(note => (
              <div 
                key={note.id}
                className={`mb-2 p-3 rounded-md cursor-pointer border-l-4 hover:bg-gray-50 transition-colors ${
                  getColorClass(note.color)
                } ${
                  activeNoteId === note.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectNote(note.id)}
              >
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium truncate">{note.title}</h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(note.id);
                      }}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 truncate">
                  {note.content.split('\n')[0]}
                </p>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </div>
                  
                  {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs py-0 px-2 bg-gray-50"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs py-0 px-2 bg-gray-50">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
