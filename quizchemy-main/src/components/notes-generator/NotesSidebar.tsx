
import React, { useState } from 'react';
import { Note, Tag, Folder } from './types';
import { FileText, Tag as TagIcon, Star, Clock, Hash, FolderIcon, ChevronRight, ChevronDown, Plus, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface NotesSidebarProps {
  notes: Note[];
  tags: Tag[];
  folders: Folder[];
  onSelectNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onCreateFolder?: (name: string) => void;
  onCreateNote: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
  notes,
  tags,
  folders,
  onSelectNote,
  onTogglePin,
  onCreateFolder,
  onCreateNote,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [activeSection, setActiveSection] = useState<string>('all-notes');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  // Count notes for each section
  const allNotesCount = notes.length;
  const pinnedNotes = notes.filter(note => note.isPinned);
  const recentNotes = [...notes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);

  const handleSelectSection = (section: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    setActiveSection(section);
    
    // If selecting a specific note, trigger the onSelectNote callback
    if (section.startsWith('note-')) {
      const noteId = section.replace('note-', '');
      onSelectNote(noteId);
    }
  };
  
  const renderSidebarItem = (
    id: string,
    icon: React.ReactNode,
    label: string,
    count?: number,
    color?: string
  ) => {
    return (
      <Button
        key={id}
        variant="ghost"
        className={`w-full justify-start py-2 px-3 rounded-sm ${
          activeSection === id 
            ? 'bg-primary/10 text-primary font-medium' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={(e) => handleSelectSection(id, e)}
      >
        <div className="flex items-center w-full">
          <span className={`mr-2 ${color || ''}`}>{icon}</span>
          <span className="truncate">{label}</span>
          {count !== undefined && (
            <span className="ml-auto text-xs text-gray-500">{count}</span>
          )}
        </div>
      </Button>
    );
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder(newFolderName);
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };
  
  const renderFolderNotes = (folderId: string) => {
    const folderNotes = notes.filter(note => note.folderId === folderId);
    
    return (
      <div className="pl-7">
        {folderNotes.map(note => (
          <Button
            key={note.id}
            variant="ghost"
            className={`w-full justify-start py-1.5 px-2 text-sm rounded-sm ${
              activeSection === `note-${note.id}` 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={(e) => handleSelectSection(`note-${note.id}`, e)}
          >
            <FileText className="h-3.5 w-3.5 mr-2" />
            <span className="truncate">{note.title}</span>
          </Button>
        ))}
        {folderNotes.length === 0 && (
          <div className="text-xs text-gray-500 py-1 px-2">No notes in this folder</div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 border-r-0' : 'w-64'}`}>
        <div className="p-3 border-b border-gray-200">
        <Button 
          variant="default" 
          className="w-full justify-start bg-black text-white hover:bg-gray-800"
          onClick={onCreateNote}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderSidebarItem(
            'all-notes', 
            <FileText className="h-4 w-4" />, 
            'All Notes',
            allNotesCount
          )}
          
          {renderSidebarItem(
            'pinned', 
            <Star className="h-4 w-4" />, 
            'Pinned',
            pinnedNotes.length
          )}
          
          {renderSidebarItem(
            'recent', 
            <Clock className="h-4 w-4" />, 
            'Recent'
          )}
          
          <div className="mt-6 mb-2 px-3 flex justify-between items-center">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              NOTEBOOKS
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setShowNewFolder(!showNewFolder)}
            >
              <Plus className="h-3.5 w-3.5 text-gray-500" />
            </Button>
          </div>
          
          {showNewFolder && (
            <form onSubmit={handleNewFolder} className="px-3 mb-2">
              <div className="flex items-center gap-1">
                <Input 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name..."
                  className="h-7 text-sm"
                />
                <Button type="submit" size="sm" className="h-7 px-2">Add</Button>
              </div>
            </form>
          )}
          
          {folders.map(folder => (
            <Collapsible 
              key={folder.id} 
              open={expandedFolders[folder.id]} 
              className="mb-1"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start py-2 px-3 rounded-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => toggleFolder(folder.id)}
                >
                  <div className="flex items-center w-full">
                    <FolderIcon className="h-4 w-4 mr-2" />
                    <span className="truncate">{folder.name}</span>
                    {expandedFolders[folder.id] ? (
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {renderFolderNotes(folder.id)}
              </CollapsibleContent>
            </Collapsible>
          ))}
          
          <div className="mt-6 mb-2 px-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              TAGS
            </h3>
          </div>
          
          <div className="px-3 flex flex-wrap gap-1 mb-2">
            {tags.map(tag => {
              const tagNotes = notes.filter(note => note.tags && note.tags.includes(tag.name));
              return (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className={`bg-gray-100 cursor-pointer ${
                    activeSection === `tag-${tag.id}` ? 'border-primary text-primary' : 'text-gray-700'
                  }`}
                  onClick={(e) => handleSelectSection(`tag-${tag.id}`, e)}
                >
                  #{tag.name}
                  <span className="ml-1 text-xs">{tagNotes.length}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
