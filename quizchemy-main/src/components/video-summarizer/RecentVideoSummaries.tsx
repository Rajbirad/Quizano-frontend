import React, { useState, useEffect } from 'react';
import { FileVideo, Clock, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fetchVideoChatSessions, VideoChatSession } from './utils/videoConversationApi';

interface RecentVideoSummariesProps {
  onSelectSession: (session: VideoChatSession) => void;
}

export const RecentVideoSummaries: React.FC<RecentVideoSummariesProps> = ({ onSelectSession }) => {
  const [sessions, setSessions] = useState<VideoChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      console.log('Loading recent video chat sessions...');
      
      const response = await fetchVideoChatSessions(10, 0);
      console.log('Recent video sessions loaded:', response);
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Failed to load recent video sessions:', error);
      // Silently fail - no toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="w-full">
        <Card className="p-8 text-center border-dashed">
          <FileVideo className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            No video chats yet. Process a video and start chatting to see your history here.
          </p>
        </Card>
      </div>
    );
  }

  const displayedSessions = showAll ? sessions : sessions.slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {displayedSessions.map((session) => (
          <div
            key={session.conversation_id}
            className="px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md transition-colors text-sm group"
            onClick={() => onSelectSession(session)}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">
                  {session.video_name || 'Untitled Video'}
                </p>
                {session.last_message_preview && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {session.last_message_preview}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(session.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length > 3 && (
        <div className="mt-4 pt-4 border-t">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="ghost"
            size="sm"
            className="w-full text-xs"
          >
            {showAll ? 'Show Less' : `Show All (${sessions.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};
