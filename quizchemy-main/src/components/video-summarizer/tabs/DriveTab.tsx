
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HardDrive, Sparkles } from 'lucide-react';
import { useVideoContext } from '../VideoContext';
import { useToast } from '@/hooks/use-toast';

export const DriveTab: React.FC = () => {
  const { setVideoFile, setVideoSource, isProcessing, setSummary, setCurrentStep } = useVideoContext();
  const { toast } = useToast();
  const [driveUrl, setDriveUrl] = useState('');

  const isValidDriveUrl = (url: string) => {
    const driveRegex = /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/.*$/;
    return url.trim() && driveRegex.test(url);
  };

  // Auto-preview when valid Google Drive URL is entered
  useEffect(() => {
    if (isValidDriveUrl(driveUrl)) {
      setVideoFile({
        id: `drive-${Date.now()}`,
        name: "Google Drive Video",
        type: "drive",
        url: driveUrl
      });
      setVideoSource('drive');
      setSummary(null);
    }
  }, [driveUrl, setVideoFile, setVideoSource, setSummary]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Google Drive URL</label>
        <div className="relative">
          <HardDrive className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="https://drive.google.com/file/d/..."
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            disabled={isProcessing}
            className="pl-10 h-12 text-base transition-all border-2 border-gray-300 focus:border-primary rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};
