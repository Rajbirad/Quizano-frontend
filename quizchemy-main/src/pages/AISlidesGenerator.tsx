import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { trackRecentTool } from '@/utils/recentTools';
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
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Loader2,
  AlertCircle,
  X,
  Zap,
  Globe,
  Youtube,
  Link
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';
import { CreditsInfo } from '@/utils/credits';
import '@/components/ui/ShinyText.css';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { CreditsButton } from '@/components/CreditsButton';

export const AISlidesGenerator: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits: creditsData, loading: isLoadingCredits } = useCredits();
  
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [numSlides, setNumSlides] = useState('7');
  const [language, setLanguage] = useState('english');
  const [generating, setGenerating] = useState(false);
  const [displayError, setDisplayError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [credits, setCredits] = useState<CreditsInfo | null>(null);

  // Update credits display when context data changes
  useEffect(() => {
    if (creditsData?.ai_slides) {
      const aiSlidesData = creditsData.ai_slides;
      const creditsInfo: CreditsInfo = {
        cost: 20,
        balance: aiSlidesData.balance ?? 0,
        unlimited: aiSlidesData.unlimited === true,
        transaction_id: undefined,
      };
      setCredits(creditsInfo);
    }
  }, [creditsData]);

  const validateInput = () => {
     if (activeTab === 'prompt' && !promptInput.trim()) {
      setDisplayError('Please enter a topic to generate slides');
      setShowNotification(true);
      return false;
    }
    if (activeTab === 'text' && !textInput.trim()) {
      setDisplayError('Please enter text to generate slides');
      setShowNotification(true);
      return false;
    }
    if (activeTab === 'upload' && !uploadedFile) {
      setDisplayError('Please upload a file to generate slides');
      setShowNotification(true);
      return false;
    }
    if (activeTab === 'website' && !websiteUrl.trim()) {
      setDisplayError('Please enter a website URL');
      setShowNotification(true);
      return false;
    }
    if (activeTab === 'youtube' && !youtubeUrl.trim()) {
      setDisplayError('Please enter a YouTube URL');
      setShowNotification(true);
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validateInput()) return;

    setGenerating(true);
    setDisplayError('');
    setShowNotification(false);
    try {
      // All tabs go through the same flow: outline → customize → generate
      let presentationData = {
        inputType: activeTab as 'text' | 'upload' | 'prompt' | 'website' | 'youtube',
        content: activeTab === 'text' ? textInput : (activeTab === 'prompt' ? promptInput : ''),
        file: activeTab === 'upload' ? uploadedFile : undefined,
        numSlides: parseInt(numSlides),
        language: language,
      };
      
      // Store data in sessionStorage for the customize page
      const slideGeneratorData = {
        content: activeTab === 'text' ? textInput : (activeTab === 'prompt' ? promptInput : (activeTab === 'upload' && uploadedFile ? uploadedFile.name : '')),
        slideCount: parseInt(numSlides),
        language: language,
        inputType: activeTab,
        file: uploadedFile
      };
      sessionStorage.setItem('slideGeneratorData', JSON.stringify(slideGeneratorData));
      
      // Store the file separately if it exists
      if (uploadedFile && activeTab === 'upload') {
        const reader = new FileReader();
        reader.onload = (e) => {
          sessionStorage.setItem('uploadedFileData', e.target?.result as string);
          sessionStorage.setItem('uploadedFileName', uploadedFile.name);
          trackRecentTool('/app/ai-ppt');
          navigate('/app/ai-ppt-settings', {
            state: { presentationData }
          });
        };
        reader.readAsDataURL(uploadedFile);
      } else {
        trackRecentTool('/app/ai-ppt');
        navigate('/app/ai-ppt-settings', {
          state: { presentationData }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to proceed';
      setDisplayError(errorMessage);
      setShowNotification(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const allowedExtensions = ['.pdf', '.txt', '.docx', '.doc'];
    
    if (!validTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setDisplayError('Please upload a PDF, TXT, DOC, or DOCX file');
      setShowNotification(true);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setDisplayError('File size must be less than 10MB');
      setShowNotification(true);
      return;
    }
    
    setUploadedFile(file);
    setDisplayError('');
    setShowNotification(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="px-6 py-4">
      
      {/* Error Notification */}
      {showNotification && displayError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{displayError}</p>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between w-full mb-10">
        <div className="flex-1"></div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 shiny-gradient">
              Create AI Presentation
            </span>
          </h1>
          <Sparkles className="h-7 w-7 text-primary animate-pulse-gentle" />
        </div>
        <div className="flex-1 flex justify-end">
          <CreditsButton balance={credits?.balance} />
        </div>
      </div>
      <p className="text-base text-muted-foreground text-center max-w-3xl mx-auto mb-6">
        Transform your content into beautiful, professional presentations in seconds. Upload a file, paste text, or describe what you want.
      </p>

      <div className="container max-w-4xl mx-auto">

      <div className="space-y-2">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 gap-1 p-1 bg-background/50 border-2 rounded-full w-full max-w-3xl mx-auto mb-6 h-auto">
              <TabsTrigger value="prompt" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sparkles className="h-4 w-4 mr-1" />
                <span>Topic</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 mr-1" />
                <span>Text</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="h-4 w-4 mr-1" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="website" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Globe className="h-4 w-4 mr-1" />
                <span>Website</span>
              </TabsTrigger>
              <TabsTrigger value="youtube" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Youtube className="h-4 w-4 mr-1" />
                <span>YouTube</span>
              </TabsTrigger>
            </TabsList>

          {/* Tab Content Container - Fixed min height prevents layout shift */}
          <div className="min-h-[280px]">
            {/* Text Tab */}
            <TabsContent value="text" className="space-y-0">
              <div className="space-y-1 h-full flex flex-col">
                <Label htmlFor="text-input" className="text-sm font-medium">
                  Enter your text content
                </Label>
                <Textarea
                  id="text-input"
                  placeholder="Paste the text or content you want to turn into a presentation. Include key points, examples, or detailed information..."
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    setDisplayError('');
                    setShowNotification(false);
                  }}
                  className="h-[240px] border-2 border-input focus-visible:ring-primary resize-none rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: The more detailed your content, the better your presentation will be.
                </p>
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-0">
              <div className="space-y-4 h-[240px] flex items-center justify-center">
                {!uploadedFile ? (
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer w-full h-full flex items-center justify-center ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-input hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Upload className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-muted-foreground">
                          Drag your file here, or <span className="text-primary underline">click here to upload</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports: PDF, DOC, DOCX, TXT files
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-md">
                          <p className="font-medium">File Limits:</p>
                          <p>• Max file size: 10MB</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div 
                    className={`border-2 border-dashed rounded-lg text-center transition-colors w-full h-full flex items-center justify-center border-input bg-muted/20`}
                  >
                    <div className="flex items-center justify-between w-full max-w-2xl px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-10 w-10 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground text-base">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {uploadedFile.size > 1024 * 1024 
                              ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`
                              : `${Math.round(uploadedFile.size / 1024)} KB`
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        disabled={generating}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        title="Remove file"
                      >
                        <X className="h-7 w-7" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

          {/* Topic Tab */}
          <TabsContent value="prompt" className="space-y-0">
            <div className="space-y-1 h-full flex flex-col">
              <Label htmlFor="prompt-input" className="text-sm font-medium">
                Describe your presentation topic
              </Label>
              <Textarea
                id="prompt-input"
                placeholder="Describe the presentation you want to create. For example: 'Create a presentation about Java multithreading with examples, diagrams, and best practices for beginners'"
                value={promptInput}
                onChange={(e) => {
                  setPromptInput(e.target.value);
                  setDisplayError('');
                  setShowNotification(false);
                }}
                className="h-[240px] border-2 border-input focus-visible:ring-primary resize-none rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Be specific about the topic, audience level, and what you want to include.
              </p>
            </div>
          </TabsContent>

          {/* Website Tab */}
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
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value);
                    setDisplayError('');
                    setShowNotification(false);
                  }}
                  className="h-12 pl-12 border-2 border-input focus-visible:ring-primary rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter any website URL and we'll extract the content to create your presentation.
              </p>
            </div>
          </TabsContent>

          {/* YouTube Tab */}
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
                    setDisplayError('');
                    setShowNotification(false);
                  }}
                  className="h-12 pl-12 border-2 border-input focus-visible:ring-primary rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a YouTube video URL and we'll use the transcript to create your presentation.
              </p>
            </div>
          </TabsContent>
          </div>
        </Tabs>

        {/* Number of Slides and Language Selection */}
        <div className="pb-4">
          <div className="grid grid-cols-2 gap-3 items-end">
            {/* Number of Slides */}
            <div className="space-y-1.5">
              <Label htmlFor="num-slides" className="text-sm font-medium">
                Number of Slides
              </Label>
              <Select value={numSlides} onValueChange={setNumSlides}>
                <SelectTrigger id="num-slides" className="w-full rounded-xl">
                  <SelectValue placeholder="Select slides" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 slides</SelectItem>
                  <SelectItem value="7">7 slides <span className="text-xs text-muted-foreground ml-1">(Subscribe)</span></SelectItem>
                  <SelectItem value="10">10 slides <span className="text-xs text-muted-foreground ml-1">(Subscribe)</span></SelectItem>
                  <SelectItem value="15">15 slides <span className="text-xs text-muted-foreground ml-1">(Subscribe)</span></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <LanguageSelector
              value={language}
              onValueChange={setLanguage}
              label="Language"
              useLowercase={true}
              className="space-y-1.5"
              triggerClassName="rounded-xl"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4">
          <Button
            onClick={handleContinue}
            disabled={generating || (activeTab === 'text' && !textInput.trim()) || (activeTab === 'prompt' && !promptInput.trim()) || (activeTab === 'upload' && !uploadedFile)}
            className="w-full bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:opacity-90 text-white font-semibold py-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-6 mr-2" />
                Continue
              </>
            )}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AISlidesGenerator;
