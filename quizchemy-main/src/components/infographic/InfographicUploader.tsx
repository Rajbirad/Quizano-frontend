import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Youtube, Upload, ExternalLink, ImageIcon, MessageSquare, FileText, Globe, Link, RefreshCw } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaUpload } from '@/utils/media-utils';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';
import { streamTaskStatus } from '@/lib/task-stream';
import { FileUploadTab } from '../notes-generator/tabs/FileUploadTab';
import { VideoUploadTab } from '../notes-generator/tabs/VideoUploadTab';

interface InfographicUploaderProps {
  onInfographicGenerated: (infographic: any, infographicId?: string, shareId?: string) => void;
}

export const InfographicUploader: React.FC<InfographicUploaderProps> = ({ onInfographicGenerated }) => {
  const { toast } = useToast();
  const { validateYoutubeUrl } = useMediaUpload();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('prompt');
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
  const [complexityLevel, setComplexityLevel] = useState<'simple' | 'standard' | 'detailed' | 'comprehensive'>('standard');
  const [language, setLanguage] = useState('English');
  const [forceNewInfographic, setForceNewInfographic] = useState(false);
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);

  // Helper function to create content signature for tracking processed content
  const createContentSignature = (content: any, params: any) => {
    if (activeTab === 'prompt') {
      return `infographic_prompt_${content}_${JSON.stringify(params)}`;
    } else if (activeTab === 'text') {
      return `infographic_text_${content}_${JSON.stringify(params)}`;
    } else if (activeTab === 'url') {
      return `infographic_url_${content}_${JSON.stringify(params)}`;
    } else if (activeTab === 'file' && content) {
      return `infographic_file_${content.name}_${content.size}_${content.lastModified}_${JSON.stringify(params)}`;
    } else if (activeTab === 'youtube') {
      return `infographic_youtube_${content}_${JSON.stringify(params)}`;
    } else if (activeTab === 'video' && content) {
      return `infographic_video_${content.name}_${content.size}_${content.lastModified}_${JSON.stringify(params)}`;
    }
    return '';
  };

  // Helper function to check if content with same params was previously processed
  const checkIfPreviouslyProcessed = (content: any) => {
    const currentParams = {
      complexityLevel,
      language
    };
    
    const signature = createContentSignature(content, currentParams);
    if (!signature) return false;
    
    const processedInfographics = JSON.parse(localStorage.getItem('processedInfographics') || '[]');
    return processedInfographics.includes(signature);
  };

  // Check if current content with current params was previously processed
  useEffect(() => {
    let content = null;
    let hasContent = false;

    if (activeTab === 'prompt' && promptText.trim()) {
      content = promptText.trim();
      hasContent = true;
    } else if (activeTab === 'text' && textInput.trim()) {
      content = textInput.trim();
      hasContent = true;
    } else if (activeTab === 'url' && websiteUrl.trim()) {
      content = websiteUrl.trim();
      hasContent = true;
    } else if (activeTab === 'file' && uploadedFile) {
      content = uploadedFile;
      hasContent = true;
    } else if (activeTab === 'youtube' && youtubeUrl.trim()) {
      content = youtubeUrl.trim();
      hasContent = true;
    } else if (activeTab === 'video' && uploadedVideo) {
      content = uploadedVideo;
      hasContent = true;
    }

    if (hasContent && content) {
      const wasProcessed = checkIfPreviouslyProcessed(content);
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewInfographic(false);
      }
    } else {
      setShowRegenerateOption(false);
      setForceNewInfographic(false);
    }
  }, [activeTab, promptText, textInput, websiteUrl, uploadedFile, youtubeUrl, uploadedVideo, complexityLevel, language]);

  const pollTaskStatus = async (taskId: string, _contentSource: string) => {
    const event = await streamTaskStatus(taskId, {
      onProgress: (e) => setStatusMessage(e.message || 'Processing...'),
    }) as any;
    const result = event.result || event.meta || event;
    if (!result?.image_url) throw new Error('No image URL in result');
    console.log('✅ Task completed:', result);
    setProgress(100);
    onInfographicGenerated(result, result.infographic_id, result.share_id);
    const shouldShowMessage = result.message &&
      !result.message.toLowerCase().includes('cache') &&
      !result.message.toLowerCase().includes('idempotent');
    if (shouldShowMessage) {
      toast({ title: 'Success!', description: result.message });
    }
  };

  const handleGenerateInfographic = async () => {
    if (isProcessing) {
      console.log('Already processing, ignoring duplicate call');
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate infographics.",
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
              description: "Please upload a file to generate infographic from.",
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
              description: "Please upload a video to generate infographic from.",
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
              description: "Please enter a topic to generate infographic from.",
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
              description: "Please enter text to generate infographic from.",
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
              description: "Please enter a website URL to generate infographic from.",
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
      
      formData.append('complexity_level', complexityLevel);
      formData.append('language', language);
      formData.append('force_new', forceNewInfographic.toString());
      
      setProgress(30);
      
      console.log('Sending infographic request:', {
        activeTab,
        complexity_level: complexityLevel,
        language: language,
        hasFile: formData.has('file'),
        hasYoutubeUrl: formData.has('youtube_url'),
        hasVideoFile: formData.has('video_file')
      });
      
      const response = await makeAuthenticatedFormRequest('/api/infographic', formData);
      
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
      
      console.log('🔍 Infographic API Response:', data);
      
      if (data.status === 'processing' && data.task_id) {
        console.log('📡 Task ID for polling:', data.task_id);
        setStatusMessage(data.message || 'Processing video...');
        setProgress(40);
        
        await pollTaskStatus(data.task_id, data.content_source);
      } else if (data.success && data.image_url) {
        console.log('📋 Infographic ID:', data.infographic_id);
        console.log('🔗 Share ID:', data.share_id);
        console.log('🖼️ Image URL:', data.image_url);
        
        setProgress(100);
        onInfographicGenerated(data, data.infographic_id, data.share_id);
        
        // Filter out cache-related messages from being displayed to users
        const shouldShowMessage = data.message && 
          !data.message.toLowerCase().includes('cache') && 
          !data.message.toLowerCase().includes('idempotent');
        
        if (shouldShowMessage) {
          toast({
            title: "Success!",
            description: data.message,
          });
        }
      } else {
        throw new Error(data.error || 'Failed to generate infographic');
      }
      
    } catch (error: any) {
      console.error('Error generating infographic:', error);
      
      let errorMessage = "Failed to generate infographic. ";
      
      if (error.message === 'Authentication required') {
        errorMessage = "Please login to generate infographics.";
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
        title: "Error generating infographic",
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
        <div>
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
              <Globe className="h-4 w-4 mr-1" />
              <span>Web URL</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Youtube className="h-4 w-4 mr-1" />
              <span>YouTube</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="min-h-[280px]">
          <TabsContent value="prompt" className="space-y-0">
            <div className="space-y-1 h-full flex flex-col">
              <Label htmlFor="prompt-input" className="text-sm font-medium">
                Describe your infographic topic
              </Label>
              <Textarea
                id="prompt-input"
                placeholder="Describe the infographic you want to create. For example: 'Create an infographic about renewable energy sources with statistics, comparisons, and visual icons for solar, wind, and hydro power'"
                className="h-[240px] border-2 border-input focus-visible:ring-primary resize-none rounded-3xl px-5 py-4"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Be specific about the topic, data points, and visual style you want to include.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-0">
            <div className="space-y-1 h-full flex flex-col">
              <Label htmlFor="text-input" className="text-sm font-medium">
                Enter your text content
              </Label>
              <Textarea
                id="text-input"
                placeholder="Paste the text or content you want to turn into an infographic. Include key points, statistics, data, or detailed information..."
                className="h-[240px] border-2 border-input focus-visible:ring-primary resize-none rounded-3xl px-5 py-4"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Tip: The more detailed your content, the better your infographic will be.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-0">
            <FileUploadTab uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} isGenerating={isProcessing} />
          </TabsContent>
          
          <TabsContent value="video" className="space-y-0">
            <VideoUploadTab uploadedVideo={uploadedVideo} setUploadedVideo={setUploadedVideo} />
          </TabsContent>
          
          <TabsContent value="website" className="space-y-0">
            <div className="space-y-1 h-full flex flex-col">
              <Label htmlFor="website-url" className="text-sm font-medium">
                Enter Website URL
              </Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="website-url"
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isProcessing}
                  className="h-12 pl-12 border-2 border-input focus-visible:ring-primary rounded-2xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter any website URL and we'll extract the content to create your infographic.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="youtube" className="space-y-0">
            <div className="space-y-1 h-full flex flex-col">
              <Label htmlFor="youtube-url" className="text-sm font-medium">
                Enter YouTube URL
              </Label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a2.9 2.9 0 0 0-2.04-2.054C19.644 3.6 12 3.6 12 3.6s-7.644 0-9.458.532A2.9 2.9 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.9 2.9 0 0 0 2.04 2.054C4.356 20.4 12 20.4 12 20.4s7.644 0 9.458-.532a2.9 2.9 0 0 0 2.04-2.054C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.75 12l-6 3.568z"/>
                </svg>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    if (!e.target.value.trim()) {
                      setYoutubeError('');
                      return;
                    }
                    const validation = validateYoutubeUrl(e.target.value);
                    if (!validation.isValid) {
                      setYoutubeError(validation.error);
                    } else {
                      setYoutubeError('');
                    }
                  }}
                  disabled={isProcessing}
                  className={`h-12 pl-12 border-2 focus-visible:ring-primary rounded-2xl ${
                    youtubeError ? 'border-red-500' : 'border-input'
                  }`}
                />
              </div>
              {youtubeError ? (
                <p className="text-sm text-red-600">{youtubeError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter a YouTube video URL and we'll use the transcript to create your infographic.
                </p>
              )}
            </div>
          </TabsContent>
          
        </div>
      </Tabs>

      {/* Complexity Level and Language Selectors */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <Select value={complexityLevel} onValueChange={(value: any) => setComplexityLevel(value)} disabled={isProcessing}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Select complexity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Choose the level of detail for your infographic
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <LanguageSelector
            value={language}
            onValueChange={setLanguage}
            disabled={isProcessing}
            label=""
            triggerClassName="rounded-xl"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Select the language for your infographic
          </p>
        </div>
      </div>

      {/* Force New/Same Infographic Toggle - Only show if previously processed */}
      {showRegenerateOption && (
        <div className="px-4 md:px-6 mt-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground mb-1">Regenerate Preference</h4>
              <p className="text-xs text-muted-foreground">
                Choose whether to use cached results or generate a fresh infographic
              </p>
            </div>
            
            {/* Custom Styled Switch */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium transition-colors duration-200 ${
                !forceNewInfographic ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                Same
              </span>
              <button
                onClick={() => setForceNewInfographic(!forceNewInfographic)}
                disabled={isProcessing}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  forceNewInfographic 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25' 
                    : 'bg-gradient-to-r from-gray-200 to-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                    forceNewInfographic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                >
                  <div className={`flex items-center justify-center h-full w-full ${
                    forceNewInfographic ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {forceNewInfographic ? (
                      <RefreshCw className="h-3 w-3" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    )}
                  </div>
                </span>
              </button>
              <span className={`text-xs font-medium transition-colors duration-200 ${
                forceNewInfographic ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                Different
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button 
          size="lg"
          onClick={handleGenerateInfographic}
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
              <ImageIcon className="mr-2 h-5 w-5" />
              Generate Infographic
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
