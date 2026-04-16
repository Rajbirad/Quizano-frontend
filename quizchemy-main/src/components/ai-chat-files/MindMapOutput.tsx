import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFileContext } from './FileContext';
import { MindMapEmpty } from './mind-map/MindMapEmpty';
import { MindMapLoading } from './mind-map/MindMapLoading';
import D3MindMap from "@/components/ai-chat-files/D3MindMap"; // ✅ D3 mind map with proper text handling
import D3MindMapExpandable from "@/components/ai-chat-files/D3MindMapExpandable"; // ✅ Expandable version with arrows
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest, API_URL } from '@/lib/api-utils';

interface MindMapOutputProps {
  apiType?: 'video' | 'document';
}

export const MindMapOutput: React.FC<MindMapOutputProps> = ({ apiType = 'video' }) => {
  const { selectedFile } = useFileContext();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [useExpandableView, setUseExpandableView] = useState(true); // Default to expandable view
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

  const pollForMindMapResult = async (taskId: string, makeAuthenticatedRequest: any) => {
    // Stop any existing polling
    stopPolling();
    
    // Set current task
    currentTaskRef.current = taskId;
    
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      // Check if this task is still the current one
      if (currentTaskRef.current !== taskId) {
        console.log(`🗺️ Task ${taskId} is no longer current, stopping polling`);
        return;
      }

      try {
        attempts++;
        console.log(`🗺️ Polling attempt ${attempts} for mind map task ${taskId}`);
        
        const response = await makeAuthenticatedRequest(`${API_URL}/api/task-status/${taskId}`);
        const statusData = await response.json();
        
        console.log('🗺️ Mind map task status response:', statusData);

        if (statusData.status === 'completed' && statusData.result) {
          console.log('🗺️ Mind map task completed, processing result:', statusData.result);
          
          // Only process if this is still the current task
          if (currentTaskRef.current === taskId) {
            processMindMapResponse(statusData.result);
            setIsGenerating(false);
            currentTaskRef.current = null;
          }
          return;
        } else if (statusData.status === 'failed') {
          if (currentTaskRef.current === taskId) {
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
            setIsGenerating(false);
            currentTaskRef.current = null;
          }
        }
      } catch (error) {
        console.error('🗺️ Error polling for mind map task status:', error);
        if (currentTaskRef.current === taskId && attempts < maxAttempts) {
          pollingTimeoutRef.current = setTimeout(checkStatus, 5000);
        } else if (currentTaskRef.current === taskId) {
          setIsGenerating(false);
          currentTaskRef.current = null;
        }
      }
    };

    checkStatus();
  };

  const processMindMapResponse = (data: any) => {
    console.log('🗺️ Processing mind map response:', data);
    
    // Extract mind map data from the response
    // The response might have different structures depending on the API
    let mindMapContent = null;
    
    if (data.summary) {
      mindMapContent = data.summary;
    } else if (data.answer) {
      mindMapContent = data.answer;
    } else if (data.mindmap) {
      mindMapContent = data.mindmap;
    } else if (data.content) {
      mindMapContent = data.content;
    } else {
      // Fallback to the entire data object
      mindMapContent = data;
    }
    
    console.log('🗺️ Setting mind map data:', mindMapContent);
    setMindMapData(mindMapContent);
  };

  const generateMindMap = async () => {
    if (!selectedFile) {
      return;
    }

    // For document API, we need document_id, for video API we use fileId
    if (apiType === 'document') {
      const documentId = selectedFile.chatData?.document_id;
      if (!documentId) {
        return;
      }

      setIsGenerating(true);
      setMindMapData(null);
      
      // Stop any existing polling
      stopPolling();
      
      try {
        console.log('🗺️ Generating mind map for document:', documentId);
        
        const formData = new FormData();
        
        // Add the original file if available
        if (selectedFile?.originalFile instanceof File) {
          formData.append('file', selectedFile.originalFile);
          console.log('Adding file to mind map request:', {
            name: selectedFile.originalFile.name,
            size: selectedFile.originalFile.size,
            type: selectedFile.originalFile.type
          });
        } else {
          console.log('No original file found for mind map');
        }
        
        formData.append('document_id', String(documentId));

        const response = await makeAuthenticatedFormRequest(`${API_URL}/api/document/mindmap`, formData);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Mind map API error:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🗺️ Mind map API response:', data);

        // Check if we got a task_id (async processing) or immediate result
        if (data.task_id) {
          console.log('🗺️ Large document - starting async polling for task:', data.task_id);
          
          // Start polling for the result
          pollForMindMapResult(data.task_id, makeAuthenticatedRequest);
        } else {
          // Handle immediate response
          console.log('🗺️ Small document - immediate response received');
          processMindMapResponse(data);
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('🗺️ Error generating mind map:', error);
        setIsGenerating(false);
      }
    } else {
      // Video API - use the existing logic with fileId
      setIsGenerating(true);
      try {
        const response = await fetch("/api/mindmap-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: selectedFile.id })
        });
        if (!response.ok) throw new Error("Failed to generate mind map");
        const data = await response.json();
        console.log('Mind map API response:', data); 
        setMindMapData(data.summary);
      } catch (error) {
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {isGenerating ? (
          <MindMapLoading />
        ) : mindMapData ? (
          <div className="relative flex-1 flex flex-col">
            {/* View controls */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={useExpandableView ? "default" : "outline"}
                size="sm"
                onClick={() => setUseExpandableView(true)}
              >
                Expandable View
              </Button>
              <Button
                variant={!useExpandableView ? "default" : "outline"}
                size="sm"
                onClick={() => setUseExpandableView(false)}
              >
                Radial View
              </Button>
            </div>
            {/* ✅ D3 mind map with proper text measurement and layout */}
            {useExpandableView ? (
              <D3MindMapExpandable summary={mindMapData} />
            ) : (
              <D3MindMap summary={mindMapData} />
            )}
          </div>
        ) : (
          <MindMapEmpty onGenerate={generateMindMap} />
        )}
      </CardContent>
    </Card>
  );
};
