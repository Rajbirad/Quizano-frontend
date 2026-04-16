import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, FileText, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchChatSessions, deleteConversation, ChatSession } from './utils/conversationApi';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface RecentConversationsProps {
  onSelectSession: (session: ChatSession) => void;
}

export const RecentConversations: React.FC<RecentConversationsProps> = ({ onSelectSession }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      console.log('Loading recent conversations...');
      const response = await fetchChatSessions(10, 0); // Load only 10 most recent
      console.log('Recent conversations loaded:', response);
      // Filter to only show document sessions (exclude video sessions)
      const documentSessions = (response.sessions || []).filter(session => 
        session.document_name && !session.document_name.toLowerCase().includes('video')
      );
      setSessions(documentSessions);
    } catch (error) {
      console.error('Failed to load recent conversations:', error);
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

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      setDeletingId(conversationId);
      await deleteConversation(conversationId);
      setSessions(prev => prev.filter(s => s.conversation_id !== conversationId));
    } catch (error) {
      toast({ title: 'Failed to delete', description: 'Could not delete this conversation.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-12">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <MessageSquare className="h-10 w-10 text-muted-foreground opacity-40" />
        <p className="text-sm text-muted-foreground">
          No conversations yet. Upload a document and start chatting to see your history here.
        </p>
      </div>
    );
  }

  const displayedSessions = showAll ? sessions : sessions.slice(0, 3);

  return (
    <div className="h-full">
      <div className="space-y-0">
        {displayedSessions.map((session) => (
          <div
            key={session.conversation_id}
            className="group px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md transition-colors text-sm flex items-center gap-2"
            onClick={() => onSelectSession(session)}
          >
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate flex-1">{session.document_name}</span>
            <button
              onClick={(e) => handleDelete(e, session.conversation_id)}
              disabled={deletingId === session.conversation_id}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex-shrink-0"
              title="Delete"
            >
              {deletingId === session.conversation_id
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />}
            </button>
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
