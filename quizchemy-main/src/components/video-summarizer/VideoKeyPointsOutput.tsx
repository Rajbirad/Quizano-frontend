import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL, makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';

interface KeyPointsData {
  central_topic: string;
  branches: Array<{
    topic: string;
    subtopics: string[];
    key_points: string[];
  }>;
}

interface VideoKeyPointsOutputProps {
  videoId: string | null;
}

export const VideoKeyPointsOutput: React.FC<VideoKeyPointsOutputProps> = ({ videoId }) => {
  const { toast } = useToast();
  const [keyPoints, setKeyPoints] = useState<KeyPointsData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const currentTaskRef = useRef<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      currentTaskRef.current = null;
    };
  }, []);

  const stopPolling = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    currentTaskRef.current = null;
  };

  const pollForKeyPointsResult = async (taskId: string) => {
    // Stop any existing polling
    stopPolling();
    
    // Set current task
    currentTaskRef.current = taskId;
    
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      // Check if this task is still the current one
      if (currentTaskRef.current !== taskId) {
        console.log(`📊 Task ${taskId} is no longer current, stopping polling`);
        return;
      }

      try {
        attempts++;
        console.log(`📊 Polling attempt ${attempts} for key points task ${taskId}`);
        
        const response = await makeAuthenticatedRequest(`${API_URL}/api/task-status/${taskId}`);
        const statusData = await response.json();
        
        console.log('📊 Key points task status response:', statusData);

        if (statusData.status === 'completed' && statusData.result) {
          console.log('📊 Key points task completed, processing result:', statusData.result);
          
          // Only process if this is still the current task
          if (currentTaskRef.current === taskId) {
            processKeyPointsResponse(statusData.result);
            setIsGenerating(false);
            currentTaskRef.current = null;
          }
          return;
        } else if (statusData.status === 'failed') {
          if (currentTaskRef.current === taskId) {
            toast({
              title: "Key points generation failed",
              description: statusData.error || "Task failed to complete",
              variant: "destructive"
            });
            setIsGenerating(false);
            currentTaskRef.current = null;
          }
          return;
        } else if (statusData.status === 'processing' && attempts < maxAttempts) {
          // Continue polling only if this is still the current task
          if (currentTaskRef.current === taskId) {
            pollingTimeoutRef.current = setTimeout(checkStatus, 5000);
          }
        } else {
          // Timeout
          if (currentTaskRef.current === taskId) {
            toast({
              title: "Key points generation timeout",
              description: "The analysis is taking longer than expected. Please try again.",
              variant: "destructive"
            });
            setIsGenerating(false);
            currentTaskRef.current = null;
          }
        }
      } catch (error) {
        console.error('📊 Error polling for key points task status:', error);
        if (currentTaskRef.current === taskId && attempts < maxAttempts) {
          pollingTimeoutRef.current = setTimeout(checkStatus, 5000);
        } else if (currentTaskRef.current === taskId) {
          toast({
            title: "Network error",
            description: "Failed to check key points status",
            variant: "destructive"
          });
          setIsGenerating(false);
          currentTaskRef.current = null;
        }
      }
    };

    checkStatus();
  };

  const processKeyPointsResponse = (data: any) => {
    let parsedKeyPoints: KeyPointsData | null = null;
    try {
      // Handle new API response structure
      if (data.answer) {
        // New format: data.answer contains formatted text with numbered points
        const answerText = data.answer;
        console.log('📊 Processing key points answer text:', answerText.substring(0, 200));
        
        // Parse the formatted answer text into key points
        const lines = answerText.split('\n').filter(line => line.trim());
        const points: Array<{topic: string, subtopics: string[], key_points: string[]}> = [];
        
        let currentPoint: {topic: string, subtopics: string[], key_points: string[]} | null = null;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Check if line starts with a numbered point
          const pointMatch = line.match(/[\u{1F000}-\u{1F9FF}]\s*\*\*(\d+\.\s*.*?)(\.\.\.)?\*\*/u);
          if (pointMatch) {
            // Save previous point
            if (currentPoint) {
              points.push(currentPoint);
            }
            
            // Start new point
            const topic = pointMatch[1].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
            currentPoint = {
              topic: topic,
              subtopics: [],
              key_points: []
            };
          } else if (currentPoint) {
            // Add to current point's key points
            const cleanLine = line.replace(/^[-•]\s*/, '').trim();
            if (cleanLine) {
              currentPoint.key_points.push(cleanLine);
            }
          }
        }
        
        // Add last point
        if (currentPoint) {
          points.push(currentPoint);
        }
        
        parsedKeyPoints = {
          central_topic: 'Video Key Points',
          branches: points
        };
      } else {
        console.log('📊 Old format detected');
        parsedKeyPoints = data;
      }
      
      console.log('📊 Parsed key points:', parsedKeyPoints);
      setKeyPoints(parsedKeyPoints);
    } catch (error) {
      console.error('📊 Error processing key points:', error);
      toast({
        title: "Error processing key points",
        description: "Failed to parse the response",
        variant: "destructive"
      });
    }
  };

  const generateKeyPoints = async () => {
    if (!videoId) {
      toast({
        title: "No video selected",
        description: "Please select a video first"
      });
      return;
    }
    
    // Stop any existing polling before starting new request
    stopPolling();
    
    setIsGenerating(true);

    // Call backend API for key points
    const formData = new FormData();
    formData.append('video_id', videoId);
    
    try {
      const response = await makeAuthenticatedFormRequest(`${API_URL}/api/video/key-points`, formData);
      
      if (!response.ok) {
        const errorText = await response.text();
        toast({
          title: "Key Points API Error",
          description: errorText,
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      const data = await response.json();
      console.log('📊 Key Points API response:', data);
      console.log('📊 Processing type:', data.processing_type);
      console.log('📊 Has immediate answer:', !!data.answer);
      console.log('📊 Task ID:', data.task_id);
      
      if (data.success) {
        // Check if we have immediate answer or need to poll
        if (data.answer) {
          // Immediate response
          console.log('📊 Processing immediate key points response');
          processKeyPointsResponse(data);
          setIsGenerating(false);
        } else if (data.task_id) {
          // Async processing - start polling
          console.log('📊 Starting async polling for task:', data.task_id);
          pollForKeyPointsResult(data.task_id);
        } else {
          toast({
            title: "Unexpected response",
            description: "No answer or task ID received",
            variant: "destructive"
          });
          setIsGenerating(false);
        }
      } else {
        toast({
          title: "Key points generation failed",
          description: data.error || "Unknown error",
          variant: "destructive"
        });
        setIsGenerating(false);
      }
    } catch (error: any) {
      console.error('Error generating key points:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate key points",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-pulse flex space-x-2 mb-4">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
        <p className="text-muted-foreground">Extracting key highlights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {!keyPoints ? (
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Extract and organize the most important points from your video
          </p>
          <Button onClick={generateKeyPoints} disabled={!videoId}>
            Extract Key Points
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              
            </CardHeader>
            <CardContent className="space-y-4">
              {keyPoints.branches && keyPoints.branches.length > 0 ? (
                keyPoints.branches.map((branch, idx) => (
                  <div key={idx} className="mb-6">
                    <div className="font-semibold text-lg mb-1">{branch.topic}</div>
                    {branch.key_points && branch.key_points.length > 0 && (
                      <ul className="list-disc ml-6">
                        {branch.key_points.map((kp, kpIdx) => (
                          <li key={kpIdx} className="mb-1 text-sm">{kp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">No key points found.</span>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
