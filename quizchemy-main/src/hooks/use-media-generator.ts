
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getYoutubeId } from '@/components/flashcard-generator/utils';

interface MediaFile {
  file: File;
  url: string;
}

export function useMediaGenerator() {
  const { toast } = useToast();
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video' | 'youtube'>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (jpg, png, gif, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Clean up any previous object URL to prevent memory leaks
      if (mediaType === 'image' && mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setMediaType('image');
      setMediaUrl(objectUrl);
      setMediaFile({ file, url: objectUrl });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file (mp4, webm, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Clean up any previous object URL to prevent memory leaks
      if (mediaType === 'video' && mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setMediaType('video');
      setMediaUrl(objectUrl);
      
      toast({
        title: "Video uploaded",
        description: `Your video has been added to the flashcard.`,
      });
    }
  };

  const handleYoutubeUrl = (url: string) => {
    if (!url) {
      setYoutubeError('');
      return;
    }
    
    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    
    if (!youtubeRegex.test(url)) {
      setYoutubeError('Invalid YouTube URL');
      return;
    }
    
    setYoutubeError('');
    setMediaType('youtube');
    setMediaUrl(url);
  };

  const clearMedia = () => {
    // Clean up any object URLs to prevent memory leaks
    if ((mediaType === 'image' || mediaType === 'video') && mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
    }
    
    setMediaType('none');
    setMediaUrl('');
    setYoutubeUrl('');
    setYoutubeError('');
    
    // Clear file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return {
    mediaType,
    mediaUrl,
    youtubeUrl,
    youtubeError,
    setYoutubeUrl,
    fileInputRef,
    videoInputRef,
    handleImageUpload,
    handleVideoUpload,
    handleYoutubeUrl,
    clearMedia
  };
}
