
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useVideoContext } from './VideoContext';
import { VideoUploader } from './VideoUploader';
import { VideoResults } from './VideoResults';

export const VideoSummarizerContainer: React.FC = () => {
  const { currentStep, videoFile, clearVideo } = useVideoContext();

  // Clear video state when component mounts
  useEffect(() => {
    clearVideo();
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <div className="grid grid-cols-1 gap-6">
      {currentStep === 'upload' ? (
        <div className="w-full max-w-4xl mx-auto">
          <VideoUploader />
          
          {/* Popular Use Cases */}
          <div className="mt-28">
            <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
            <div className="container max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                  <div className="w-12 h-12 mx-auto">
                    <img src="/icons/content-lecture.svg" alt="" className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium">Educational Content</h3>
                  <p className="text-muted-foreground">
                    Extract key learning points and concepts from educational videos
                  </p>
                </Card>
                <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                  <div className="w-12 h-12 mx-auto">
                    <img src="/icons/meeting-notes.svg" alt="" className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium">Meeting Summaries</h3>
                  <p className="text-muted-foreground">
                    Convert video meetings into structured, actionable summaries
                  </p>
                </Card>
                <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                  <div className="w-12 h-12 mx-auto">
                    <img src="/icons/research-analysis.svg" alt="" className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium">Research Analysis</h3>
                  <p className="text-muted-foreground">
                    Transform research videos into organized documentation
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      ) : (
        videoFile ? (
          <VideoResults />
        ) : (
          <Card className="p-8 text-center">
            <p>No video selected. Please go back and select a video.</p>
          </Card>
        )
      )}
    </div>
  );
};
