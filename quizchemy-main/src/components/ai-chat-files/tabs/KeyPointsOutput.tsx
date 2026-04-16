import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, Calendar, BookOpen, MousePointer } from 'lucide-react';
import { useFileContext } from '../FileContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-utils';
interface KeyPointsData {
  central_topic: string;
  branches: Array<{
    topic: string;
    subtopics: string[];
    key_points: string[];
  }>;
}
export const KeyPointsOutput: React.FC = () => {
  const { selectedFile } = useFileContext();
  const {
    toast
  } = useToast();
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

  const pollForKeyPointsResult = async (taskId: string, makeAuthenticatedRequest: any) => {
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
          
          // Check if line starts with a numbered point - be flexible about emojis
          // Look for pattern: [emoji] **[number]. [text]** (with or without truncation)
          const pointMatch = line.match(/[\u{1F000}-\u{1F9FF}]\s*\*\*(\d+\.\s*.*?)(\.\.\.)?\*\*/u);
          if (pointMatch) {
            console.log('📊 Found key point match:', pointMatch[1]);
            // Save previous point if exists
            if (currentPoint) {
              points.push(currentPoint);
            }
            // Start new point
            currentPoint = {
              topic: pointMatch[1],
              subtopics: [],
              key_points: []
            };
          } else if (currentPoint && line.trim() && !line.includes('**Standard Key Points Analysis**')) {
            // Add content to current point
            const cleanLine = line.trim();
            if (cleanLine.length > 0) {
              currentPoint.key_points.push(cleanLine);
            }
          }
        }
        
        // Add the last point
        if (currentPoint) {
          points.push(currentPoint);
        }
        
        console.log('📊 Total key points parsed:', points.length);
        
        parsedKeyPoints = {
          central_topic: "Document Key Points",
          branches: points
        };
      } else if (data.key_points) {
        // Old format: Transform the API response into the expected KeyPointsData format
        parsedKeyPoints = {
          central_topic: "Document Key Points",
          branches: data.key_points.map((kp: any) => ({
            topic: kp.point,
            subtopics: [],
            key_points: kp.details || []
          }))
        };
      } else {
        throw new Error('No key points data found in response');
      }
    } catch (e) {
      console.error('📊 Key points parse error:', e);
      toast({
        title: "Key Points Parse Error",
        description: String(e),
        variant: "destructive"
      });
    }
    setKeyPoints(parsedKeyPoints);
  };
  const generateKeyPoints = async () => {
    const documentId = selectedFile && selectedFile.chatData ? selectedFile.chatData.document_id : undefined;
    if (!selectedFile || !documentId) {
      toast({
        title: "No document selected",
        description: "Please select a document first"
      });
      return;
    }
    
    // Stop any existing polling before starting new request
    stopPolling();
    
    setIsGenerating(true);

    // Call backend API for key points
    const formData = new FormData();
    
    // Add the original file if available
    if (selectedFile?.originalFile instanceof File) {
      formData.append('file', selectedFile.originalFile);
      console.log('Adding file to key points request:', {
        name: selectedFile.originalFile.name,
        size: selectedFile.originalFile.size,
        type: selectedFile.originalFile.type
      });
    }
    
    formData.append('document_id', String(documentId));
    
    import('@/lib/api-utils').then(({ makeAuthenticatedFormRequest, makeAuthenticatedRequest, API_URL }) => {
      makeAuthenticatedFormRequest(`${API_URL}/api/document/key-points`, formData)
        .then(async (response: any) => {
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
              // Immediate response (small PDFs)
              console.log('📊 Processing immediate key points response');
              processKeyPointsResponse(data);
              setIsGenerating(false);
            } else if (data.task_id && data.status === 'processing') {
              // Need to poll for result (large PDFs)
              console.log('📊 Polling for key points task:', data.task_id);
              pollForKeyPointsResult(data.task_id, makeAuthenticatedRequest);
            } else {
              throw new Error('No key points data or task ID found in response');
            }
          } else {
            toast({
              title: "Key points generation failed",
              description: data.message || "Failed to generate key points",
              variant: "destructive"
            });
            setIsGenerating(false);
          }
        })
        .catch((err: any) => {
          toast({
            title: "Network error",
            description: err?.message || String(err),
            variant: "destructive"
          });
          setIsGenerating(false);
        });
    });
  };

  const jumpToDocument = (point: string) => {
    toast({
      title: "Jump to document",
      description: `Highlighting "${point}" in the document`
    });
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
    <div className="space-y-6 p-6 overflow-x-hidden">
      {!keyPoints ? (
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Extract and organize the most important points from your document
          </p>
          <Button onClick={generateKeyPoints} disabled={!selectedFile || !selectedFile.chatData || !selectedFile.chatData.document_id}>
            Extract Key Points
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              
            </CardHeader>
            <CardContent className="space-y-4 overflow-x-hidden break-words">
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
                <span className="text-muted-foreground">No branches found.</span>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};