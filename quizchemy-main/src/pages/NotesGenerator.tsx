
import React, { useState, useEffect } from 'react';
import { NotesEditor } from '@/components/notes-generator/NotesEditor';
import { NotesSidebar } from '@/components/notes-generator/NotesSidebar';
import { NotesHeader } from '@/components/notes-generator/NotesHeader';
import { NotesListView } from '@/components/notes-generator/NotesListView';
import { FloatingNewButton } from '@/components/notes-generator/FloatingNewButton';
import { Note, Folder, Tag } from '@/components/notes-generator/types';
import { useToast } from '@/components/ui/use-toast';
import { ChevronsRight, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotesBreadcrumb } from '@/components/notes-generator/NotesBreadcrumb';

const NotesGenerator: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showNotesList, setShowNotesList] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{id: string, name: string, type: 'folder' | 'note'}>>([]);
  const { toast } = useToast();

  // Initialize with demo content
  useEffect(() => {
    // Load from localStorage if exists
    const savedFolders = localStorage.getItem('notecraft-folders');
    const savedNotes = localStorage.getItem('notecraft-notes');
    const savedTags = localStorage.getItem('notecraft-tags');
    
    if (savedFolders && savedNotes) {
      try {
        setFolders(JSON.parse(savedFolders));
        setNotes(JSON.parse(savedNotes));
        if (savedTags) setTags(JSON.parse(savedTags));
      } catch (e) {
        console.error('Failed to parse saved data:', e);
        initializeDemoContent();
      }
    } else {
      initializeDemoContent();
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (folders.length || notes.length) {
      localStorage.setItem('notecraft-folders', JSON.stringify(folders));
      localStorage.setItem('notecraft-notes', JSON.stringify(notes));
      localStorage.setItem('notecraft-tags', JSON.stringify(tags));
    }
  }, [folders, notes, tags]);

  // Update active note when it changes
  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find(n => n.id === activeNoteId);
      setActiveNote(note || null);
      setShowEditor(true);
      
      // Update breadcrumb path
      updateBreadcrumbPath(activeNoteId);
    } else {
      setActiveNote(null);
      setCurrentPath([]);
    }
  }, [activeNoteId, notes, folders]);

  const updateBreadcrumbPath = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const path: Array<{id: string, name: string, type: 'folder' | 'note'}> = [];
    
    // Add folder chain if note is in a folder
    if (note.folderId) {
      let currentFolder = folders.find(f => f.id === note.folderId);
      const folderChain = [];
      
      while (currentFolder) {
        folderChain.unshift({
          id: currentFolder.id,
          name: currentFolder.name,
          type: 'folder' as const
        });
        
        if (currentFolder.parentId) {
          currentFolder = folders.find(f => f.id === currentFolder?.parentId);
        } else {
          currentFolder = null;
        }
      }
      
      path.push(...folderChain);
    }
    
    // Add the note itself
    path.push({
      id: note.id,
      name: note.title,
      type: 'note' as const
    });
    
    setCurrentPath(path);
  };

  const initializeDemoContent = () => {
    const demoFolders: Folder[] = [
      { id: 'f1', name: 'Work', parentId: null },
      { id: 'f2', name: 'Personal', parentId: null },
      { id: 'f3', name: 'Projects', parentId: 'f1' }
    ];
    
    const demoTags: Tag[] = [
      { id: 't1', name: 'ideas' },
      { id: 't2', name: 'projects' },
      { id: 't3', name: 'work' },
      { id: 't4', name: 'meetings' },
      { id: 't5', name: 'personal' },
      { id: 't6', name: 'reading' },
    ];

    const demoNotes: Note[] = [
      { 
        id: 'n1', 
        title: 'Project Ideas', 
        content: '1. Build a personal finance tracker\n2. Create a recipe collection app\n3. Design a productivity dashboard', 
        folderId: 'f3', 
        tags: ['ideas', 'projects'],
        isPinned: false,
        isStarred: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: 'pink'
      },
      { 
        id: 'n2', 
        title: 'Meeting Notes', 
        content: '- Discussed Q2 goals\n- New feature prioritization\n- Team structure', 
        folderId: 'f1',
        tags: ['work', 'meetings'],
        isPinned: false,
        isStarred: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        color: 'green'
      },
      { 
        id: 'n3', 
        title: 'Books to Read', 
        content: '- Atomic Habits\n- Deep Work\n- The Psychology of Money', 
        folderId: 'f2',
        tags: ['personal', 'reading'],
        isPinned: false,
        isStarred: false,
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
        color: 'purple'
      }
    ];

    setFolders(demoFolders);
    setTags(demoTags);
    setNotes(demoNotes);
  };

  const handleCreateNote = (title: string, folderId: string | null = null) => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title,
      content: '',
      folderId,
      tags: [],
      isPinned: false,
      isStarred: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: 'default'
    };
    
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    
    toast({
      title: "Note created",
      description: `Note "${title}" has been created successfully.`
    });
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: `f${Date.now()}`,
      name,
      parentId: null
    };
    
    setFolders([...folders, newFolder]);
    
    toast({
      title: "Notebook created",
      description: `Notebook "${name}" has been created successfully.`
    });
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() } 
        : note
    ));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    
    if (activeNoteId === id) {
      setActiveNoteId(null);
      setShowEditor(false);
    }
    
    toast({
      title: "Note deleted",
      description: "The note has been deleted successfully."
    });
  };

  const handleCreateTag = (name: string) => {
    const newTag: Tag = {
      id: `t${Date.now()}`,
      name: name.toLowerCase().replace(/\s+/g, '-')
    };
    
    setTags([...tags, newTag]);
    
    toast({
      title: "Tag created",
      description: `Tag "${name}" has been created successfully.`
    });
    
    return newTag;
  };

  const handleAddTagToNote = (noteId: string, tagName: string) => {
    // Find or create tag
    let tag = tags.find(t => t.name === tagName);
    if (!tag) {
      tag = handleCreateTag(tagName);
    }
    
    // Add tag to note
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        const noteTags = note.tags || [];
        if (!noteTags.includes(tagName)) {
          return {
            ...note, 
            tags: [...noteTags, tagName],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return note;
    }));
  };

  const handleRemoveTagFromNote = (noteId: string, tagName: string) => {
    setNotes(notes.map(note => {
      if (note.id === noteId && note.tags) {
        return {
          ...note,
          tags: note.tags.filter(t => t !== tagName),
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    }));
  };

  const handleTogglePin = (noteId: string) => {
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          isPinned: !note.isPinned,
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    }));
    
    toast({
      title: "Note updated",
      description: `Note has been ${notes.find(n => n.id === noteId)?.isPinned ? 'unpinned' : 'pinned'}.`
    });
  };

  const handleToggleStar = (noteId: string) => {
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          isStarred: !note.isStarred,
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    }));
  };

  const handleShare = () => {
    toast({
      title: "Share feature",
      description: "The share feature will be available soon."
    });
  };

  const handleRemind = () => {
    toast({
      title: "Reminder feature",
      description: "The reminder feature will be available soon."
    });
  };

  const handleColor = () => {
    if (activeNoteId) {
      const colors: Array<'default' | 'pink' | 'purple' | 'blue' | 'green' | 'yellow'> = ['default', 'pink', 'purple', 'blue', 'green', 'yellow'];
      const currentColor = notes.find(n => n.id === activeNoteId)?.color || 'default';
      const nextColorIndex = (colors.indexOf(currentColor) + 1) % colors.length;
      
      setNotes(notes.map(note => {
        if (note.id === activeNoteId) {
          return {
            ...note,
            color: colors[nextColorIndex],
            updatedAt: new Date().toISOString()
          };
        }
        return note;
      }));
    }
  };

  const handleToggleNotesList = () => {
    setShowNotesList(!showNotesList);
  };

  const handleNavigateBreadcrumb = (id: string) => {
    if (id === 'root') {
      setActiveNoteId(null);
      setShowEditor(false);
      return;
    }
    
    // Check if it's a folder or note
    const folder = folders.find(f => f.id === id);
    
    if (folder) {
      // Handle folder navigation if needed
      // For now, we'll just clear the active note
      setActiveNoteId(null);
      setShowEditor(false);
      
      // Update breadcrumb to show just folder path
      const path: Array<{id: string, name: string, type: 'folder' | 'note'}> = [];
      let currentFolder = folder;
      
      while (currentFolder) {
        path.unshift({
          id: currentFolder.id,
          name: currentFolder.name,
          type: 'folder'
        });
        
        if (currentFolder.parentId) {
          const parentFolder = folders.find(f => f.id === currentFolder.parentId);
          currentFolder = parentFolder || null;
        } else {
          currentFolder = null;
        }
      }
      
      setCurrentPath(path);
    } else {
      // It's a note, set it active
      setActiveNoteId(id);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <NotesHeader 
        onSearch={(query) => console.log('Search:', query)}
        onImport={() => toast({ title: "Import", description: "Import feature coming soon." })}
        onWebClipper={() => toast({ title: "Web Clipper", description: "Web Clipper feature coming soon." })}
        onNewNote={() => handleCreateNote('Untitled Note')}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <NotesBreadcrumb path={currentPath} onNavigate={handleNavigateBreadcrumb} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Toggle button lives here as a flex sibling — never inside overflow-hidden */}
          <div className="flex-shrink-0 flex items-start pt-4 px-1">
            {sidebarCollapsed ? (
              <button
                onClick={() => setSidebarCollapsed(false)}
                title="Expand sidebar"
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img src="/icons/side-menu.svg" alt="Expand sidebar" className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse sidebar"
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <PanelLeftClose className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
          <NotesSidebar 
            notes={notes}
            tags={tags}
            folders={folders}
            onSelectNote={setActiveNoteId}
            onTogglePin={handleTogglePin}
            onCreateFolder={handleCreateFolder}
            onCreateNote={() => handleCreateNote('Untitled Note')}
            collapsed={sidebarCollapsed}
            onToggleCollapse={undefined}
          />
          
          <div className="flex-1 flex overflow-hidden">
            {showNotesList ? (
              <NotesListView 
                notes={notes}
                activeNoteId={activeNoteId}
                onSelectNote={(id) => {
                  setActiveNoteId(id);
                  setShowEditor(true);
                }}
                onToggleStar={handleToggleStar}
                onDeleteNote={handleDeleteNote}
              />
            ) : (
              <div className="border-r border-gray-200 flex items-center px-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleToggleNotesList} 
                  className="my-2"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {showEditor && activeNote ? (
              <div className="flex-1 overflow-auto border-l border-gray-200">
                <NotesEditor
                  note={activeNote}
                  onUpdateNote={handleUpdateNote}
                  onShare={handleShare}
                  onRemind={handleRemind}
                  onColor={handleColor}
                  onAddTag={handleAddTagToNote}
                  onRemoveTag={handleRemoveTagFromNote}
                  onMinimizeNotesList={handleToggleNotesList}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center p-6">
                  <h2 className="text-xl font-medium mb-2">No note selected</h2>
                  <p className="mb-4">Select a note from the list or create a new one</p>
                  <Button 
                    variant="default" 
                    onClick={() => handleCreateNote('Untitled Note')}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Create a new note
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <FloatingNewButton 
        onNewNote={() => handleCreateNote('Untitled Note')} 
      />
    </div>
  );
};

export default NotesGenerator;
