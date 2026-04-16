
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, Download, Loader2, FileVideo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';

interface SummaryOutputProps {
  videoId: string;
}

export const SummaryOutput: React.FC<SummaryOutputProps> = ({ videoId }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryType, setSummaryType] = useState<'brief' | 'medium' | 'detailed' | undefined>(undefined);
  const { toast } = useToast();
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

  // Stop any existing polling
  const stopPolling = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    currentTaskRef.current = null;
  };

  // Poll for task result
  const pollForSummaryResult = async (taskId: string, makeAuthenticatedRequest: any) => {
    // Set current task
    currentTaskRef.current = taskId;
    
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      // Check if this task is still the current one
      if (currentTaskRef.current !== taskId) {
        console.log(`📹 Task ${taskId} is no longer current, stopping polling`);
        return;
      }

      try {
        attempts++;
        console.log(`📹 Polling attempt ${attempts} for video task ${taskId}`);
        
        const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000'}/api/task-status/${taskId}`);
        const statusData = await response.json();
        
        console.log('📹 Video task status response:', statusData);

        if (statusData.status === 'completed' && statusData.result) {
          console.log('📹 Video task completed, processing result:', statusData.result);
          
          // Only process if this is still the current task
          if (currentTaskRef.current === taskId) {
            let summaryContent = '';
            
            // Handle nested video response structure: result.result.structured_summary
            if (statusData.result?.result?.structured_summary) {
              const structuredSummary = statusData.result.result.structured_summary;
              summaryContent = `## Summary\n${structuredSummary.summary}`;
              
              // Only add highlights if they exist and are not null
              if (structuredSummary.highlights && structuredSummary.highlights !== null) {
                summaryContent += `\n\n## Highlights\n${structuredSummary.highlights}`;
              }
              
              // Only add key insights if they exist and are not null
              if (structuredSummary.key_insights && structuredSummary.key_insights !== null) {
                summaryContent += `\n\n## Key Insights\n${structuredSummary.key_insights}`;
              }
            }
            // Handle flat result structure (fallback)
            else if (statusData.result.structured_summary) {
              const structuredSummary = statusData.result.structured_summary;
              summaryContent = `## Summary\n${structuredSummary.summary}`;
              
              // Only add highlights if they exist and are not null
              if (structuredSummary.highlights && structuredSummary.highlights !== null) {
                summaryContent += `\n\n## Highlights\n${structuredSummary.highlights}`;
              }
              
              // Only add key insights if they exist and are not null
              if (structuredSummary.key_insights && structuredSummary.key_insights !== null) {
                summaryContent += `\n\n## Key Insights\n${structuredSummary.key_insights}`;
              }
            }
            // Handle direct answer format
            else if (statusData.result.answer || statusData.result.response) {
              summaryContent = statusData.result.answer || statusData.result.response || '';
              
              // Check if highlights are separate and need to be added
              if (statusData.result.highlights && !summaryContent.includes('Key Highlights:') && !summaryContent.includes(statusData.result.highlights)) {
                summaryContent += '\n\n**Key Highlights:**\n' + statusData.result.highlights;
              }
              
              // Check if insights are separate and need to be added
              if (statusData.result.insights && !summaryContent.includes('Key Insights:') && !summaryContent.includes(statusData.result.insights)) {
                summaryContent += '\n\n**Key Insights:**\n' + statusData.result.insights;
              }
            }
            // Handle nested result.result.answer format
            else if (statusData.result?.result?.answer || statusData.result?.result?.response) {
              summaryContent = statusData.result.result.answer || statusData.result.result.response || '';
            }
            else {
              summaryContent = 'Summary completed but no content available';
            }
            
            setSummary(summaryContent);
            setLoading(false);
            
            toast({
              title: "Summary generated",
              description: `${summaryType?.charAt(0).toUpperCase() + summaryType?.slice(1)} summary has been generated successfully`
            });
          }
        } else if (statusData.status === 'failed') {
          console.error('📹 Video task failed:', statusData.error);
          if (currentTaskRef.current === taskId) {
            setError(statusData.error || 'Task failed');
            setLoading(false);
            toast({
              title: "Summary generation failed",
              description: statusData.error || "Failed to generate summary",
              variant: "destructive"
            });
          }
        } else if (statusData.status === 'processing') {
          // Continue polling
          if (attempts < maxAttempts && currentTaskRef.current === taskId) {
            pollingTimeoutRef.current = setTimeout(checkStatus, 5000);
          } else if (attempts >= maxAttempts) {
            console.error('📹 Video task polling timeout');
            if (currentTaskRef.current === taskId) {
              setError('Request timeout');
              setLoading(false);
              toast({
                title: "Request timeout",
                description: "The summary is taking longer than expected. Please try again.",
                variant: "destructive"
              });
            }
          }
        }
      } catch (err: any) {
        console.error('📹 Error polling video task status:', err);
        if (currentTaskRef.current === taskId) {
          setError(err.message || 'Polling failed');
          setLoading(false);
          toast({
            title: "Network error",
            description: err?.message || String(err),
            variant: "destructive"
          });
        }
      }
    };

    // Start polling
    checkStatus();
  };

  const generateSummary = async (type: 'brief' | 'medium' | 'detailed') => {
    if (!videoId) {
      toast({
        title: "No video selected",
        description: "Please select a video first"
      });
      return;
    }

    // Stop any existing polling before starting new request
    stopPolling();

    setSummaryType(type);
    setLoading(true);
    setError(null);
    setSummary(null);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('video_id', videoId);
      formData.append('length', type);
      
      console.log('📹 Generating video summary with:', {
        videoId,
        type,
        endpoint: `${import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000'}/api/summarize-video`
      });
      
      // Make API request with the video_id and summary type
      const response = await makeAuthenticatedFormRequest(
        `${import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000'}/api/summarize-video`,
        formData
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log('📹 Video summary API response:', data);
      
      if (data.success) {
        // Check if we have immediate answer or need to poll
        if (data.answer) {
          // Immediate response
          console.log('📹 Processing immediate response');
          let summaryContent = data.answer;
          
          // Add highlights if separate
          if (data.highlights && 
              typeof data.highlights === 'string' && 
              !data.highlights.startsWith('[') && 
              !data.answer.includes('Key Highlights:') && 
              !data.answer.includes(data.highlights)) {
            summaryContent += '\n\n**Key Highlights:**\n' + data.highlights;
          }
          
          // Add insights if separate
          if (data.insights && 
              typeof data.insights === 'string' && 
              !data.answer.includes('Key Insights:') && 
              !data.answer.includes(data.insights)) {
            summaryContent += '\n\n**Key Insights:**\n' + data.insights;
          }
          
          setSummary(summaryContent);
          setLoading(false);
        } else if (data.task_id && data.status === 'processing') {
          // Need to poll for result
          console.log('📹 Polling for video task:', data.task_id);
          const { makeAuthenticatedRequest } = await import('@/lib/api-utils');
          pollForSummaryResult(data.task_id, makeAuthenticatedRequest);
        } else if (data.structured_summary) {
          // Handle old response structure for backward compatibility
          const structuredSummary = data.structured_summary;
          let summaryContent = `## Summary\n${structuredSummary.summary}`;
          
          // Only add highlights if they exist and are not null
          if (structuredSummary.highlights && structuredSummary.highlights !== null) {
            summaryContent += `\n\n## Highlights\n${structuredSummary.highlights}`;
          }
          
          // Only add key insights if they exist and are not null
          if (structuredSummary.key_insights && structuredSummary.key_insights !== null) {
            summaryContent += `\n\n## Key Insights\n${structuredSummary.key_insights}`;
          }
          
          setSummary(summaryContent);
          setLoading(false);
        } else {
          // Fallback to any available content
          setSummary(data.summary || data.response || JSON.stringify(data));
          setLoading(false);
        }
        
        if (!data.task_id) {
          toast({
            title: "Summary generated",
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} summary has been generated successfully`
          });
        }
      } else {
        throw new Error(data.message || 'Failed to generate summary');
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary');
      setLoading(false);
      toast({
        title: "Error",
        description: err.message || 'Failed to generate summary',
        variant: "destructive",
      });
    }
  };
  
  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast({
        title: "Summary copied",
        description: "The summary has been copied to your clipboard"
      });
    }
  };
  
  const downloadSummary = () => {
    if (summary) {
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video-summary.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Summary downloaded",
        description: "Your summary has been downloaded as a text file"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-pulse flex space-x-2 mb-4">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
        <p className="text-muted-foreground">Generating {summaryType} summary...</p>
      </div>
    );
  }
  
  const generateMindMapData = (summaryText: string) => {
    const lines = summaryText.split('\n').filter(line => line.trim());
    const mainTopic = lines[0] || 'Video Summary';
    
    // Group the remaining lines into sections based on empty lines or common patterns
    const sections = [];
    let currentSection = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0 && currentSection.length > 0) {
        sections.push(currentSection);
        currentSection = [];
      } else if (line.length > 0) {
        currentSection.push(line);
      }
    }
    if (currentSection.length > 0) {
      sections.push(currentSection);
    }

    // Convert sections into mind map nodes
    const children = sections.map((section, index) => ({
      id: `section-${index}`,
      title: section[0],
      content: section.slice(1),
      color: ['blue', 'purple', 'pink', 'green'][index % 4],
      icon: '💡'
    }));

    return {
      id: 'root',
      title: mainTopic,
      color: 'blue',
      children
    };
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Video Summary</h2>
        <p className="text-muted-foreground">Choose your preferred summary length</p>
      </div>

      <div className="flex gap-3 justify-center">
        <Button 
          variant={summaryType === 'brief' ? 'default' : 'outline'} 
          className={`px-6 py-3 rounded-full min-w-[80px] shadow-md transition-all duration-200 ${
            summaryType === 'brief' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg' 
              : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
          onClick={() => generateSummary('brief')}
          disabled={!videoId}
        >
          Brief
        </Button>
        <Button 
          variant={summaryType === 'medium' ? 'default' : 'outline'} 
          className={`px-6 py-3 rounded-full min-w-[80px] shadow-md transition-all duration-200 ${
            summaryType === 'medium' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg' 
              : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300 hover:shadow-md'
          }`}
          onClick={() => generateSummary('medium')}
          disabled={!videoId}
        >
          Medium
        </Button>
        <Button 
          variant={summaryType === 'detailed' ? 'default' : 'outline'} 
          className={`px-6 py-3 rounded-full min-w-[80px] shadow-md transition-all duration-200 ${
            summaryType === 'detailed' 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg' 
              : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
          }`}
          onClick={() => generateSummary('detailed')}
          disabled={!videoId}
        >
          Detailed
        </Button>
      </div>

      {summary ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileVideo className="h-5 w-5 text-primary" />
                {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Clipboard className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={downloadSummary}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.split('\n\n').map((section, index) => {
                
                // Function to render text with bold markdown
                const renderWithBold = (text: string) => {
                  const parts = text.split(/(\*\*.*?\*\*)/g);
                  return parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  });
                };
                
                // Check if section is a markdown header (starts with ##)
                if (section.trim().startsWith('## ')) {
                  const headerText = section.trim().replace(/^## /, '');
                  return (
                    <div key={index} className="text-lg mt-6 first:mt-0 font-medium">
                      {renderWithBold(headerText)}
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="whitespace-pre-line">
                      {renderWithBold(section)}
                    </div>
                  );
                }
              })}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          {error}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileVideo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Click on Brief, Medium, or Detailed above to generate a summary
          </p>
        </div>
      )}
    </div>
  );
};
