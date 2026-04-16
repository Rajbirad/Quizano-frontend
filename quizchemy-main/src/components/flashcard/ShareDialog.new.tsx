import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { makeAuthenticatedRequest } from '@/lib/api-utils';

const API_URL = 'https://127.0.0.1:8000';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcardId?: string;
}

interface FlashcardSetMeta {
  id: string;
  title: string;
  is_public: boolean;
  share_url: string | null;
  embed_code: string | null;
  card_format: string;
  difficulty_level: string;
}

interface MetaResponse {
  success: boolean;
  flashcard_set: FlashcardSetMeta;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ open, onOpenChange, flashcardId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPublic, setIsPublic] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [shareUrl, setShareUrl] = React.useState<string>("");
  const [embedCode, setEmbedCode] = React.useState<string>("");

  const handleCopy = (text: string, type: 'link' | 'embed') => {
    if (!text) {
      toast({
        title: "Nothing to copy",
        description: "Please make the flashcard set public first to get a shareable link.",
        variant: "destructive"
      });
      return;
    }

    navigator.clipboard.writeText(text);
    toast({
      title: `${type === 'link' ? 'Flashcard link' : 'Embed code'} copied`,
      description: "You can now share it with others.",
    });
  };

  const fetchMeta = React.useCallback(async () => {
    if (!flashcardId) return;
    
    try {
      setLoading(true);
      console.log('Fetching meta for flashcard:', flashcardId);

      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/flashcards/${flashcardId}/meta`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch meta: ${response.status}`);
      }

      const data = await response.json() as MetaResponse;
      
      if (data.success && data.flashcard_set) {
        setIsPublic(data.flashcard_set.is_public);
        setShareUrl(data.flashcard_set.share_url || "");
        setEmbedCode(data.flashcard_set.embed_code || "");
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error fetching meta:', error);
    } finally {
      setLoading(false);
    }
  }, [flashcardId, toast]);

  React.useEffect(() => {
    if (open && user && flashcardId) {
      fetchMeta();
    }
  }, [open, user, flashcardId, fetchMeta]);

  const togglePublic = async (checked: boolean) => {
    if (!flashcardId) {
      return;
    }

    setLoading(true);
    try {
      console.log('Updating share status:', { flashcardId, isPublic: checked });
      
      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/flashcards/${flashcardId}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_public: checked })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update sharing settings: ${response.status}`);
      }

      await fetchMeta();

      toast({
        title: checked ? "Flashcard set is now public" : "Flashcard set made private",
        description: checked ? "Share link created" : "Share access revoked",
      });
    } catch (error: any) {
      console.error('Error updating share status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update sharing settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Flashcard Set</DialogTitle>
          <DialogDescription>
            Make your flashcard set public to share it with others.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="flex items-center gap-4">
            <Switch
              checked={isPublic}
              onCheckedChange={togglePublic}
              disabled={loading}
            />
            <Label>{isPublic ? "Public - Anyone with the link can view" : "Private"}</Label>
          </div>

          {isPublic && shareUrl && (
            <>
              <div className="grid gap-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(shareUrl, 'link')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Embed Code</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={embedCode || ""}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(embedCode || "", 'embed')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
