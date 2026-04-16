import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Layers, 
  HelpCircle, 
  FileText, 
  MessageCircle, 
  Brain,
  Clock,
  ChevronRight,
  Trash2,
  FolderPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useActivities } from '@/hooks/useActivities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Folder } from '@/components/notes-generator/types';

interface Activity {
  id: string;
  type: 'flashcard_set' | 'quiz' | 'document' | 'ai_chat' | 'study_session';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  data: any;
}

export const RecentActivityCard: React.FC<{
  activities: Activity[];
  loading: boolean;
  onDeleteActivity?: (activity: Activity) => Promise<void>;
  folders?: Folder[];
  onMoveToFolder?: (activity: Activity, folderId: string) => void;
}> = ({ activities, loading, onDeleteActivity, folders = [], onMoveToFolder }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleActivityClick = (activity: Activity) => {
    switch (activity.type) {
      case 'flashcard_set':
        navigate(`/app/flashcard-preview/${activity.id}`, {
          state: { 
            flashcardsData: activity.data.flashcardsData,
            from: '/app/dashboard' // Add referring path
          }
        });
        break;
      case 'quiz':
        const quizId = activity.data?.quizId || activity.id;
        // Remove 'quiz_' prefix if it exists
        const cleanQuizId = quizId.replace(/^quiz_/, '');
        navigate(`/app/quiz-study/${cleanQuizId}`);
        break;
      case 'document':
        if (activity.data?.documentId) {
          navigate(`/app/ai-chat-files/${activity.data.documentId}`);
        } else {
          navigate('/app/ai-chat-files');
        }
        break;
      case 'ai_chat':
        navigate('/app/ai-tutor');
        break;
      case 'study_session':
        navigate('/app/study');
        break;
      default:
        navigate('/app/dashboard');
    }
  };

  const handleDeleteActivity = async (activity: Activity, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the activity click
    
    if (!onDeleteActivity) return;
    
    try {
      await onDeleteActivity(activity);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
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

  const renderSkeletonItem = () => (
    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg animate-pulse">
      <div className="w-8 h-8 bg-muted rounded-xl"></div>
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-12 h-3 bg-muted rounded"></div>
        <div className="w-4 h-4 bg-muted rounded"></div>
      </div>
    </div>
  );

  const renderActivityItem = (activity: Activity) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'flashcard_set':
          return <Layers className="h-6 w-6 text-primary" />;
        case 'quiz':
          return <HelpCircle className="h-6 w-6 text-primary" />;
        case 'document':
          return <FileText className="h-8 w-8 text-primary" />;
        case 'ai_chat':
          return <MessageCircle className="h-8 w-8 text-primary" />;
        default:
          return <Brain className="h-8 w-8 text-primary" />;
      }
    };

    return (
      <div
        className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
        onClick={() => handleActivityClick(activity)}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{activity.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {activity.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(activity.timestamp)}
          </span>
          {(activity.type === 'flashcard_set' || activity.type === 'quiz') && (
            <>
              {onMoveToFolder && folders.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-primary/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FolderPlus className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToFolder(activity, folder.id);
                        }}
                      >
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {onDeleteActivity && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => handleDeleteActivity(activity, e)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card/40 backdrop-blur-sm border border-border/50">
      <CardContent className="p-6">
        <div className="space-y-3">
          {loading ? (
            // Show 5 skeleton items while loading
            [...Array(5)].map((_, i) => (
              <React.Fragment key={i}>
                {renderSkeletonItem()}
              </React.Fragment>
            ))
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-2">No recent activity</p>
              <p className="text-xs mb-4">Start creating flashcards or taking quizzes to see your activity here</p>
            </div>
          ) : (
            <>
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id}>
                  {renderActivityItem(activity)}
                </div>
              ))}
              {activities.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => navigate('/app/activity')}
                >
                  View All Activity
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};