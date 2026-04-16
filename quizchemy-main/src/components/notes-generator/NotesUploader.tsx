import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Youtube, Upload, ExternalLink, Sparkles } from 'lucide-react';
import { RegenerateQuizToggle } from '@/components/ui/RegenerateQuizToggle';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncNotesGeneration } from '@/hooks/use-async-notes-generation';
import { useMediaUpload } from '@/utils/media-utils';
import { TextTab } from './tabs/TextTab';
import { FileUploadTab } from './tabs/FileUploadTab';
import { YouTubeTab } from './tabs/YouTubeTab';
import { VideoUploadTab } from './tabs/VideoUploadTab';

interface NotesUploaderProps {
  onNotesGenerated: (notes: any) => void;
}

const STORAGE_KEY = 'processedNotesSignatures';

const getContentSignature = (tab: string, value: string) =>
  `notes_${tab}_${value.trim().slice(0, 100)}`;

const wasAlreadyGenerated = (sig: string): boolean => {
  try {
    const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return stored.includes(sig);
  } catch { return false; }
};

const markAsGenerated = (sig: string) => {
  try {
    const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!stored.includes(sig)) {
      stored.push(sig);
      if (stored.length > 50) stored.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  } catch {}
};

export const NotesUploader: React.FC<NotesUploaderProps> = ({ onNotesGenerated }) => {
  const { toast } = useToast();
  const { validateYoutubeUrl } = useMediaUpload();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [textValidationError, setTextValidationError] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [forceNew, setForceNew] = useState(false);
  
  const {
    generateNotesFromFile,
    generateNotesFromText,
    generateNotesFromYoutube,
    generateNotesFromVideo,
    isProcessing,
    progress,
    error
  } = useAsyncNotesGeneration();

  const getSignature = () => {
    switch (activeTab) {
      case 'text': return getContentSignature('text', textInput);
      case 'file': return getContentSignature('file', uploadedFile?.name || '');
      case 'youtube': return getContentSignature('youtube', youtubeUrl);
      case 'video': return getContentSignature('video', uploadedVideo?.name || '');
      default: return '';
    }
  };

  const runGeneration = async (forceNew = false) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please log in to generate notes.", variant: "destructive" });
      return;
    }

    try {
      let response;

      switch (activeTab) {
        case 'text':
          if (textValidationError || !textInput.trim()) {
            toast({ title: "Invalid text input", description: textValidationError || "Please enter some text.", variant: "destructive" });
            return;
          }
          response = await generateNotesFromText(textInput, forceNew);
          break;

        case 'file':
          if (!uploadedFile) {
            toast({ title: "No file uploaded", description: "Please upload a file.", variant: "destructive" });
            return;
          }
          response = await generateNotesFromFile(uploadedFile, forceNew);
          break;

        case 'youtube': {
          const validation = validateYoutubeUrl(youtubeUrl);
          if (!validation.isValid) { setYoutubeError(validation.error); return; }
          response = await generateNotesFromYoutube(youtubeUrl, forceNew);
          break;
        }

        case 'video':
          if (!uploadedVideo) {
            toast({ title: "No video uploaded", description: "Please upload a video.", variant: "destructive" });
            return;
          }
          response = await generateNotesFromVideo(uploadedVideo, forceNew);
          break;

        default:
          throw new Error('Invalid tab selected');
      }

      if (response) {
        markAsGenerated(getSignature());
        onNotesGenerated(response);
      }
    } catch (error: any) {
      console.error('Error generating notes:', error);
      let errorMessage = "Failed to generate notes. ";
      if (error.message === 'Authentication required') errorMessage = "Please login to generate notes.";
      else if (error.message === 'Failed to fetch') errorMessage = "Could not connect to the server.";
      else if (error.message.includes('HTTP error')) errorMessage = "Server error. Please try again later.";
      else errorMessage += error.message || "Please try again later.";
      toast({ title: "Error generating notes", description: errorMessage, variant: "destructive" });
    }
  };

  const hasContent = () => {
    switch (activeTab) {
      case 'text': return textInput.trim() !== '' && !textValidationError;
      case 'file': return uploadedFile !== null;
      case 'youtube': {
        const validation = validateYoutubeUrl(youtubeUrl);
        return validation.isValid && !youtubeError;
      }
      case 'video': return uploadedVideo !== null;
      default: return false;
    }
  };

  const alreadyGenerated = hasContent() && wasAlreadyGenerated(getSignature());

  const handleGenerateClick = () => {
    void runGeneration(forceNew);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" value={activeTab} onValueChange={(tab) => { setActiveTab(tab); setForceNew(false); }} className="w-full">
        {/* Hide tabs when processing */}
        {!isProcessing && (
          <TabsList className="grid grid-cols-4 gap-1 p-1 bg-background/50 border-2 rounded-full w-full max-w-xl mx-auto mb-6 h-auto">
            <TabsTrigger value="text" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-1" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Upload className="h-4 w-4 mr-1" />
              <span>File</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Youtube className="h-4 w-4 mr-1" />
              <span>YouTube</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ExternalLink className="h-4 w-4 mr-1" />
              <span>Video</span>
            </TabsTrigger>
          </TabsList>
        )}
        
        <div className="min-h-[300px]">
          <TabsContent value="text" className="transition-opacity duration-300">
            <TextTab 
              textInput={textInput} 
              setTextInput={(val) => { setTextInput(val); setForceNew(false); }} 
              validationError={textValidationError}
              setValidationError={setTextValidationError}
            />
          </TabsContent>
          
          <TabsContent value="file" className="transition-opacity duration-300">
            <FileUploadTab uploadedFile={uploadedFile} setUploadedFile={(f) => { setUploadedFile(f); setForceNew(false); }} isGenerating={isProcessing} />
          </TabsContent>
          
          <TabsContent value="youtube" className="transition-opacity duration-300">
            <YouTubeTab 
              youtubeUrl={youtubeUrl} 
              setYoutubeUrl={(url) => { setYoutubeUrl(url); setForceNew(false); }}
              youtubeError={youtubeError}
              isProcessing={isProcessing}
              onUrlChange={(url) => {
                if (!url.trim()) { setYoutubeError(''); return; }
                const validation = validateYoutubeUrl(url);
                setYoutubeError(validation.error);
              }}
            />
          </TabsContent>
          
          <TabsContent value="video" className="transition-opacity duration-300">
            <VideoUploadTab uploadedVideo={uploadedVideo} setUploadedVideo={(v) => { setUploadedVideo(v); setForceNew(false); }} />
          </TabsContent>
        </div>
      </Tabs>

      <RegenerateQuizToggle
        show={alreadyGenerated && !isProcessing}
        checked={forceNew}
        onCheckedChange={setForceNew}
        label="Regenerate Notes"
        description="Force generate new notes even if this content was previously processed"
      />

      <div className="flex justify-center">
        <Button 
          onClick={handleGenerateClick}
          disabled={isProcessing || !hasContent()}
          className={`rounded-full px-8 py-3 text-lg ${hasContent() ? 'gradient-button' : 'opacity-50 cursor-not-allowed'}`}
          size="lg"
        >
          {isProcessing ? (
            <Sparkles className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5 mr-2" />
          )}
          {isProcessing ? (progress || "Generating Notes...") : "Generate Notes"}
        </Button>
      </div>
    </div>
  );
};
