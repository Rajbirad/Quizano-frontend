import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Layers, 
  HelpCircle, 
  FileText, 
  MessageCircle, 
  Brain,
  Clock,
  ChevronRight,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  type: 'flashcard_set' | 'quiz' | 'document' | 'ai_chat' | 'study_session';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  data: any;
}

const ActivityPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activities, loading, fetchActivities, deleteActivity } = useActivities();

  const handleActivityClick = (activity: Activity) => {
    switch (activity.type) {
      case 'flashcard_set':
        navigate(`/app/flashcard-preview/${activity.id}`);
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
    
    try {
      await deleteActivity(activity);
      toast({
        title: `${activity.type === 'flashcard_set' ? 'Flashcard set' : 'Quiz'} deleted`,
        description: `"${activity.title}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error deleting item",
        description: "There was an error deleting the item. Please try again.",
        variant: "destructive"
      });
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

  const renderActivityItem = (activity: Activity) => {
    const IconComponent = activity.type === 'flashcard_set' ? Layers
      : activity.type === 'quiz' ? HelpCircle
      : activity.type === 'document' ? FileText
      : activity.type === 'ai_chat' ? MessageCircle
      : Brain;

    return (
      <div
        key={activity.id}
        className="flex items-center gap-3 p-4 bg-background/50 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
        onClick={() => handleActivityClick(activity)}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
          <IconComponent className="h-5 w-5 text-primary" />
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
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => handleDeleteActivity(activity, e)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  };

  const renderSkeletonItem = (key: number) => (
    <div key={key} className="flex items-center gap-3 p-4 bg-background/50 rounded-lg animate-pulse">
      <div className="w-10 h-10 bg-muted rounded-xl"></div>
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-3 bg-muted rounded"></div>
        <div className="w-4 h-4 bg-muted rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/dashboard')}
          className="rounded-full"
        >
          &lt;
        </Button>
        <h1 className="text-2xl font-bold">Activity History</h1>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm border border-border/50">
        <CardContent className="p-6">
          <div className="space-y-3">
            {loading ? (
              // Show skeleton items while loading
              [...Array(10)].map((_, i) => renderSkeletonItem(i))
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">No activity yet</p>
                <p className="text-sm mb-4">Start creating flashcards or taking quizzes to see your activity here</p>
                <Button onClick={() => navigate('/app/create')}>
                  Create Something
                </Button>
              </div>
            ) : (
              <>
                {activities.map((activity) => renderActivityItem(activity))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityPage;
