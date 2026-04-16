import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Youtube, Upload, Globe, Sparkles, Loader2, MessageSquare, ExternalLink, Link, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';
import { VoiceSelector, getVoiceDisplayName } from './VoiceSelector';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';
import { streamTaskStatus } from '@/lib/task-stream';
import { validateCreditsInResponse, extractCredits, formatCreditsDisplay } from '@/utils/credits';
import { checkIfPreviouslyProcessed, markAsProcessed } from '@/utils/quiz-processing';
import { useDragAndDrop } from '@/hooks/use-drag-and-drop';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface PodcastUploaderProps {
  onPodcastGenerated: (podcast: any) => void;
}

export const PodcastUploader: React.FC<PodcastUploaderProps> = ({ onPodcastGenerated }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [promptText, setPromptText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState('auto');
  const [contentType, setContentType] = useState('educational');
  const [duration, setDuration] = useState('0-5');
  const [numHosts, setNumHosts] = useState('2');
  const [host1Voice, setHost1Voice] = useState('chirp3-achird');
  const [host2Voice, setHost2Voice] = useState('chirp3-aoede');
  const [host3Voice, setHost3Voice] = useState('chirp3-charon');
  const [host4Voice, setHost4Voice] = useState('chirp3-kore');
  const [host1Info, setHost1Info] = useState({ name: '', title: '' });
  const [host2Info, setHost2Info] = useState({ name: '', title: '' });
  const [host3Info, setHost3Info] = useState({ name: '', title: '' });
  const [host4Info, setHost4Info] = useState({ name: '', title: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<any>(null);
  const [forceNew, setForceNew] = useState(false);
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);

  const PODCAST_STORAGE_KEY = 'processedPodcasts';

  // Upload a file to S3 via presigned URL and return the s3_key
  const uploadFileToS3 = async (file: File, purpose: string): Promise<string> => {
    // Phase 1: Get presigned URL
    setUploadProgress('Uploading file...');
    const presignFormData = new FormData();
    presignFormData.append('filename', file.name);
    presignFormData.append('content_type', file.type || 'application/octet-stream');
    presignFormData.append('file_size', file.size.toString());
    presignFormData.append('purpose', purpose);

    const presignResponse = await makeAuthenticatedFormRequest('/api/upload/presigned-url', presignFormData);
    if (!presignResponse.ok) {
      const errText = await presignResponse.text();
      throw new Error(errText || 'Failed to get upload URL');
    }
    const presignData = await presignResponse.json();

    // Phase 2: Upload directly to S3
    setUploadProgress('Uploading to storage...');
    const s3FormData = new FormData();
    Object.entries(presignData.fields as Record<string, string>).forEach(([key, value]) => {
      s3FormData.append(key, value);
    });
    s3FormData.append('file', file);

    const s3Response = await fetch(presignData.upload_url, {
      method: 'POST',
      body: s3FormData,
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Accept': '*/*' },
    });

    if (!s3Response.ok) {
      let msg = `Upload failed: ${s3Response.status}`;
      try { const t = await s3Response.text(); if (t) msg += ` - ${t}`; } catch {}
      throw new Error(msg);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setUploadProgress(null);
    return presignData.s3_key as string;
  };

  const getPodcastParams = () => ({
    language,
    contentType,
    duration,
    numHosts,
  });

  const getCurrentContent = (): string | File | null => {
    switch (activeTab) {
      case 'text': return textInput.trim() || null;
      case 'topic': return promptText.trim() || null;
      case 'file': return uploadedFile;
      case 'video': return uploadedVideo;
      case 'website': return websiteUrl.trim() || null;
      case 'youtube': return youtubeUrl.trim() || null;
      default: return null;
    }
  };

  // Check if current content+params combo was previously processed
  useEffect(() => {
    const content = getCurrentContent();
    if (!content) {
      setShowRegenerateOption(false);
      setForceNew(false);
      return;
    }
    const wasPreviouslyProcessed = checkIfPreviouslyProcessed(content, getPodcastParams(), PODCAST_STORAGE_KEY);
    setShowRegenerateOption(wasPreviouslyProcessed);
    if (!wasPreviouslyProcessed) {
      setForceNew(false);
    }
  }, [activeTab, textInput, promptText, uploadedFile, uploadedVideo, websiteUrl, youtubeUrl, language, contentType, duration, numHosts]);

  const { dragActive, dragProps } = useDragAndDrop({
    onDrop: (files) => {
      const file = files[0];
      const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF, TXT, or DOCX file.',
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
    },
    accept: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF, TXT, or DOCX file.',
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a video file (MP4, MOV, AVI, or WebM).',
          variant: 'destructive',
        });
        return;
      }
      setUploadedVideo(file);
      toast({
        title: 'Video uploaded',
        description: `${file.name} is ready to be converted.`,
      });
    }
  };

  // Polling helper for podcast status
  const streamPodcastStatus = async (taskId: string): Promise<any> => {
    console.log('🎙️ Starting podcast task stream for:', taskId);
    const event = await streamTaskStatus(taskId, {
      onProgress: (e) => {
        if (e.message) setUploadProgress(e.message);
      },
    });
    const podcastData = (event as any).podcast || (event as any).result?.podcast || event;
    if (!podcastData) throw new Error('No podcast data in completed result');
    return podcastData;
  };

  const handleGeneratePodcast = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to generate podcasts.',
        variant: 'destructive',
      });
      return;
    }

    // Validate input based on active tab
    if (activeTab === 'text' && !textInput.trim()) {
      toast({
        title: 'No content',
        description: 'Please enter some text to generate a podcast.',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'topic' && !promptText.trim()) {
      toast({
        title: 'No topic',
        description: 'Please enter a topic to generate a podcast.',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'file' && !uploadedFile) {
      toast({
        title: 'No file uploaded',
        description: 'Please upload a file to generate a podcast.',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'video' && !uploadedVideo) {
      toast({
        title: 'No video uploaded',
        description: 'Please upload a video file to generate a podcast.',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'website' && !websiteUrl.trim()) {
      toast({
        title: 'No URL provided',
        description: 'Please enter a website URL.',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'youtube' && !youtubeUrl.trim()) {
      toast({
        title: 'No URL provided',
        description: 'Please enter a YouTube URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare form data
      const formData = new FormData();
      // Add content based on active tab
      if (activeTab === 'text' && textInput.trim()) {
        formData.append('text', textInput.trim());
      } else if (activeTab === 'topic' && promptText.trim()) {
        formData.append('prompt', promptText.trim());
      } else if (activeTab === 'file' && uploadedFile) {
        const fileS3Key = await uploadFileToS3(uploadedFile, 'podcast-file');
        formData.append('file_s3_key', fileS3Key);
      } else if (activeTab === 'video' && uploadedVideo) {
        const videoS3Key = await uploadFileToS3(uploadedVideo, 'podcast-video');
        formData.append('video_file_s3_key', videoS3Key);
      } else if (activeTab === 'website' && websiteUrl.trim()) {
        formData.append('url', websiteUrl.trim());
      } else if (activeTab === 'youtube' && youtubeUrl.trim()) {
        formData.append('url', youtubeUrl.trim());
      }
      formData.append('language', language);
      formData.append('content_type', contentType);
      formData.append('duration_minutes', duration);
      formData.append('num_hosts', numHosts);
      formData.append('generate_audio', 'true');
      formData.append('generate_image', 'true');
      // Create voice_assignments keyed by the user-edited name (or default role name)
      const defaultRoles = ['Host', 'Expert', 'Analyst', 'Guest'];
      const hostVoices = [host1Voice, host2Voice, host3Voice, host4Voice];
      const hostInfoList = [host1Info, host2Info, host3Info, host4Info];
      const voiceAssignments: { [key: string]: string } = {};
      for (let i = 0; i < parseInt(numHosts); i++) {
        const voice = hostVoices[i];
        if (!voice) continue;
        const name = hostInfoList[i].name.trim() || defaultRoles[i];
        voiceAssignments[name] = getVoiceDisplayName(voice);
      }
      formData.append('voice_assignments', JSON.stringify(voiceAssignments));
      // Pass host names/titles if any were edited
      const hostInfos = hostInfoList.slice(0, parseInt(numHosts));
      const namedHosts = hostInfos.filter(h => h.name.trim());
      if (namedHosts.length > 0) {
        formData.append('host_names', JSON.stringify(hostInfos.map((h, i) => ({ name: h.name.trim() || defaultRoles[i], title: h.title.trim() }))));
      }
      if (forceNew) {
        formData.append('force_new_podcast', 'true');
      }
      // Call API using authenticated form request
      const response = await makeAuthenticatedFormRequest(
        '/api/podcast/generate',
        formData,
        'POST'
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate podcast');
      }
      const apiData = await response.json();
      // ✅ Check for credits information in response
      const creditsError = validateCreditsInResponse(apiData);
      if (creditsError) {
        console.warn('⚠️ Credits issue detected:', creditsError);
        toast({
          title: 'Insufficient Credits',
          description: creditsError,
          variant: 'destructive',
        });
        return;
      }
      // Store credits info if available
      const credits = extractCredits(apiData);
      if (credits) {
        setUserCredits(credits);
        console.log('💰 Credits updated:', formatCreditsDisplay(credits));
      }
      // If response contains task_id, poll for result
      if (apiData.task_id) {
        try {
          const podcastResult = await streamPodcastStatus(apiData.task_id);
          setUploadProgress(null);
          console.log('Passing podcast to result page:', podcastResult);
          toast({
            title: 'Podcast generated!',
            description: 'Your AI podcast has been created successfully.',
          });
          onPodcastGenerated(podcastResult);
          // Mark as processed after successful generation
          const content = getCurrentContent();
          if (content) markAsProcessed(content, getPodcastParams(), PODCAST_STORAGE_KEY);
        } catch (pollErr: any) {
          toast({
            title: 'Error generating podcast',
            description: pollErr.message || 'Please try again later.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Podcast generated!',
          description: 'Your AI podcast has been created successfully.',
        });
        // Extract nested podcast object if API returned a wrapped response
        onPodcastGenerated(apiData.podcast || apiData);
        // Mark as processed after successful generation
        const content = getCurrentContent();
        if (content) markAsProcessed(content, getPodcastParams(), PODCAST_STORAGE_KEY);
        // Reset force flag after use
        setForceNew(false);
      }
    } catch (error: any) {
      console.error('Error generating podcast:', error);
      if (error.message && error.message.includes('500')) {
        toast({
          title: 'Generation Failed',
          description: 'Unable to generate podcast. This might be due to insufficient credits or service issue. Please check your balance and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error generating podcast',
          description: error.message || 'Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const hasContent = () => {
    switch (activeTab) {
      case 'text': return textInput.trim() !== '';
      case 'file': return uploadedFile !== null;
      case 'website': return websiteUrl.trim() !== '';
      case 'youtube': return youtubeUrl.trim() !== '';
      default: return false;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 gap-1 p-1 bg-background/50 border-2 rounded-full w-full max-w-3xl mx-auto mb-6 h-auto">
          <TabsTrigger value="topic" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
            <span>Website</span>
          </TabsTrigger>
          <TabsTrigger value="youtube" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Youtube className="h-4 w-4 mr-1" />
            <span>YouTube</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="min-h-[300px] space-y-3">
          {/* Topic Tab */}
          <TabsContent value="topic" className="transition-opacity duration-300">
            <div className="space-y-2">
              <Textarea
                id="topic-input"
                placeholder="Enter a topic or description for the podcast (e.g., 'Explain photosynthesis', 'History of artificial intelligence')..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="min-h-[240px] resize-none rounded-2xl border-2"
              />
            </div>
          </TabsContent>
          
          {/* Text Tab */}
          <TabsContent value="text" className="transition-opacity duration-300">
            <div className="space-y-2">
              <Textarea
                id="text-input"
                placeholder="Paste or type the content you want to convert into a podcast..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[240px] resize-none rounded-2xl border-2"
              />
              <p className="text-xs text-muted-foreground">
                Enter the text content you want to turn into an AI podcast.
              </p>
            </div>
          </TabsContent>
          
          {/* File Upload Tab */}
          <TabsContent value="file" className="transition-opacity duration-300">
            <div className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-2xl p-6 min-h-[240px] flex items-center justify-center text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/40'
                }`}
                {...dragProps}
              >
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Upload className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-muted-foreground">
                      {uploadedFile ? (
                        <span className="text-primary">{uploadedFile.name}</span>
                      ) : (
                        <>
                          Drag your file here, or <span className="text-primary underline">click here to upload</span>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: PDF, TXT, DOCX
                    </p>
                    <p className="text-xs text-muted-foreground">Max 10MB per file</p>
                  </div>
                </label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Video Upload Tab */}
          <TabsContent value="video" className="transition-opacity duration-300">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-2xl p-6 min-h-[240px] flex items-center justify-center text-center transition-colors border-border hover:border-primary/40">
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="space-y-1">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-base font-medium">
                      {uploadedVideo ? (
                        <>
                          <span className="text-primary">✓</span> {uploadedVideo.name}
                        </>
                      ) : (
                        <>
                          Drop video file here or <span className="text-primary">browse</span>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Supports: MP4, MOV, AVI, WebM</p>
                    <p className="text-xs text-muted-foreground">Max 100MB per video</p>
                  </div>
                </label>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Website Tab */}
          <TabsContent value="website" className="transition-opacity duration-300">
            <div className="space-y-2">
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="website-url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full h-14 pl-12 rounded-2xl border-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the URL of a website or article to convert into a podcast.
              </p>
            </div>
          </TabsContent>
          
          {/* YouTube Tab */}
          <TabsContent value="youtube" className="transition-opacity duration-300">
            <div className="space-y-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a2.9 2.9 0 0 0-2.04-2.054C19.644 3.6 12 3.6 12 3.6s-7.644 0-9.458.532A2.9 2.9 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.9 2.9 0 0 0 2.04 2.054C4.356 20.4 12 20.4 12 20.4s7.644 0 9.458-.532a2.9 2.9 0 0 0 2.04-2.054C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.75 12l-6 3.568z"/>
                </svg>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full h-14 pl-12 rounded-2xl border-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a YouTube video URL to generate a podcast from its content.
              </p>
            </div>
          </TabsContent>

          {/* Options Section - Common for all tabs */}
          <div className="space-y-4 pt-2">
            {/* First Row: Content Type and Number of Hosts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger id="content-type" className="h-12 rounded-2xl">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="talk_show">Talk Show</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="debate">Debate</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-hosts">Number of Hosts</Label>
                <Select value={numHosts} onValueChange={setNumHosts}>
                  <SelectTrigger id="num-hosts" className="h-12 rounded-2xl">
                    <SelectValue placeholder="Select hosts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Host</SelectItem>
                    <SelectItem value="2">2 Hosts</SelectItem>
                    <SelectItem value="3">3 Hosts</SelectItem>
                    <SelectItem value="4">4 Hosts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row: Language and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <LanguageSelector
                value={language}
                onValueChange={setLanguage}
                label="Language"
                useLowercase={true}
                className="space-y-2"
                triggerClassName="rounded-2xl"
              />

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration" className="h-12 rounded-2xl">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-5">0–5 mins</SelectItem>
                    <SelectItem value="5-10">5–10 mins</SelectItem>
                    <SelectItem value="10-15">10–15 mins</SelectItem>
                    <SelectItem value="15-20">15–20 mins</SelectItem>
                    <SelectItem value="20-30">20–30 mins</SelectItem>
                    <SelectItem value="30+">30+ mins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Voice Selection */}
            {parseInt(numHosts) > 0 && (
              <div className="space-y-4">
                {/* Host 1 & 2: full width when 1 host, side by side when 2+ */}
                <div className={parseInt(numHosts) >= 2 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
                  <VoiceSelector
                    value={host1Voice}
                    onChange={setHost1Voice}
                    label={parseInt(numHosts) === 1 ? 'Select Voice' : 'Select Voice for Host 1'}
                    hostName={host1Info.name}
                    hostTitle={host1Info.title}
                    onHostInfoChange={(name, title) => setHost1Info({ name, title })}
                  />
                  {parseInt(numHosts) >= 2 && (
                    <VoiceSelector
                      value={host2Voice}
                      onChange={setHost2Voice}
                      label="Select Voice for Host 2"
                      hostName={host2Info.name}
                      hostTitle={host2Info.title}
                      onHostInfoChange={(name, title) => setHost2Info({ name, title })}
                    />
                  )}
                </div>

                {/* Host 3 & 4 side by side */}
                {parseInt(numHosts) >= 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <VoiceSelector
                      value={host3Voice}
                      onChange={setHost3Voice}
                      label="Select Voice for Host 3"
                      hostName={host3Info.name}
                      hostTitle={host3Info.title}
                      onHostInfoChange={(name, title) => setHost3Info({ name, title })}
                    />
                    {parseInt(numHosts) >= 4 && (
                      <VoiceSelector
                        value={host4Voice}
                        onChange={setHost4Voice}
                        label="Select Voice for Host 4"
                        hostName={host4Info.name}
                        hostTitle={host4Info.title}
                        onHostInfoChange={(name, title) => setHost4Info({ name, title })}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Tabs>

      {/* Generate Button */}
      <div className="space-y-3">
        <Button
          onClick={handleGeneratePodcast}
          disabled={!hasContent() || isGenerating}
          className="w-full bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:opacity-90 text-white font-semibold py-6 text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {uploadProgress || 'Generating Podcast...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Podcast
            </>
          )}
        </Button>

        {/* Force Regenerate Toggle — only shown when same content+params was previously processed */}
        {showRegenerateOption && (
          <div className="flex items-start gap-3 p-4 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Podcast already generated</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">This content with the same settings was previously processed. Enable to force a fresh generation.</p>
            </div>
            <Switch
              id="force-new"
              checked={forceNew}
              onCheckedChange={setForceNew}
              disabled={isGenerating}
            />
          </div>
        )}
      </div>
    </div>
  );
};
