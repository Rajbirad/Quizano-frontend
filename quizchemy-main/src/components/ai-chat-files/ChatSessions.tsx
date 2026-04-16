import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, FileText, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchChatSessions, ChatSession } from './utils/conversationApi';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ChatSessionsProps {
  onSelectSession: (session: ChatSession) => void;
  currentConversationId?: string;
  onNewChat: () => void;
}

export const ChatSessions: React.FC<ChatSessionsProps> = ({ 
  onSelectSession, 
  currentConversationId,
  onNewChat 
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const { toast } = useToast();
  const limit = 50;

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async (loadMore = false) => {
    try {
      setIsLoading(true);
      const currentOffset = loadMore ? offset : 0;
      const response = await fetchChatSessions(limit, currentOffset);
      
      if (loadMore) {
        setSessions(prev => [...prev, ...(response.sessions || [])]);
      } else {
        setSessions(response.sessions || []);
      }
      
      setHasMore(response.has_more || false);
      if (loadMore) {
        setOffset(currentOffset + limit);
      } else {
        setOffset(limit);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadSessions(true);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat History
          </h2>
        </div>
        <Button 
          onClick={onNewChat}
          className="w-full"
          variant="default"
        >
          + New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isLoading && sessions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a document to start chatting
              </p>
            </div>
          ) : (
            <>
              {sessions.map((session) => (
                <Card
                  key={session.conversation_id}
                  className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                    currentConversationId === session.conversation_id 
                      ? 'bg-accent border-primary' 
                      : ''
                  }`}
                  onClick={() => onSelectSession(session)}
                >
                  <div className="space-y-2">
                    {/* Document Name */}
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs font-medium text-muted-foreground truncate flex-1">
                        {session.document_name}
                      </p>
                    </div>
                    
                    {/* First Question (Title) */}
                    <p className="text-sm font-medium line-clamp-2">
                      {session.first_question}
                    </p>
                    
                    {/* Last Message Preview */}
                    {session.last_message_preview && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {session.last_message_preview}
                      </p>
                    )}
                    
                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(session.updated_at)}
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <Button
                  onClick={handleLoadMore}
                  variant="ghost"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
