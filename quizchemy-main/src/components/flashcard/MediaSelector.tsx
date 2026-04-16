
import React, { useRef } from 'react';
import { Image, Video, Youtube, X } from 'lucide-react';
import { MediaButton } from './MediaButton';
import { MediaPreviewCard } from './MediaPreviewCard';
import { useMediaUpload } from '@/utils/media-utils';
import { useToast } from '@/hooks/use-toast';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';

interface MediaSelectorProps {
  mediaType: 'none' | 'image' | 'video' | 'youtube';
  mediaUrl: string;
  youtubeUrl: string;
  onMediaChange: (type: 'none' | 'image' | 'video' | 'youtube', url: string) => void;
  onYoutubeUrlChange: (url: string) => void;
  onClearMedia: () => void;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  mediaType,
  mediaUrl,
  youtubeUrl,
  onMediaChange,
  onYoutubeUrlChange,
  onClearMedia,
}) => {
  const { toast } = useToast();
  const { validateImageFile, validateVideoFile, validateYoutubeUrl } = useMediaUpload();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      try {
        // Show loading state
        toast({
          title: "Uploading image...",
          description: "Please wait while we upload your image.",
        });

        // Create form data and append the raw file
        const formData = new FormData();
        formData.append('file', file, file.name);

        // Upload image to server using authenticated request
        const response = await makeAuthenticatedFormRequest('/api/upload-image', formData);

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        if (data.success && data.url) {
          // Update the media with the permanent URL from Supabase
          onMediaChange('image', data.url);
          toast({
            title: "Image uploaded successfully",
            description: "Your image has been uploaded and added to the flashcard.",
          });
        } else {
          throw new Error(data.message || 'Invalid response from server');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error uploading image",
          description: error.message || "Failed to upload image. Please try again.",
          variant: "destructive"
        });
        onClearMedia();
        // Clean up any object URLs that might have been created
        if (mediaUrl.startsWith('blob:')) {
          URL.revokeObjectURL(mediaUrl);
        }
      }
    }
  };
  
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateVideoFile(file)) {
      try {
        // Show loading state
        toast({
          title: "Uploading video...",
          description: "Please wait while we upload your video.",
        });

        // Create form data and append the raw file
        const formData = new FormData();
        formData.append('file', file, file.name);

        // Upload video to server
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to upload video');
        }

        const data = await response.json();
        if (data.success && data.url) {
          // Update the media with the permanent URL from Supabase
          onMediaChange('video', data.url);
          toast({
            title: "Video uploaded successfully",
            description: "Your video has been uploaded and added to the flashcard.",
          });
        } else {
          throw new Error(data.message || 'Invalid response from server');
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        toast({
          title: "Error uploading video",
          description: error.message || "Failed to upload video. Please try again.",
          variant: "destructive"
        });
        onClearMedia();
      }
    }
  };
  
  const handleYoutubeUrl = () => {
    if (validateYoutubeUrl(youtubeUrl)) {
      onMediaChange('youtube', youtubeUrl);
    }
  };
  
  const handleYoutubePrompt = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (url) {
      onYoutubeUrlChange(url);
      if (validateYoutubeUrl(url)) {
        onMediaChange('youtube', url);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          id="image-upload"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <MediaButton
          icon={Image}
          label="Image"
          onClick={() => imageInputRef.current?.click()}
          isActive={mediaType === 'image'}
        />
        
        <input
          type="file"
          id="video-upload"
          ref={videoInputRef}
          className="hidden"
          accept="video/*"
          onChange={handleVideoUpload}
        />
        <MediaButton
          icon={Video}
          label="Video"
          onClick={() => videoInputRef.current?.click()}
          isActive={mediaType === 'video'}
        />
        
        <MediaButton
          icon={Youtube}
          label="YouTube"
          onClick={handleYoutubePrompt}
          isActive={mediaType === 'youtube'}
        />
        
        {mediaType !== 'none' && (
          <MediaButton
            icon={X}
            label="Clear Media"
            onClick={onClearMedia}
            isActive={false}
          />
        )}
      </div>
      
      {/* Media preview */}
      <MediaPreviewCard
        mediaType={mediaType}
        mediaUrl={mediaUrl}
        youtubeUrl={youtubeUrl}
        onClearMedia={onClearMedia}
      />
    </div>
  );
};
