import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { makeAuthenticatedRequest } from '@/lib/api-utils';
import { supabase } from '@/integrations/supabase/client';

interface MindMapShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mindmapId?: string | null;
  initialShareId?: string | null;
  mindmapData: any;
}

export const MindMapShareDialog: React.FC<MindMapShareDialogProps> = ({ 
  open, 
  onOpenChange, 
  mindmapId,
  initialShareId,
  mindmapData 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareId, setShareId] = useState<string | null>(initialShareId || null);
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const shareUrl = shareId ? `${window.location.origin}/mindmap/${shareId}` : '';

  // Fetch mindmap public status when dialog opens
  useEffect(() => {
    if (!open || !mindmapId) {
      return;
    }

    const fetchMindMapStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('mindmaps')
          .select('is_public, share_id')
          .eq('id', mindmapId)
          .single();

        if (error) throw error;

        if (data) {
          setIsPublic(data.is_public || false);
          if (data.share_id) {
            setShareId(data.share_id);
          }
        }
      } catch (error) {
        console.error('Error fetching mindmap status:', error);
      }
    };

    fetchMindMapStatus();
  }, [open, mindmapId]);

  useEffect(() => {
    // If we have initialShareId already, use it
    if (initialShareId) {
      setShareId(initialShareId);
    }
  }, [initialShareId]);

  const togglePublic = async () => {
    if (!mindmapId) {
      toast({
        title: 'Error',
        description: 'Mindmap ID not found.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for the POST request
      const formData = new FormData();
      formData.append('mindmap_id', mindmapId);
      formData.append('is_public', (!isPublic).toString());

      console.log('📡 Toggling mindmap visibility:', { mindmapId, is_public: !isPublic });

      const response = await makeAuthenticatedRequest('/api/mindmap/share', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update mindmap visibility');
      }

      const data = await response.json();
      console.log('✅ Share API Response:', data);
      
      setIsPublic(data.is_public);
      if (data.share_id) {
        setShareId(data.share_id);
      }

      toast({
        title: data.is_public ? 'Mindmap is now public' : 'Mindmap is now private',
        description: data.message || (data.is_public ? 'Your mindmap is now publicly accessible!' : 'Your mindmap is now private.'),
      });
    } catch (error) {
      console.error('Toggle error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update mindmap visibility. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        description: 'Link copied to clipboard!',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Mind Map</DialogTitle>
          <DialogDescription>
            Make your mind map public to share it with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!mindmapId ? (
            <div className="text-center text-muted-foreground">
              This mind map needs to be saved before it can be shared.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="public" className="font-medium">Make Mind Map Public</Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={togglePublic}
                  disabled={loading}
                />
              </div>

              {isPublic && shareUrl && (
                <div className="space-y-2">
                  <Label htmlFor="share-url">Shareable Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="share-url"
                      value={shareUrl}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anyone with this link can view your mind map
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
