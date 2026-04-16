import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActivities } from '@/hooks/useActivities';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RecentActivityCard } from '@/components/RecentActivityCard';
import { Folder } from '@/components/notes-generator/types';

interface FlashcardSet {
  id: string;
  user_id: string;
  title: string;
  flashcards: string;
  source_type: string;
  source_name: string;
  difficulty_level: string;
  card_format: string;
  total_cards: number;
  metadata: any;
  created_at: string;
  updated_at: string;
  status: string;
  is_public: boolean;
  share_id?: string;
  expires_at?: string;
}

interface Activity {
  id: string;
  type: 'flashcard_set' | 'quiz' | 'document' | 'ai_chat' | 'study_session';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  data: any;
  folderId?: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string;
  quiz_count: number;
  flashcard_count: number;
  subscription_tier: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { activities, loading, fetchActivities, deleteActivity } = useActivities();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);

  const userName =
    profile?.full_name?.trim()?.split(' ')[0] ||
    profile?.username?.trim() ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.user_metadata?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    '';

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

  const handleActivityClick = (activity: Activity) => {
    switch (activity.type) {
      case 'flashcard_set':
        if (activity.data?.setId) {
          navigate(`/app/flashcard-preview/${activity.data.setId}`, {
            state: { from: '/app/dashboard' }
          });
        } else {
          navigate('/app/flashcards');
        }
        break;
      case 'quiz':
        if (activity.data?.quizId) {
          navigate(`/app/quiz-study/${activity.data.quizId}`);
        } else {
          navigate('/app/quiz');
        }
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

  // Fetch recent activities
  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, fetchActivities]);
  
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
  
  const handleMoveToFolder = (activity: Activity, folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    try {
      // Get existing folder items
      const savedFolderItems = localStorage.getItem('folder-items');
      const folderItems = savedFolderItems ? JSON.parse(savedFolderItems) : {};
      
      // Initialize folder array if it doesn't exist
      if (!folderItems[folderId]) {
        folderItems[folderId] = [];
      }
      
      // Check if item already exists in folder
      const itemExists = folderItems[folderId].some((item: any) => item.id === activity.id);
      
      if (itemExists) {
        toast({
          title: 'Already in folder',
          description: `"${activity.title}" is already in "${folder.name}".`,
          variant: 'destructive',
        });
        return;
      }
      
      // Create folder item object
      const folderItem = {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        data: activity.data,
      };
      
      // Add item to folder
      folderItems[folderId].push(folderItem);
      
      // Save to localStorage
      localStorage.setItem('folder-items', JSON.stringify(folderItems));
      
      toast({
        title: 'Moved to folder',
        description: `"${activity.title}" has been moved to "${folder.name}".`,
      });
    } catch (error) {
      console.error('Error moving item to folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to move item to folder.',
        variant: 'destructive',
      });
    }
  };
  
  // Profile is now handled by AuthContext

  // Check if user has activity
  const hasActivity = Boolean(
    (user?.created_at && 
      new Date().getTime() - new Date(user.created_at).getTime() > 24 * 60 * 60 * 1000) || // 24 hours
    activities.length > 0 // Or has any activities
  );

  const learningTools = [
    {
      title: "Create Flash Cards",
      description: "Build flashcards manually or let AI generate them from text, files, videos, audio, or images.",
      icon: "/icons/FlashCard.svg",
      onClick: () => navigate('/app/flashcards'),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Generate Quizzes",
      description: "Turn your notes, videos, or files into quizzes — instantly.",
      icon: "/icons/Quiz.svg",
      onClick: () => navigate('/app/quiz'),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Productivity Hub",
      description: "Summarize, rewrite, and transcribe content — all in one place.",
      icon: "/icons/ProductivityHub.svg",
      onClick: () => navigate('/app/ai-tools'),
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto p-6 space-y-20">
        {/* Welcome Section */}
        <div className="text-center space-y-3 mb-20">
          <div className="text-4xl font-bold min-h-[48px]">
            {userName && (
              <>
                <h1 className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent inline-block">
                  {`Hi, ${userName}`}
                </h1>
                <span className="ml-2">👋</span>
              </>
            )}
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learning made simple — choose a tool and get started.
          </p>
        </div>

        {/* Quick Start Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-foreground mb-1">
              Quick Start: Your Learning Toolkit
            </h2>
          </div>

          {/* Learning Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningTools.map((tool, index) => (
              <Card
                key={tool.title}
                className="cursor-pointer group hover:bg-accent/5 hover:border-primary/50"
                onClick={tool.onClick}
              >
                <CardContent className="p-6">
                  <div className="text-left space-y-4">
                    {/* Icon */}
                    <div className="mb-4">
                      <img 
                        src={tool.icon} 
                        alt={tool.title} 
                        className="w-12 h-12" 
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        {(loading || activities.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/icons/repeat.svg" alt="" className="w-6 h-6" />
              <h2 className="text-xl font-medium">My Quizzes and Flashcards</h2>
            </div>
            {loading ? (
              <Card className="bg-card/40 backdrop-blur-sm border border-border/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-muted rounded" />
                          <div className="h-3 w-1/2 bg-muted rounded" />
                        </div>
                        <div className="w-16">
                          <div className="h-3 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RecentActivityCard 
                activities={activities} 
                loading={loading} 
                onDeleteActivity={async (activity) => { await deleteActivity(activity); }}
                folders={folders}
                onMoveToFolder={handleMoveToFolder}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default Dashboard;