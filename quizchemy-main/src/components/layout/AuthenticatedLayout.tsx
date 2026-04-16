import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRecentTools } from '@/utils/recentTools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/use-user-profile';
import { LoadingTransition } from '@/components/ui/page-transition';
import { useToast } from '@/hooks/use-toast';
import { Folder } from '@/components/notes-generator/types';
import { 
  LogOut,
  User,
  Settings,
  CreditCard as Billing,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Plus,
  Folder as FolderIcon,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Home', href: '/app/dashboard', icon: '/icons/home.svg' },
  { name: 'Flash Cards', href: '/app/flashcards', icon: '/icons/FlashCard.svg' },
  { name: 'Quizzes', href: '/app/quiz', icon: '/icons/Quiz.svg' },
  { name: 'AI Tools', href: '/app/ai-tools', icon: '/icons/ProductivityHub.svg' },
];

const AI_TOOLS: Record<string, { name: string; icon: string }> = {
  '/app/ai-chat':             { name: 'AI Chat',             icon: '/icons/robot.svg' },
  '/app/chat-with-files':     { name: 'Chat with Files',     icon: '/icons/robot.svg' },
  '/app/video-summarizer':    { name: 'Video Summarizer',    icon: '/icons/notes.svg' },
  '/app/audio-transcription': { name: 'Audio Transcription', icon: '/icons/music-file.svg' },
  '/app/image-transcription': { name: 'Image Transcription', icon: '/icons/image-summarizer.svg' },
  '/app/ai-humanizer':        { name: 'AI Humanizer',        icon: '/icons/content.svg' },
  '/app/notes-generator':     { name: 'Notes Generator',     icon: '/icons/notes.svg' },
  '/app/ai-ppt':              { name: 'AI Presentation',     icon: '/icons/presentation.svg' },
  '/app/ai-slides':           { name: 'AI Slides',           icon: '/icons/carousel.svg' },
  '/app/ai-podcast':          { name: 'AI Podcast',          icon: '/icons/music-file.svg' },
  '/app/ai-mindmap':          { name: 'AI MindMap',          icon: '/icons/sitemap.svg' },
  '/app/ai-infographic':      { name: 'AI Infographic',      icon: '/icons/notes.svg' },
  '/app/ai-diagram':          { name: 'AI Diagram',          icon: '/icons/flowchart.svg' },
  '/app/ai-paraphraser':      { name: 'AI Paraphraser',      icon: '/icons/content.svg' },
  '/app/grammar-checker':     { name: 'Grammar Checker',     icon: '/icons/test.svg' },
};

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  
  // Recent AI tools (Productivity Hub) - populated when generation succeeds
  const [recentTools, setRecentTools] = useState<string[]>(getRecentTools);

  useEffect(() => {
    // Refresh list when navigating (in case another tab generated something)
    setRecentTools(getRecentTools());
  }, [location.pathname]);

  // Sidebar collapse state
  const [navCollapsed, setNavCollapsed] = useState(false);

  // Folder management
  const [folders, setFolders] = useState<Folder[]>([]);
  const [createFolderDialog, setCreateFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [renameFolderDialog, setRenameFolderDialog] = useState(false);
  const [deleteFolderDialog, setDeleteFolderDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');

  const handleLogout = async () => {
    try {
      await signOut();
      // The signOut function will handle the redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force navigation to home page
      window.location.href = '/';
    }
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };
  
  // Load folders from localStorage
  useEffect(() => {
    const savedFolders = localStorage.getItem('dashboard-folders');
    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    }
  }, []);
  
  // Save folders to localStorage
  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem('dashboard-folders', JSON.stringify(folders));
    } else {
      localStorage.removeItem('dashboard-folders');
    }
  }, [folders]);
  
  const handleCreateFolder = () => {
    if (!folderName.trim()) {
      toast({
        title: 'Folder name required',
        description: 'Please enter a folder name.',
        variant: 'destructive',
      });
      return;
    }
    
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: folderName.trim(),
      parentId: null,
    };
    
    setFolders(prev => [...prev, newFolder]);
    setFolderName('');
    setCreateFolderDialog(false);
  };
  
  const handleOpenRenameDialog = (folder: Folder) => {
    setSelectedFolder(folder);
    setRenameFolderName(folder.name);
    setRenameFolderDialog(true);
  };
  
  const handleRenameFolder = () => {
    if (!renameFolderName.trim()) {
      toast({
        title: 'Folder name required',
        description: 'Please enter a folder name.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedFolder) return;
    
    setFolders(prev => prev.map(f => 
      f.id === selectedFolder.id 
        ? { ...f, name: renameFolderName.trim() }
        : f
    ));
    
    setRenameFolderDialog(false);
    setRenameFolderName('');
    setSelectedFolder(null);
    
    toast({
      title: 'Folder renamed',
      description: `Folder has been renamed successfully.`,
    });
  };
  
  const handleOpenDeleteDialog = (folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteFolderDialog(true);
  };
  
  const handleDeleteFolder = () => {
    if (!selectedFolder) return;
    
    // Remove folder from folders list
    setFolders(prev => prev.filter(f => f.id !== selectedFolder.id));
    
    // Also remove folder items from localStorage
    try {
      const savedFolderItems = localStorage.getItem('folder-items');
      if (savedFolderItems) {
        const folderItems = JSON.parse(savedFolderItems);
        delete folderItems[selectedFolder.id];
        localStorage.setItem('folder-items', JSON.stringify(folderItems));
      }
    } catch (error) {
      console.error('Error cleaning up folder items:', error);
    }
    
    setDeleteFolderDialog(false);
    setSelectedFolder(null);
    
    toast({
      title: 'Folder deleted',
      description: `"${selectedFolder.name}" has been deleted.`,
    });
  };

  // Show loading state
  if (loading) {
    return (
      <LoadingTransition 
        isLoading={true} 
        loadingText="Loading dashboard..."
      >
        <div />
      </LoadingTransition>
    );
  }

  // If not authenticated, return null (AuthGuard handles the redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-card border-r border-border flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out ${navCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo/Brand + collapse toggle */}
        <div className={`flex items-center h-16 flex-shrink-0 ${navCollapsed ? 'justify-center px-0' : 'px-5 justify-between'}`}>
          {!navCollapsed && (
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 truncate">
              Quizano
            </h1>
          )}
          <button
            onClick={() => setNavCollapsed(v => !v)}
            className="rounded-md p-1 hover:bg-muted transition-colors flex-shrink-0"
            title={navCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {navCollapsed ? <ChevronsRight className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} /> : <ChevronsLeft className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col min-h-0">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <li key={item.name}>
                  <div
                    title={navCollapsed ? item.name : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? "text-primary font-semibold bg-primary/5" 
                        : "text-foreground hover:bg-accent hover:text-accent-foreground font-medium"
                    } ${navCollapsed ? 'justify-center' : ''}`}
                    onClick={() => navigate(item.href)}
                  >
                    <img src={item.icon} alt={item.name} className={`flex-shrink-0 ${navCollapsed ? 'w-8 h-8' : 'w-6 h-6'}`} />
                    {!navCollapsed && <span className="text-sm truncate">{item.name}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
          
          {/* Divider */}
          <div className="border-t border-border my-4"></div>

          {/* Scrollable: Folders */}
          <div className="flex-1 overflow-y-auto min-h-0 thin-scrollbar">
          
          {/* Folders Section */}
          {!navCollapsed && <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-light text-foreground">Folders</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-primary/10"
                onClick={() => setCreateFolderDialog(true)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {/* Folders List */}
            <div className="space-y-1">
              {folders.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">No folders yet</p>
              ) : (
                <>
                  {folders.slice(0, 5).map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer group"
                    onClick={() => navigate(`/app/folder/${folder.id}`)}
                  >
                    <FolderIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate flex-1">{folder.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleOpenRenameDialog(folder)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename Folder
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleOpenDeleteDialog(folder)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  ))}
                  {folders.length > 5 && (
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => navigate('/app/dashboard')}
                    >
                      <span className="text-sm font-medium">···</span>
                      <span className="text-sm">See more</span>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{folders.length - 5} more</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>}{/* end folders section */}

          </div>{/* end scrollable section */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-background border-b border-gray-300/70 flex items-center justify-end px-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 relative rounded-lg group">
                <Avatar className="rounded-lg w-full h-full">
                  <AvatarImage 
                    src={profile?.avatar_url || undefined} 
                    className="rounded-lg object-cover" 
                  />
                  <AvatarFallback className="rounded-lg bg-muted text-muted-foreground font-semibold">
                    {profile?.full_name 
                      ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : user?.email?.[0].toUpperCase() || 'U'
                    }
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/app/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/billing')}>
                <Billing className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
               <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Support
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => window.open('/help-center', '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Help Centre
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/app/feedback')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        {(location.pathname === '/app/transcription-result' || location.pathname === '/app/ai-chat' || location.pathname === '/app/chat-with-files' || location.pathname === '/app/video-summarizer' || location.pathname === '/app/image-transcription' || location.pathname === '/app/audio-transcription' || location.pathname === '/app/mindmap-result' || location.pathname === '/app/notes-generator') ? (
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        ) : (
          <main className="flex-1 p-6 overflow-y-auto thin-scrollbar">
            {children}
          </main>
        )}
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialog} onOpenChange={setCreateFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateFolderDialog(false);
                  setFolderName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Rename Folder Dialog */}
      <Dialog open={renameFolderDialog} onOpenChange={setRenameFolderDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Enter folder name"
              value={renameFolderName}
              onChange={(e) => setRenameFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameFolder();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRenameFolderDialog(false);
                  setRenameFolderName('');
                  setSelectedFolder(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRenameFolder}>
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog open={deleteFolderDialog} onOpenChange={setDeleteFolderDialog}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFolder?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFolder(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};