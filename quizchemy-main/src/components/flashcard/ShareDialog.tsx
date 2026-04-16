import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Copy, CopyCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcardId?: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  flashcardId
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isPublic, setIsPublic] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState<string>("");
  const [apiUrl, setApiUrl] = React.useState<string>("");
  const [copied, setCopied] = React.useState<"url" | "api" | null>(null);

  const isMounted = React.useRef(true);
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout>();

  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  // Clear loading state after 5s max
  const setLoadingWithSafety = React.useCallback((isLoading: boolean) => {
    if (!isMounted.current) return;
    setLoading(isLoading);

    if (isLoading) {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) setLoading(false);
      }, 5000);
    } else if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const buildLinks = React.useCallback(
    (id: string) => {
      const cleanId = id.replace("flashcard_", "");
      const shareLink = `${FRONTEND_URL}/app/flashcard-preview/${cleanId}`;
      const supabaseQueryUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/flashcard_sets_normalized?select=*&id=eq.${cleanId}`;
      return { shareLink, supabaseQueryUrl };
    },
    [FRONTEND_URL]
  );

  const handleCopy = React.useCallback(
    async (type: "url" | "api") => {
      const text = type === "url" ? shareUrl : apiUrl;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        toast({
          title: "Copied!",
          description: `The ${type === "url" ? "share URL" : "API URL"} has been copied to your clipboard.`
        });
      } catch {
        toast({
          title: "Failed to copy",
          description: "Please try copying manually.",
          variant: "destructive"
        });
      }
    },
    [shareUrl, apiUrl, toast]
  );

  const fetchMeta = React.useCallback(async () => {
    if (!flashcardId || !user) return;

    try {
      setLoadingWithSafety(true);

      const cleanId = flashcardId.replace("flashcard_", "");
      const { data: flashcardSet, error } = await supabase
        .from("flashcard_sets_normalized")
        .select("*")
        .eq("id", cleanId)
        .single();

      if (error) throw error;

      if (flashcardSet) {
        setIsPublic(flashcardSet.is_public || false);
        if (flashcardSet.is_public) {
          const { shareLink, supabaseQueryUrl } = buildLinks(flashcardId);
          setShareUrl(shareLink);
          setApiUrl(supabaseQueryUrl);
        }
      }
    } catch (err: any) {
      if (!isMounted.current) return;

      console.error("Error fetching meta:", err);

      setIsPublic(false);
      setShareUrl("");
      setApiUrl("");

      let errorMessage = "Failed to load sharing settings. ";
      if (err.message?.includes("Failed to fetch")) {
        errorMessage += "Server may be unavailable.";
      } else if (err.message?.includes("timed out")) {
        errorMessage += "Request timed out.";
      } else {
        errorMessage += err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [flashcardId, user, buildLinks, toast, setLoadingWithSafety]);

  const togglePublic = React.useCallback(
    async (checked: boolean) => {
      if (!flashcardId || !user) {
        toast({
          title: "Error",
          description: "Unable to update sharing settings - missing required data.",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);
      try {
        const cleanId = flashcardId.replace("flashcard_", "");
        const { error: updateError } = await supabase
          .from("flashcard_sets_normalized")
          .update({ is_public: checked })
          .eq("id", cleanId)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        setIsPublic(checked);

        if (checked) {
          const { shareLink, supabaseQueryUrl } = buildLinks(flashcardId);
          setShareUrl(shareLink);
          setApiUrl(supabaseQueryUrl);
        } else {
          setShareUrl("");
          setApiUrl("");
          toast({
            title: "Flashcard set made private",
            description: "Share access revoked"
          });
        }
      } catch (err: any) {
        console.error("Error updating share status:", err);

        // Rollback state
        setIsPublic((prev) => !prev);

        toast({
          title: "Error",
          description: "Unable to update sharing settings. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    },
    [flashcardId, user, buildLinks, toast]
  );

  React.useEffect(() => {
    if (open && flashcardId) {
      fetchMeta();
    }
  }, [open, flashcardId, fetchMeta]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Flashcard Set</DialogTitle>
          <DialogDescription>
            Make your flashcard set public and share it with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="public" className="text-right">
              Make Public
            </Label>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={togglePublic}
              disabled={loading}
            />
          </div>

          {isPublic && (
            <>
              <div className="space-y-2">
                <Label htmlFor="link">Share Link</Label>
                <div className="flex items-center space-x-2">
                  <Input id="link" value={shareUrl} readOnly className="flex-1" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy("url")}
                    className="shrink-0"
                  >
                    {copied === "url" ? (
                      <CopyCheck className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
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
