import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Plus,
  ArrowLeft, 
  ImageIcon,
  Clock,
  FileText,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InfographicData {
  success: boolean;
  image_url: string;
  infographic_id: string;
  share_id: string;
  complexity_level: string;
  content_source: string;
  processing_time: number;
  message: string;
}

const InfographicResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [infographicData, setInfographicData] = useState<InfographicData | null>(
    location.state?.infographic || null
  );
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!location.state?.infographic) {
      toast({
        title: "No infographic data",
        description: "Redirecting to generator...",
        variant: "destructive",
      });
      navigate('/app/ai-infographic');
    }
  }, [location.state, navigate, toast]);

  const handleDownload = async () => {
    if (!infographicData?.image_url) return;

    setIsDownloading(true);
    try {
      const response = await fetch(infographicData.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `infographic-${infographicData.infographic_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your infographic is being downloaded.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the infographic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNew = () => {
    navigate('/app/ai-infographic');
  };

  if (!infographicData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading infographic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-end mb-8">
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              onClick={handleNew}
              className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        <div className="mx-auto">
          {/* Main Infographic Display */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <CardContent className="p-0">
              <div className="bg-white">
                <img
                  src={infographicData.image_url}
                  alt="Generated Infographic"
                  className="w-full h-auto mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfographicResult;
