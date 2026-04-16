import React, { useState, useEffect } from 'react';
import { Clock, Loader2, NotebookPen, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { getApiUrl, getAuthHeaders } from '@/lib/slides-api';
import { toast } from 'sonner';

interface NoteItem {
  id: string;
  title?: string;
  document_title?: string;
  created_at: string;
  source_type?: string;
  content_preview?: string;
  structured_content?: any;
  content?: any;
  notes?: any;
  sections?: any[];
}

interface RecentNotesHistoryProps {
  onSelectNote: (noteData: any) => void;
}

const SOURCE_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  text: { label: 'Text', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  file: { label: 'File', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  youtube: { label: 'YouTube', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  video: { label: 'Video', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
};

export const RecentNotesHistory: React.FC<RecentNotesHistoryProps> = ({ onSelectNote }) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl('/api/notes?page=1&page_size=20'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data.notes || data.items || (Array.isArray(data) ? data : []));
    } catch {
      // silently fail — don't disrupt UX
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (note: NoteItem) => {
    setLoadingId(note.id);
    try {
      const response = await fetch(getApiUrl(`/api/notes/${note.id}`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to load note');
      const data = await response.json();

      // API returns { success: true, note: { sections: [...], ... } }
      const noteObj = data.note || data;

      // Extract the notes content in the format expected by AiNotesResult (needs { sections: [] })
      const noteContent =
        noteObj.structured_content ||
        noteObj.content ||
        noteObj.notes ||
        (Array.isArray(noteObj.sections) ? noteObj : null) ||
        noteObj;

      onSelectNote(noteContent);
    } catch {
      toast.error('Failed to load note');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    setDeletingId(noteId);
    try {
      const response = await fetch(getApiUrl(`/api/notes/${noteId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete note');
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getTitle = (note: NoteItem) =>
    note.title || note.document_title || 'Untitled Note';

  const getSourceBadge = (sourceType?: string) => {
    if (!sourceType) return null;
    const config = SOURCE_TYPE_CONFIG[sourceType.toLowerCase()];
    if (!config) return null;
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="px-2 py-6 text-center">
        <NotebookPen className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
        <p className="text-xs text-muted-foreground">
          No notes yet. Generate notes to see your history here.
        </p>
      </div>
    );
  }

  const displayed = showAll ? notes : notes.slice(0, 3);

  return (
    <div className="space-y-0.5">
      {displayed.map((note) => (
        <div
          key={note.id}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent rounded-md transition-colors group"
          onClick={() => handleSelect(note)}
        >
          {/* Icon */}
          {loadingId === note.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />
          ) : (
            <NotebookPen className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          )}

          {/* Text block */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium leading-snug">{getTitle(note)}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {getSourceBadge(note.source_type)}
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 whitespace-nowrap">
                <Clock className="h-2.5 w-2.5" />
                {formatTimestamp(note.created_at)}
              </span>
            </div>
          </div>

          {/* Delete — hover only */}
          <button
            onClick={(e) => handleDelete(e, note.id)}
            disabled={deletingId === note.id}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
            title="Delete"
          >
            {deletingId === note.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </button>
        </div>
      ))}

      {notes.length > 3 && (
        <div className="pt-2">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="ghost"
            size="sm"
            className="w-full text-xs"
          >
            {showAll ? 'Show Less' : `Show All (${notes.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};
