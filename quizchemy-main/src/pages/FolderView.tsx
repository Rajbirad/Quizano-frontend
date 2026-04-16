import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Trash2,
  FolderOpen,
  Layers,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

interface FolderItem {
  id: string;
  type: 'flashcard_set' | 'quiz';
  title: string;
  description: string;
  timestamp: string;
  data: any;
}

const FolderView = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [folderName, setFolderName] = useState<string>('');
  const [items, setItems] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; item: FolderItem | null }>({ 
    open: false, 
    item: null 
  });

  useEffect(() => {
    if (!folderId) return;

    // Load folder details
    const savedFolders = localStorage.getItem('dashboard-folders');
    if (savedFolders) {
      try {
        const folders = JSON.parse(savedFolders);
        const folder = folders.find((f: any) => f.id === folderId);
        if (folder) {
          setFolderName(folder.name);
        } else {
          navigate('/app/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error loading folder:', error);
      }
    }

    // Load folder items
    const savedFolderItems = localStorage.getItem('folder-items');
    if (savedFolderItems) {
      try {
        const folderItems = JSON.parse(savedFolderItems);
        const folderContents = folderItems[folderId] || [];
        setItems(folderContents);
      } catch (error) {
        console.error('Error loading folder items:', error);
      }
    }

    setIsLoading(false);
  }, [folderId, navigate]);

  const handleItemClick = (item: FolderItem) => {
    switch (item.type) {
      case 'flashcard_set':
        navigate(`/app/flashcard-preview/${item.id}`, {
          state: { 
            flashcardsData: item.data.flashcardsData,
            from: `/app/folder/${folderId}`
          }
        });
        break;
      case 'quiz':
        const quizId = item.data?.quizId || item.id;
        const cleanQuizId = quizId.replace(/^quiz_/, '');
        navigate(`/app/quiz-study/${cleanQuizId}`);
        break;
    }
  };

  const handleRemoveFromFolder = (item: FolderItem) => {
    setRemoveDialog({ open: true, item });
  };

  const confirmRemove = () => {
    if (!removeDialog.item || !folderId) return;

    try {
      const savedFolderItems = localStorage.getItem('folder-items');
      if (savedFolderItems) {
        const folderItems = JSON.parse(savedFolderItems);
        folderItems[folderId] = (folderItems[folderId] || []).filter(
          (i: FolderItem) => i.id !== removeDialog.item!.id
        );
        localStorage.setItem('folder-items', JSON.stringify(folderItems));
        setItems(folderItems[folderId] || []);
      }

      toast({
        title: 'Removed from folder',
        description: `"${removeDialog.item.title}" has been removed from "${folderName}".`,
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from folder.',
        variant: 'destructive',
      });
    }

    setRemoveDialog({ open: false, item: null });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'flashcard_set':
        return <Layers className="h-6 w-6 text-primary" />;
      case 'quiz':
        return <HelpCircle className="h-6 w-6 text-primary" />;
      default:
        return <Layers className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/dashboard')}
            className="rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{folderName}</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
        </div>

        {/* Folder Contents */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/50">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">This folder is empty</p>
                <p className="text-sm">
                  Move quizzes or flashcards here from your dashboard to organize them.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFolder(item);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Remove Confirmation Dialog */}
        <AlertDialog open={removeDialog.open} onOpenChange={(open) => !open && setRemoveDialog({ open: false, item: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Folder</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{removeDialog.item?.title}" from this folder? 
                The item will still be available in your dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemove}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default FolderView;
