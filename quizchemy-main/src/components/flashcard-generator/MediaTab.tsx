
import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, Video, Youtube } from 'lucide-react';

interface MediaTabProps {
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleYoutubeUrl: () => void;
  renderMediaPreview: () => React.ReactNode;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  youtubeUrl,
  setYoutubeUrl,
  handleImageUpload,
  handleVideoUpload,
  handleYoutubeUrl,
  renderMediaPreview
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="figma-card">
      <CardHeader>
        <CardTitle>Add Media to Flashcards</CardTitle>
        <CardDescription>
          Upload images, videos, or add YouTube links to enhance your flashcards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Upload Image</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Add images to make your flashcards more visual
            </p>
            <input
              type="file"
              id="image-upload"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Image className="h-4 w-4 mr-2" />
              Browse Image
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Upload Video</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Add a video to provide visual explanations
            </p>
            <input
              type="file"
              id="video-upload"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleVideoUpload}
            />
            <Button
              onClick={() => videoInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Video className="h-4 w-4 mr-2" />
              Browse Video
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Add YouTube Video</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Add a YouTube video by pasting the URL
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <Button onClick={handleYoutubeUrl}>Add</Button>
          </div>
        </div>
        
        {renderMediaPreview()}
      </CardContent>
    </Card>
  );
};
