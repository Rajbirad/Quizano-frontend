
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  quizId?: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ open, onOpenChange, quizId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPublic, setIsPublic] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Generate share URLs based on quizId
  const shareUrl = quizId ? `${window.location.origin}/app/quiz-study/${quizId}` : '';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
    }
  };

  // Fetch quiz meta info when dialog opens
  React.useEffect(() => {
    if (!open || !user || !quizId) {
      setIsPublic(false);
      return;
    }

    let isMounted = true;

    const fetchMeta = async () => {
      try {
        setLoading(true);
        console.log('Fetching meta for quiz:', quizId);

        const { data: quiz, error } = await supabase
          .from('quizzes_normalized')
          .select('is_public')
          .eq('id', quizId)
          .single();

        // Check if component is still mounted
        if (!isMounted) return;

        if (error) throw error;

        if (quiz) {
          setIsPublic(quiz.is_public || false);
        } else {
          throw new Error('Quiz not found');
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching meta:', err);
          setIsPublic(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMeta();

    return () => {
      isMounted = false;
    };
  }, [open, quizId, toast, user]);

  const togglePublic = async () => {
    if (!user || !quizId) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('quizzes_normalized')
        .update({ is_public: !isPublic })
        .eq('id', quizId);

      if (error) throw error;

      setIsPublic(!isPublic);
    } catch (error) {
      console.error('Error toggling quiz visibility:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Share Quiz</DialogTitle>
          <DialogDescription>
            Make your quiz public to share it with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!quizId ? (
            <div className="text-center text-muted-foreground">
              This quiz needs to be saved before it can be shared.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="public" className="font-medium">Make Quiz Public</Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={togglePublic}
                  disabled={loading}
                />
              </div>

              {isPublic && (
            <div className="space-y-2">
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
                  onClick={() => handleCopy(shareUrl)}
                >
                  {copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
