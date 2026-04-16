import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudySession {
  id: string;
  deck_id: string;
  deck_name: string;
  cards_studied: number;
  total_cards: number;
  last_card_index: number;
  session_type: string;
  status: string;
  updated_at: string;
}

export const ResumeStudyCard: React.FC = () => {
  const [activeSessions, setActiveSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'paused'])
        .gt('total_cards', 0)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching study sessions:', error);
        throw error;
      }

      setActiveSessions(data || []);
    } catch (error) {
      console.error('Failed to fetch study sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async (session: StudySession) => {
    try {
      // Update session status to active if it was paused
      if (session.status === 'paused') {
        await supabase
          .from('study_sessions')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);
      }

      // Navigate to study page with session context
      navigate(`/study?session=${session.id}&deck=${session.deck_id}`);
    } catch (error) {
      console.error('Failed to resume session:', error);
    }
  };

  const getProgressPercentage = (session: StudySession) => {
    if (session.total_cards === 0) return 0;
    return Math.round((session.cards_studied / session.total_cards) * 100);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Resume Studying
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Resume Studying
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-2">No active study sessions</p>
            <p className="text-xs mb-4">Start studying to see your progress here</p>
            <Button 
              size="sm"
              onClick={() => navigate('/flashcards')}
            >
              Start Studying
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSessions.map((session) => {
              const progress = getProgressPercentage(session);
              
              return (
                <div
                  key={session.id}
                  className="p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {session.deck_name || 'Untitled Deck'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {session.cards_studied} of {session.total_cards} cards
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(session.updated_at)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress}% complete
                    </p>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleResumeSession(session)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {session.status === 'paused' ? 'Resume' : 'Continue'}
                  </Button>
                </div>
              );
            })}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/study')}
            >
              View All Sessions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
