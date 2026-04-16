import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Youtube, Upload, ExternalLink, Network, MessageSquare, FileText, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaUpload } from '@/utils/media-utils';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';
import { FileUploadTab } from '../notes-generator/tabs/FileUploadTab';
import { YouTubeTab } from '../notes-generator/tabs/YouTubeTab';
import { VideoUploadTab } from '../notes-generator/tabs/VideoUploadTab';
import { WebsiteUrlInput } from '@/components/shared/WebsiteUrlInput';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface MindMapUploaderProps {
  onMindMapGenerated: (mindmap: any, mindmapId?: string, shareId?: string, variation?: string) => void;
}

export const MindMapUploader: React.FC<MindMapUploaderProps> = ({ onMindMapGenerated }) => {
  const { toast } = useToast();
  const { validateYoutubeUrl } = useMediaUpload();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [promptText, setPromptText] = useState('');
  const [textInput, setTextInput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedVariation, setSelectedVariation] = useState<'variation1' | 'variation2'>('variation1');
  const [contentLength, setContentLength] = useState('standard');
  const [language, setLanguage] = useState('Auto');

  const pollTaskStatus = async (taskId: string, contentSource: string) => {
    const maxAttempts = 180; // 15 minutes max (180 * 5 seconds)
    let attempts = 0;
    
    const poll = async (): Promise<void> => {
      try {
        attempts++;
        
        const response = await makeAuthenticatedRequest(`/api/task-status/${taskId}`, {
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error('Failed to check task status');
        }
        
        const statusData = await response.json();
        console.log('📊 Task Status:', statusData);
        
        // Update progress based on status
        const currentProgress = 40 + Math.min(50, (attempts / maxAttempts) * 50);
        setProgress(Math.round(currentProgress));
        
        if (statusData.status === 'completed') {
          console.log('✅ Task completed:', statusData);
          setProgress(100);
          
          // API returns mindmap directly on statusData, or nested under statusData.result
          const mindmap = statusData.mindmap || statusData.result?.mindmap;
          const mindmapId = statusData.mindmap_id || statusData.result?.mindmap_id;
          const shareId = statusData.share_id || statusData.result?.share_id;
          if (mindmap) {
            onMindMapGenerated(mindmap, mindmapId, shareId, selectedVariation);
            toast({
              title: "Success!",
              description: "Mind map generated successfully from video.",
            });
          } else {
            throw new Error('No mindmap data in result');
          }
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Task failed');
        } else if (statusData.status === 'processing' || statusData.status === 'pending') {
          setStatusMessage(statusData.message || 'Processing video...');
          
          if (attempts >= maxAttempts) {
            throw new Error('Processing timeout - please try again');
          }
          
          // Continue polling after 5 seconds
          await new Promise(resolve => setTimeout(resolve, 5000));
          await poll();
        } else {
          throw new Error('Unknown task status: ' + statusData.status);
        }
      } catch (error) {
        console.error('Polling error:', error);
        throw error;
      }
    };
    
    await poll();
  };

  const handleGenerateMindMap = async () => {
    // Prevent duplicate calls
    if (isProcessing) {
      console.log('Already processing, ignoring duplicate call');
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate mind maps.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(10);
      
      const formData = new FormData();
      
      switch (activeTab) {
        case 'file':
          if (!uploadedFile) {
            toast({
              title: "No file uploaded",
              description: "Please upload a file to generate mind map from.",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }
          formData.append('file', uploadedFile);
          break;
          
        case 'youtube':
          const validation = validateYoutubeUrl(youtubeUrl);
          if (!validation.isValid) {
            setYoutubeError(validation.error);
            setIsProcessing(false);
            return;
          }
          formData.append('youtube_url', youtubeUrl);
          break;
          
        case 'video':
          if (!uploadedVideo) {
            toast({
              title: "No video uploaded",
              description: "Please upload a video to generate mind map from.",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }
          formData.append('video_file', uploadedVideo);
          break;
          
        case 'prompt':
          if (!promptText.trim()) {
            toast({
              title: "No topic provided",
              description: "Please enter a topic to generate mind map from.",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }
          formData.append('prompt', promptText.trim());
          break;
          
        case 'text':
          if (!textInput.trim()) {
            toast({
              title: "No text provided",
              description: "Please enter text to generate mind map from.",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }
          formData.append('text', textInput.trim());
          break;
          
        case 'website':
          if (!websiteUrl.trim()) {
            toast({
              title: "No website URL provided",
              description: "Please enter a website URL to generate mind map from.",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }
          formData.append('website_url', websiteUrl.trim());
          break;
          
        default:
          throw new Error('Invalid tab selected');
      }
      
      // Map UI "Content Length" to API "complexity_level"
      formData.append('complexity_level', contentLength);
      if (language && language !== 'Auto') {
        formData.append('language', language);
      }
      
      setProgress(30);
      
      // Log what we're sending
      console.log('Sending mindmap request:', {
        activeTab,
        complexity_level: contentLength,
        language: language !== 'Auto' ? language : '(auto)',
        hasFile: formData.has('file'),
        hasYoutubeUrl: formData.has('youtube_url'),
        hasVideoFile: formData.has('video_file')
      });
      
      const response = await makeAuthenticatedFormRequest('/api/mindmap', formData);
      
      setProgress(70);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('🔍 Mindmap API Response:', data);
      
      // Check if response is async processing (for video uploads)
      if (data.status === 'processing' && data.task_id) {
        console.log('📡 Task ID for polling:', data.task_id);
        setStatusMessage(data.message || 'Processing video...');
        setProgress(40);
        
        // Poll for task completion
        await pollTaskStatus(data.task_id, data.content_source);
      } else if (data.success && data.mindmap) {
        // Direct response (for file/YouTube uploads)
        console.log('📋 Mindmap ID:', data.mindmap_id);
        console.log('🔗 Share ID:', data.share_id);
        
        setProgress(100);
        onMindMapGenerated(data.mindmap, data.mindmap_id, data.share_id, selectedVariation);
        
        toast({
          title: "Success!",
          description: "Mind map generated successfully.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate mind map');
      }
      
    } catch (error: any) {
      console.error('Error generating mind map:', error);
      
      let errorMessage = "Failed to generate mind map. ";
      
      if (error.message === 'Authentication required') {
        errorMessage = "Please login to generate mind maps.";
      } else if (error.message === 'Failed to fetch') {
        errorMessage = "Could not connect to the server. Please check if the backend server is running.";
      } else if (error.message.includes('HTTP error')) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes('404')) {
        errorMessage = "Service not available. Please try again later.";
      } else if (error.message.includes('403')) {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (error.message.includes('500')) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage += error.message || "Please try again later.";
      }
      
      toast({
        title: "Error generating mind map",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStatusMessage('');
    }
  };

  const hasContent = () => {
    switch (activeTab) {
      case 'file': return uploadedFile !== null;
      case 'youtube': {
        const validation = validateYoutubeUrl(youtubeUrl);
        return validation.isValid && !youtubeError;
      }
      case 'video': return uploadedVideo !== null;
      case 'prompt': return promptText.trim().length > 0;
      case 'text': return textInput.trim().length > 0;
      case 'website': return websiteUrl.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="prompt" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 gap-1 p-1 bg-background/50 border-2 rounded-full w-full max-w-3xl mx-auto mb-6 h-auto">
          <TabsTrigger value="prompt" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>Topic</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-1" />
            <span>Text</span>
          </TabsTrigger>
          <TabsTrigger value="file" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Upload className="h-4 w-4 mr-1" />
            <span>File</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ExternalLink className="h-4 w-4 mr-1" />
            <span>Video</span>
          </TabsTrigger>
          <TabsTrigger value="website" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link className="h-4 w-4 mr-1" />
            <span>Web URL</span>
          </TabsTrigger>
          <TabsTrigger value="youtube" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Youtube className="h-4 w-4 mr-1" />
            <span>YouTube</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="min-h-[300px]">
          <TabsContent value="file" className="transition-opacity duration-300">
            <FileUploadTab uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} isGenerating={isProcessing} />
          </TabsContent>
          
          <TabsContent value="youtube" className="transition-opacity duration-300">
            <YouTubeTab 
              youtubeUrl={youtubeUrl} 
              setYoutubeUrl={setYoutubeUrl}
              youtubeError={youtubeError}
              isProcessing={isProcessing}
              onUrlChange={(url) => {
                if (!url.trim()) {
                  setYoutubeError('');
                  return;
                }
                const validation = validateYoutubeUrl(url);
                if (!validation.isValid) {
                  setYoutubeError(validation.error);
                } else {
                  setYoutubeError('');
                }
              }}
            />
          </TabsContent>
          <TabsContent value="text" className="transition-opacity duration-300" forceMount={activeTab === 'text' ? true : undefined}>
            <div className="space-y-4">
              <textarea
                placeholder="Paste your text content here to generate a mind map..."
                className="min-h-[320px] w-full p-4 border-2 border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </TabsContent>          
          <TabsContent value="video" className="transition-opacity duration-300">
            <VideoUploadTab uploadedVideo={uploadedVideo} setUploadedVideo={setUploadedVideo} />
          </TabsContent>
          
          <TabsContent value="website" className="transition-opacity duration-300">
            <div className="space-y-4">
              <WebsiteUrlInput
                value={websiteUrl}
                onChange={setWebsiteUrl}
                disabled={isProcessing}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="prompt" className="transition-opacity duration-300" forceMount={activeTab === 'prompt' ? true : undefined}>
            <div className="space-y-4">
              <textarea
                placeholder="Enter a topic or description for the mind map (e.g., 'Explain photosynthesis', 'Java multithreading concepts', etc.)"
                className="min-h-[240px] w-full p-4 border-2 border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Content Length and Language */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Content Length</label>
          <Select value={contentLength} onValueChange={setContentLength} disabled={isProcessing}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select content length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Language</label>
          <LanguageSelector
            value={language}
            onValueChange={setLanguage}
            disabled={isProcessing}
            label=""
            triggerClassName="rounded-xl"
          />
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          size="lg"
          onClick={handleGenerateMindMap}
          disabled={isProcessing || !hasContent()}
          className="min-w-[200px] h-12 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating
            </>
          ) : (
            <>
              <Network className="mr-2 h-5 w-5" />
              Generate MindMap
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
