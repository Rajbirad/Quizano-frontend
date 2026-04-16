import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Copy, Download } from 'lucide-react';
import { useFileContext } from '../FileContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-utils';

export const SummaryOutput: React.FC = () => {
  const { selectedFile } = useFileContext();
  const { toast } = useToast();
  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryType, setSummaryType] = useState<'brief' | 'medium' | 'detailed' | undefined>(undefined);
  const currentTaskRef = useRef<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on component unmount and page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📊 Page became hidden, stopping polling');
        stopPolling();
        setIsGenerating(false);
      }
    };

    const handleBeforeUnload = () => {
      console.log('📊 Page unloading, stopping polling');
      stopPolling();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      console.log('📊 SummaryOutput component unmounting, stopping polling');
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      currentTaskRef.current = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const stopPolling = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    currentTaskRef.current = null;
  };

  const pollForSummaryResult = async (taskId: string, makeAuthenticatedRequest: any) => {
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
        console.log(`📊 Polling attempt ${attempts} for task ${taskId}`);
        
        const response = await makeAuthenticatedRequest(`${API_URL}/api/task-status/${taskId}`);
        const statusData = await response.json();
        
        console.log('📊 Task status response:', statusData);

        if (statusData.status === 'completed' && statusData.result) {
          console.log('📊 Task completed, processing result:', statusData.result);
          
          // Only process if this is still the current task
          if (currentTaskRef.current === taskId) {
            let summaryContent = statusData.result.answer || statusData.result.response || '';
            
            // Check if highlights are separate and need to be added
            if (statusData.result.highlights && !summaryContent.includes('Key Highlights:') && !summaryContent.includes(statusData.result.highlights)) {
              summaryContent += '\n\n**Key Highlights:**\n' + statusData.result.highlights;
            }
            
            // Check if insights are separate and need to be added
            if (statusData.result.insights && !summaryContent.includes('Key Insights:') && !summaryContent.includes(statusData.result.insights)) {
              summaryContent += '\n\n**Key Insights:**\n' + statusData.result.insights;
            }
            
            setSummary(summaryContent);
            setIsGenerating(false);
            currentTaskRef.current = null;
          }
          return;
        } else if (statusData.status === 'failed') {
          if (currentTaskRef.current === taskId) {
            toast({
              title: "Summary generation failed",
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
              title: "Summary generation timeout",
              description: "The summary is taking longer than expected. Please try again.",
              variant: "destructive"
            });
            setIsGenerating(false);
            currentTaskRef.current = null;
          }
        }
      } catch (error) {
        console.error('📊 Error polling for task status:', error);
        if (currentTaskRef.current === taskId && attempts < maxAttempts) {
          pollingTimeoutRef.current = setTimeout(checkStatus, 5000);
        } else if (currentTaskRef.current === taskId) {
          toast({
            title: "Network error",
            description: "Failed to check summary status",
            variant: "destructive"
          });
          setIsGenerating(false);
          currentTaskRef.current = null;
        }
      }
    };

    checkStatus();
  };

  const generateSummary = async (type: 'brief' | 'medium' | 'detailed') => {
    if (!selectedFile?.chatData?.document_id) {
      toast({
        title: "No document selected",
        description: "Please select a document first"
      });
      return;
    }
    
    // Stop any existing polling before starting new request
    stopPolling();
    
    const documentId = selectedFile.chatData.document_id;

    setSummaryType(type);
    setIsGenerating(true);

    // Call backend API for summary
    const formData = new FormData();
    
    // Add the original file if available
    if (selectedFile?.originalFile instanceof File) {
      formData.append('file', selectedFile.originalFile);
      console.log('Adding file to request:', {
        name: selectedFile.originalFile.name,
        size: selectedFile.originalFile.size,
        type: selectedFile.originalFile.type
      });
    } else {
      console.log('No original file found in selected file');
    }
    
    formData.append('document_id', String(documentId));
    formData.append('length', type);

    console.log('Sending summary request with:', {
      documentId,
      type,
      hasFile: selectedFile?.originalFile instanceof File,
      fileName: selectedFile?.originalFile instanceof File ? selectedFile.originalFile.name : 'No file'
    });

    import('@/lib/api-utils').then(({ makeAuthenticatedFormRequest, makeAuthenticatedRequest }) => {
      makeAuthenticatedFormRequest(`${API_URL}/api/document/summary`, formData)
        .then(async (response: any) => {
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Summary API error:', errorText);
            toast({
              title: "Summary API Error",
              description: errorText,
              variant: "destructive"
            });
            setIsGenerating(false);
            return;
          }
          const data = await response.json();
          console.log('📊 Summary API response:', data);
          console.log('📊 Processing type:', data.processing_type);
          
          if (data.success) {
            // Check if we have immediate answer or need to poll
            if (data.answer) {
              // Immediate response (like key points)
              console.log('📊 Processing immediate response');
              let summaryContent = data.answer;
              
              // For key points, highlights might be JSON string, so don't concatenate
              // Only add highlights if they're separate string content and not already included
              if (data.highlights && 
                  typeof data.highlights === 'string' && 
                  !data.highlights.startsWith('[') && // Not JSON array
                  !data.answer.includes('Key Highlights:') && 
                  !data.answer.includes(data.highlights)) {
                summaryContent += '\n\n**Key Highlights:**\n' + data.highlights;
              }
              
              // Check if insights are separate and need to be added
              if (data.insights && 
                  typeof data.insights === 'string' && 
                  !data.answer.includes('Key Insights:') && 
                  !data.answer.includes(data.insights)) {
                summaryContent += '\n\n**Key Insights:**\n' + data.insights;
              }
              
              setSummary(summaryContent);
              setIsGenerating(false);
            } else if (data.task_id && data.status === 'processing') {
              // Need to poll for result
              console.log('📊 Polling for task:', data.task_id);
              pollForSummaryResult(data.task_id, makeAuthenticatedRequest);
            } else if (data.structured_summary) {
              // Handle old response structure for backward compatibility
              const { summary, highlights, key_insights } = data.structured_summary;
              setSummary(`${summary}\n\n${highlights}\n\n${key_insights}`);
              setIsGenerating(false);
            } else {
              // Fallback to any available content
              setSummary(data.summary || data.response || JSON.stringify(data));
              setIsGenerating(false);
            }
          } else {
            toast({
              title: "Summary generation failed",
              description: data.message || "Failed to generate summary",
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

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Summary copied",
      description: "The summary has been copied to your clipboard"
    });
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile?.name || 'document'}-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Summary downloaded",
      description: "The summary has been downloaded as a text file"
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
        <p className="text-muted-foreground">Generating {summaryType} summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 overflow-x-hidden">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Document Summary</h2>
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
          disabled={!selectedFile?.id}
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
          disabled={!selectedFile?.id}
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
          disabled={!selectedFile?.id}
        >
          Detailed
        </Button>
      </div>

      {summary ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={copySummary}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={downloadSummary}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-hidden">
            <div className="space-y-3 overflow-x-hidden break-words">
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
                  
                  // Check if this header section contains bullet points within the same section
                  const headerLines = section.split('\n');
                  const hasBulletsInHeader = headerLines.slice(1).some(line => /^[-\s]*[⚙️💾🎮🧵⚠️🚀💡🛠️🔄📊📈🔍✨🎯📝💻🖥️📱⭐🎪🎨🎭🎵🎶🎬🎤🎸🎹🎺🎻🥁🎲🎯🏆🏅🏁🚩⛳🎭🎪🎨🎯🎲🎰🎳🎪🎨🎭🎯🎲]/u.test(line.trim()));
                  
                  if (hasBulletsInHeader && headerLines.length > 1) {
                    // Render as header + bullet content (all in one section)
                    return (
                      <div key={index} className="space-y-2">
                        <div className="text-lg mt-6 first:mt-0 font-medium">
                          {headerText}
                        </div>
                        <div className="pl-4">
                          <div className="whitespace-pre-line text-sm leading-relaxed">
                            {renderWithBold(headerLines.slice(1).join('\n'))}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Regular header only
                    return (
                      <div key={index} className="text-lg mt-6 first:mt-0 font-medium">
                        {headerText}
                      </div>
                    );
                  }
                }
                
                // Detect if this section is a title (starts with 🔍)
                const isInsightSection = section.trim().startsWith('🔍');
                if (isInsightSection) {
                  return (
                    <div key={index} className="mt-4 first:mt-0">
                      <div className="whitespace-pre-line text-sm leading-relaxed">
                        {renderWithBold(section)}
                      </div>
                    </div>
                  );
                }
                // Check if section contains bullet points (starts with emoji)
                // Skip if this might be a continuation of a header section that was already processed
                const hasBullets = section.trim().split('\n').some(line => /^[-\s]*[⚙️💾🎮🧵⚠️🚀💡🛠️🔄�📈🔍✨🎯📝💻🖥️📱⭐🎪🎨🎭🎵🎶🎬🎤🎸🎹🎺🎻🥁🎲🎯🏆🏅🏁🚩⛳🎭🎪🎨🎯🎲🎰🎳🎪🎨🎭🎯🎲]/u.test(line.trim()));
                const isStandaloneBullets = hasBullets && !section.trim().startsWith('## ');
                
                if (isStandaloneBullets) {
                  return (
                    <div key={index} className="pl-4">
                      <div className="whitespace-pre-line text-sm leading-relaxed">
                        {renderWithBold(section)}
                      </div>
                    </div>
                  );
                }
                // Regular section
                return (
                  <div key={index} className="text-sm leading-relaxed">
                    <div className="whitespace-pre-line">
                      {renderWithBold(section)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Click on Brief, Medium, or Detailed above to generate a summary
          </p>
        </div>
      )}
    </div>
  );
};