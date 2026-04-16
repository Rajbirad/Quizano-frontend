import React, { useState, useEffect } from 'react';
import '@/components/ui/ShinyText.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { makeAuthenticatedJSONRequest, makeAuthenticatedFormRequest, API_URL } from '@/lib/api-utils';
import { useAsyncFlashcardGeneration } from '@/hooks/use-async-flashcard-generation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { FileText, FileUp, Text, Image, Video, Youtube, BookText, ArrowLeft, Sparkles, Loader2, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMediaGenerator } from '@/hooks/use-media-generator';
import { useFlashcardGenerator } from '@/hooks/use-flashcard-generator';
import { getYoutubeId } from '@/components/flashcard-generator/utils';
import { useToast } from '@/hooks/use-toast';
import { PopularUseCases } from '@/components/flashcard-generator/PopularUseCases';
import { ValidationMessage } from '@/components/ui/validation-message';
import { GeneratorControls } from '@/components/flashcard-generator/GeneratorControls';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { UpgradePopup } from '@/components/UpgradePopup';
import { useDragAndDrop } from '@/hooks/use-drag-and-drop';
import { FlashcardGenerationCompleteDialog } from '@/components/flashcard-generator/FlashcardGenerationCompleteDialog';
interface FlashcardGeneratorProps {
  isAiMode?: boolean;
}
const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  isAiMode = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  
  // Use async flashcard generation hook
  const { generateFlashcards, loading, progress, error, cancelGeneration, showUpgradePopup, closeUpgradePopup, upgradeMessage } = useAsyncFlashcardGeneration();
  
  // Use our custom hooks first so their values are available
  const {
    mediaType,
    mediaUrl,
    youtubeUrl,
    youtubeError,
    setYoutubeUrl,
    handleImageUpload,
    handleVideoUpload,
    handleYoutubeUrl,
    clearMedia
  } = useMediaGenerator();
  
  // Drag and drop handler for image files
  const handleImageDrop = (files: FileList) => {
    const file = files[0];
    if (file) {
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(syntheticEvent);
    }
  };
  
  const { dragActive: imageDragActive, dragProps: imageDragProps } = useDragAndDrop({
    onDrop: handleImageDrop,
    accept: ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.webp']
  });
  
  // Drag and drop handler for video files
  const handleVideoDrop = (files: FileList) => {
    const file = files[0];
    if (file) {
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleVideoUpload(syntheticEvent);
    }
  };
  
  const { dragActive: videoDragActive, dragProps: videoDragProps } = useDragAndDrop({
    onDrop: handleVideoDrop,
    accept: ['video/*', '.mp4', '.avi', '.mov', '.webm']
  });
  
  const {
    isFileProcessing,
    uploadedFile,
    setUploadedFile,
    handleFileUpload,
    fileValidationError,
    setFileValidationError
  } = useFlashcardGenerator();
  
  // Drag and drop handler for file uploads
  const handleFileDrop = (files: FileList) => {
    const file = files[0];
    if (file) {
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(syntheticEvent);
    }
  };
  
  const { dragActive: fileDragActive, dragProps: fileDragProps } = useDragAndDrop({
    onDrop: handleFileDrop,
    accept: ['.pdf', '.doc', '.docx', '.txt', '.md', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown']
  });

  const [inputText, setInputText] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [selectedTab, setSelectedTab] = useState('text');
  const [selectedDeck, setSelectedDeck] = useState('general');
  const [pageTitle, setPageTitle] = useState('Create Flashcards');
  const [validationMessage, setValidationMessage] = useState<{ type: 'error' | 'success' | null; message: string | null }>({
    type: null,
    message: null
  });

  // Flashcard generation settings
  const [cardCount, setCardCount] = useState('5');
  const [difficulty, setDifficulty] = useState('Standard');
  const [format, setFormat] = useState('Q&A');
  const [language, setLanguage] = useState('auto');
  const [frontTextLength, setFrontTextLength] = useState('long');
  const [backTextLength, setBackTextLength] = useState('medium');
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);
  const [forceNewFlashcards, setForceNewFlashcards] = useState(false);
  
  // State for the generation complete dialog
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  const [generatedFlashcardsData, setGeneratedFlashcardsData] = useState<any>(null);

  // Helper function to create content signature for tracking processed content
  const createContentSignature = async (content: any, params: any) => {
    if (selectedTab === 'text') {
      return `text_${content}_${JSON.stringify(params)}`;
    } else if (selectedTab === 'url') {
      return `url_${content}_${JSON.stringify(params)}`;
    } else if (selectedTab === 'upload' && content?.file) {
      return `file_${content.file.name}_${content.file.size}_${content.file.lastModified}_${JSON.stringify(params)}`;
    } else if (selectedTab === 'image' && mediaType === 'image') {
      if (content && typeof content === 'string') {
        const response = await fetch(content);
        const blob = await response.blob();
        return `image_${blob.size}_${JSON.stringify(params)}`;
      }
      return '';
    } else if (selectedTab === 'video' && mediaType === 'video') {
      return `video_${content}_${JSON.stringify(params)}`;
    } else if (selectedTab === 'youtube' && mediaType === 'youtube') {
      // Extract video ID for YouTube URLs
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = content.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : content;
      return `youtube_${videoId}_${JSON.stringify(params)}`;
    }
    return '';
  };

  // Helper function to check if content was previously processed
  const checkIfPreviouslyProcessed = async () => {
    const currentParams = {
      cardCount,
      difficulty,
      format,
      language,
      frontTextLength,
      backTextLength
    };

    let content: any = '';
    if (selectedTab === 'text') {
      content = inputText;
    } else if (selectedTab === 'url') {
      content = websiteUrl;
    } else if (selectedTab === 'upload') {
      content = uploadedFile;
    } else if (['image', 'video', 'youtube'].includes(selectedTab)) {
      content = mediaUrl || '';
    }

    const signature = await createContentSignature(content, currentParams);
    if (!signature) return false;
    
    const processedContent = JSON.parse(localStorage.getItem('processedFlashcardContent') || '[]');
    return processedContent.includes(signature);
  };

  // Effect to watch for content and parameter changes and update regenerate option
  useEffect(() => {
    const checkProcessingStatus = async () => {
      if ((selectedTab === 'text' && inputText) ||
          (selectedTab === 'url' && websiteUrl) ||
          (selectedTab === 'upload' && uploadedFile) ||
          (selectedTab === 'image' && mediaType === 'image' && mediaUrl) ||
          (selectedTab === 'video' && mediaType === 'video' && mediaUrl) ||
          (selectedTab === 'youtube' && mediaType === 'youtube' && mediaUrl)) {
        const wasProcessed = await checkIfPreviouslyProcessed();
        setShowRegenerateOption(wasProcessed);
        if (!wasProcessed) {
          setForceNewFlashcards(false); // Reset regenerate option if this content wasn't processed before
        }
      } else {
        setShowRegenerateOption(false);
        setForceNewFlashcards(false);
      }
    };
    
    checkProcessingStatus();
  }, [inputText, websiteUrl, uploadedFile, mediaType, mediaUrl, selectedTab, cardCount, difficulty, format, language, frontTextLength, backTextLength]);

  // Effect to handle different modes
  useEffect(() => {
    // Set page title based on current route or prop
    if (isAiMode || location.pathname === '/generator') {
      setPageTitle('AI Flashcard Generator');
    } else {
      setPageTitle('Create Flashcards');
    }

    // Apply smooth entrance animation
    document.querySelector('.main-content')?.classList.add('animate-fade-in');
    return () => {
      document.querySelector('.main-content')?.classList.remove('animate-fade-in');
    };
  }, [isAiMode, location.pathname]);

  // Clear validation message when tab changes
  useEffect(() => {
    setValidationMessage({ type: null, message: null });
  }, [selectedTab]);

  const handleOutlineGenerated = (outline: string) => {
    setInputText(prevText => {
      return prevText.trim() ? `${prevText}\n\n${outline}` : outline;
    });
    setSelectedTab('text');
  };
  const handleBack = () => {
    navigate('/dashboard');
  };
  // Helper function for format mapping
  const getFormattedSettings = (settings: any) => {
    const formatMapping = {
      'Q&A': 'Question & Answer',
      'Fill-in': 'Fill in the Blank',
      'True/False': 'True/False',
      'Definition': 'Definition'
    };
    
    return {
      num_flashcards: parseInt(settings.cardCount),
      difficulty_level: settings.difficulty,
      card_format: formatMapping[settings.format] || settings.format,
      language: settings.language
    };
  };

  const handleGenerateFlashcards = async () => {
    // Clear any previous validation messages
    setValidationMessage({ type: null, message: null });
    
    try {
      // Settings object
      const settings = {
        cardCount: parseInt(cardCount),
        difficulty,
        format,
        language,
        forceNew: forceNewFlashcards // Add force new option to settings
      };
      const frontTextLengthValue = frontTextLength.charAt(0).toUpperCase() + frontTextLength.slice(1);
      const backTextLengthValue = backTextLength.charAt(0).toUpperCase() + backTextLength.slice(1);

      let flashcardsData = null;

      // Check if we have a file upload
      if (uploadedFile && uploadedFile.file) {
        const formattedSettings = getFormattedSettings(settings);
        const formData = new FormData();
        formData.append('file', uploadedFile.file);
        formData.append('num_flashcards', formattedSettings.num_flashcards.toString());
        formData.append('difficulty_level', formattedSettings.difficulty_level);
        formData.append('card_format', formattedSettings.card_format);
        formData.append('language', settings.language);
        formData.append('front_text_length', frontTextLengthValue);
        formData.append('back_text_length', backTextLengthValue);
        formData.append('force_new_cards', settings.forceNew.toString());
        
        flashcardsData = await generateFlashcards(formData, '/api/generate-flashcards-from-file');
      }
      // Check if we have an image upload
      else if (mediaType === 'image' && mediaUrl) {
        const formattedSettings = getFormattedSettings(settings);
        const response = await fetch(mediaUrl);
        const imageBlob = await response.blob();
        
        const formData = new FormData();
        formData.append('file', imageBlob, 'image.jpg');
        formData.append('num_flashcards', formattedSettings.num_flashcards.toString());
        formData.append('difficulty_level', formattedSettings.difficulty_level);
        formData.append('card_format', formattedSettings.card_format);
        formData.append('language', settings.language);
        formData.append('front_text_length', frontTextLengthValue);
        formData.append('back_text_length', backTextLengthValue);
        formData.append('force_new_cards', settings.forceNew.toString());
        
        flashcardsData = await generateFlashcards(formData, '/api/generate-flashcards-from-image');
      }
      // Check if we have a video upload
      else if (mediaType === 'video' && mediaUrl) {
        const formattedSettings = getFormattedSettings(settings);
        const response = await fetch(mediaUrl);
        const videoBlob = await response.blob();
        
        const formData = new FormData();
        formData.append('file', videoBlob, 'video.mp4');
        formData.append('num_flashcards', formattedSettings.num_flashcards.toString());
        formData.append('difficulty_level', formattedSettings.difficulty_level);
        formData.append('card_format', formattedSettings.card_format);
        formData.append('language', settings.language);
        formData.append('front_text_length', frontTextLengthValue);
        formData.append('back_text_length', backTextLengthValue);
        formData.append('force_new_cards', settings.forceNew.toString());
        
        flashcardsData = await generateFlashcards(formData, '/api/generate-flashcards-from-video');
      }
      // Check if we have a YouTube video
      else if (mediaType === 'youtube' && mediaUrl) {
        const formattedSettings = getFormattedSettings(settings);
        const formData = new FormData();
        formData.append('youtube_url', mediaUrl);
        formData.append('num_flashcards', formattedSettings.num_flashcards.toString());
        formData.append('difficulty_level', formattedSettings.difficulty_level);
        formData.append('card_format', formattedSettings.card_format);
        formData.append('language', settings.language);
        formData.append('front_text_length', frontTextLengthValue);
        formData.append('back_text_length', backTextLengthValue);
        formData.append('force_new_cards', settings.forceNew.toString());
        
        flashcardsData = await generateFlashcards(formData, '/api/generate-flashcards-from-youtube');
      }
      // Check if we have a website URL
      else if (websiteUrl.trim()) {
        const formattedSettings = getFormattedSettings(settings);
        const formData = new FormData();
        formData.append('url', websiteUrl);
        formData.append('num_flashcards', formattedSettings.num_flashcards.toString());
        formData.append('difficulty_level', formattedSettings.difficulty_level);
        formData.append('card_format', formattedSettings.card_format);
        formData.append('language', settings.language);
        formData.append('front_text_length', frontTextLengthValue);
        formData.append('back_text_length', backTextLengthValue);
        formData.append('force_new_cards', settings.forceNew.toString());
        
        flashcardsData = await generateFlashcards(formData, '/api/generate-flashcards-from-url');
      }
      // For ANY text input (regardless of tab), call the API if we have text
      else if (inputText.trim()) {
        const formattedSettings = getFormattedSettings(settings);
        const requestBody = {
          content: inputText,
          ...formattedSettings,
          front_text_length: frontTextLengthValue,
          back_text_length: backTextLengthValue,
          force_new_cards: settings.forceNew
        };
        
        flashcardsData = await generateFlashcards(requestBody, '/api/generate-flashcards-from-text');
      } else {
        return;
      }

      // Track this content as processed with current parameters
      const currentParams = {
        cardCount,
        difficulty,
        format,
        language,
        frontTextLength,
        backTextLength
      };
      
      let content: any = null;
      if (uploadedFile && uploadedFile.file) {
        content = uploadedFile;
      } else if (mediaType === 'image' || mediaType === 'video' || mediaType === 'youtube') {
        content = mediaUrl || '';
      } else if (websiteUrl.trim()) {
        content = websiteUrl;
      } else if (inputText.trim()) {
        content = inputText;
      }
      
      const signature = await createContentSignature(content, currentParams);
      if (signature) {
        const processedContent = JSON.parse(localStorage.getItem('processedFlashcardContent') || '[]');
        if (!processedContent.includes(signature)) {
          processedContent.push(signature);
          localStorage.setItem('processedFlashcardContent', JSON.stringify(processedContent));
        }
        // immediately show regenerate option since we just processed this content
        setShowRegenerateOption(true);
      }

      // Store the flashcard data and show the dialog
      console.log('📊 Generated flashcard data:', flashcardsData);
      console.log('📊 Flashcard set structure:', flashcardsData?.flashcard_set);
      console.log('📊 Flashcard count check:', {
        num_flashcards: flashcardsData?.num_flashcards,
        flashcard_set_data_cards: flashcardsData?.flashcard_set?.data?.cards?.length,
        flashcard_set_cards: flashcardsData?.flashcard_set?.cards?.length,
        flashcard_set_data_length: flashcardsData?.flashcard_set?.data?.length,
        flashcards_length: flashcardsData?.flashcards?.length
      });
      setGeneratedFlashcardsData(flashcardsData);
      setShowGenerationDialog(true);
    } catch (error) {
      console.error('Error in flashcard generation:', error);
      let errorMessage = error instanceof Error ? error.message : "Failed to generate flashcards. Please try again.";
      
      // strip any technical prefixes we sometimes get from the library/backend
      errorMessage = errorMessage.replace(/^(?:API Request Failed:|HTTP error! status:\s*\d+|Error:)/i, '').trim();
      // also remove any embedded URLs (they clutter the message)
      errorMessage = errorMessage.replace(/https?:\/\/\S+/g, '').trim();
      // remove backend debug messages
      errorMessage = errorMessage.replace(/URL:\s*\/[^\s]+/g, '').trim();
      errorMessage = errorMessage.replace(/Make sure your backend.*$/i, '').trim();
      
      // Only show user-friendly messages for tier limit/quota errors
      // Hide technical API errors (like URL extraction failures, network issues, etc.)
      if (
        errorMessage.includes('exceeds') ||
        errorMessage.includes('duration') ||
        errorMessage.includes('limit') ||
        errorMessage.toLowerCase().includes('too large') ||
        errorMessage.toLowerCase().includes('quota')
      ) {
        // Clean up the error message - extract only the relevant part

        // Handle quiz limit errors
        if (errorMessage.includes('quiz limit') || errorMessage.includes('total quiz limit')) {
          const match = errorMessage.match(/You have reached your total quiz limit of \d+\. Please upgrade your plan\./i);
          if (match) {
            errorMessage = match[0];
          } else {
            errorMessage = "You have reached your quiz limit. Please upgrade your plan.";
          }
        }
        // Handle duration limit errors
        else if (errorMessage.includes('duration') && errorMessage.includes('exceeds')) {
          // Extract the duration limit from the message (e.g., "45 minutes")
          const limitMatch = errorMessage.match(/(?:limit of|tier limit of)\s*(\d+\s*minutes)/i);
          if (limitMatch) {
            errorMessage = `Video duration exceeds your free tier of ${limitMatch[1]}. Please upgrade`;
          } else {
            errorMessage = "Video duration exceeds your free tier limit. Please upgrade.";
          }
        }
        // Handle file size limit errors (MB or "too large" phrasing)
        else if (
          (errorMessage.toLowerCase().includes('too large') && errorMessage.toLowerCase().includes('mb')) ||
          (errorMessage.includes('exceeds') && errorMessage.includes('MB'))
        ) {
          errorMessage = "File size exceeds your tier limit. Please upgrade or use a smaller file.";
        }
        // Handle word count limit errors
        else if (errorMessage.includes('word') && errorMessage.includes('limit')) {
          errorMessage = "Word count exceeds your free tier limit. Please upgrade or reduce text.";
        }
        // Generic cleanup for other limit errors
        else {
          const match = errorMessage.match(/(.*?exceeds.*?limit.*?)[\\.]/i);
          if (match) {
            errorMessage = match[1] + ". Please upgrade.";
          }
        }
        
        setValidationMessage({
          type: 'error',
          message: errorMessage
        });
      } else {
        // Don't show technical API errors to users - show generic friendly message
        // Technical errors are logged to console for debugging
        setValidationMessage({
          type: 'error',
          message: "Unable to generate flashcards. Please try again or use different content."
        });
      }
      // Logging errors only; toasts are disabled for other backend API errors
      // (upgrade-popup will still show for quota or size issues)
    }
  };
  const renderMediaPreview = () => {
    return <div>
        {mediaType !== 'none' && <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Media Preview</h3>
            {mediaType === 'image' && <div className="relative rounded-md overflow-hidden border h-48 flex items-center justify-center bg-slate-50">
                <img src={mediaUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50" onClick={clearMedia}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>}
            {mediaType === 'video' && <div className="relative rounded-md overflow-hidden border">
                <video src={mediaUrl} controls className="w-full h-48 object-contain bg-slate-900" />
                <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50" onClick={clearMedia}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>}
            {mediaType === 'youtube' && <div className="relative rounded-md overflow-hidden border">
                <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${getYoutubeId(mediaUrl)}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="bg-slate-900"></iframe>
                <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50" onClick={clearMedia}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>}
          </div>}
      </div>;
  };
  const hasContent = inputText.trim().length > 0 || mediaType !== 'none' || uploadedFile !== null;

  // Settings component
  const renderSettings = () => (
    <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
      <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
        Configuration Settings
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Number of Flashcards */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">How many flashcards?</Label>
          <Select value={cardCount} onValueChange={setCardCount}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select number of cards" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              <SelectItem value="5">5 cards</SelectItem>
              <SelectItem value="10">10 cards</SelectItem>
              <SelectItem value="15">15 cards (For Paid Subscribers)</SelectItem>
              <SelectItem value="20">20 cards (For Paid Subscribers)</SelectItem>
              <SelectItem value="25">25 cards (For Paid Subscribers)</SelectItem>
              <SelectItem value="30">30 cards (For Paid Subscribers)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Difficulty level</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select difficulty level" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Card Format */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Card format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select card format" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              <SelectItem value="Q&A">Question & Answer</SelectItem>
              <SelectItem value="Fill-in">Fill in the Blank</SelectItem>
              <SelectItem value="True/False">True/False</SelectItem>
              <SelectItem value="Definition">Definition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <LanguageSelector
          value={language}
          onValueChange={setLanguage}
          label="Language"
          useLowercase={true}
          className="space-y-2"
        />

        {/* Front Text Length - Only show for Q&A and Definition formats */}
        {(format === 'Q&A' || format === 'Definition') && (
          <div className="space-y-3">
            <Label className="text-xs font-medium">Front Text Length</Label>
            <RadioGroup value={frontTextLength} onValueChange={setFrontTextLength}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="front-short" />
                <Label htmlFor="front-short" className="font-normal cursor-pointer">Short</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="front-medium" />
                <Label htmlFor="front-medium" className="font-normal cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="front-long" />
                <Label htmlFor="front-long" className="font-normal cursor-pointer">Long</Label>
              </div>
            </RadioGroup>
            <div className="p-3 bg-muted/50 rounded-md border text-xs text-muted-foreground min-h-[120px]">
              <p className="font-medium mb-1">EXAMPLE FRONT</p>
              <p className="text-foreground">
                {frontTextLength === 'short' && 'What is ionic bonding?'}
                {frontTextLength === 'medium' && 'Explain the process of ionic bonding and its relation to ion formation.'}
                {frontTextLength === 'long' && 'Describe the process of ionic bonding and how it relates to the formation of positive and negative ions. Explain the factors that contribute to the strength of ionic bonding.'}
              </p>
            </div>
          </div>
        )}

        {/* Back Text Length - Only show for Q&A and Definition formats */}
        {(format === 'Q&A' || format === 'Definition') && (
          <div className="space-y-3">
            <Label className="text-xs font-medium">Back Text Length</Label>
            <RadioGroup value={backTextLength} onValueChange={setBackTextLength}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="back-short" />
                <Label htmlFor="back-short" className="font-normal cursor-pointer">Short</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="back-medium" />
                <Label htmlFor="back-medium" className="font-normal cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="back-long" />
                <Label htmlFor="back-long" className="font-normal cursor-pointer">Long</Label>
              </div>
            </RadioGroup>
            <div className="p-3 bg-muted/50 rounded-md border text-xs text-muted-foreground min-h-[120px]">
              <p className="font-medium mb-1">EXAMPLE BACK</p>
              <p className="text-foreground">
                {backTextLength === 'short' && 'Electron transfer forming ions with opposite charges.'}
                {backTextLength === 'medium' && 'Ionic bonding involves electron transfer to form positive and negative ions. Smaller ions and higher charges result in stronger bonding.'}
                {backTextLength === 'long' && 'Ionic bonding is the electrostatic attraction between oppositely charged ions formed through electron transfer. The bond strength depends on ion size (smaller ions create stronger bonds) and charge magnitude (higher charges increase attraction), as well as the lattice energy of the resulting ionic compound.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  // Handlers for the generation complete dialog
  const handleEditFlashcards = () => {
    setShowGenerationDialog(false);
    navigate('/app/edit-generated', {
      state: { flashcardsData: generatedFlashcardsData }
    });
  };
  
  const handlePreviewFlashcards = () => {
    setShowGenerationDialog(false);
    console.log('🎯 Navigating to preview with data:', generatedFlashcardsData);
    console.log('🎯 Flashcard set:', generatedFlashcardsData?.flashcard_set);
    
    // Handle nested flashcard_set structure (from file/cached responses)
    const flashcardData = generatedFlashcardsData?.flashcard_set?.flashcard_set 
      ? generatedFlashcardsData.flashcard_set.flashcard_set 
      : generatedFlashcardsData?.flashcard_set;
    
    console.log('🎯 Final flashcard data to preview:', flashcardData);
    
    navigate('/app/flashcard-preview', {
      state: {
        flashcardsData: flashcardData
      }
    });
  };
  
  return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="relative mb-10">
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <BookText className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">{pageTitle}</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Transform your notes, texts, or media into interactive flashcards for effective learning and memorization.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-primary/20 rotate-12">
              <BookText className="h-10 w-10" />
            </div>
          </div>
          <div className="absolute top-10 right-1/4 transform translate-x-1/2 -translate-y-1/2">
            <div className="text-accent/30 -rotate-12">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
        </div>
        
        {/* Main controls section */}
        <div className="flex items-center justify-between mb-6">
          
        </div>
        
        {/* Validation Message */}
        {validationMessage.message && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className={`p-4 rounded-lg border ${
              validationMessage.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <p className="text-sm font-medium">{validationMessage.message}</p>
            </div>
          </div>
        )}
        
         <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="px-4 md:px-6">
            <TabsList className="grid grid-cols-6 gap-1.5 p-1 bg-background/50 border-2 rounded-full w-full max-w-3xl mx-auto mb-6 h-auto">
              <TabsTrigger value="text" className="rounded-full py-3 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Text className="h-4 w-4 mr-1.5" />
                <span>Text</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="rounded-full py-3 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileUp className="h-4 w-4 mr-1.5" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="rounded-full py-3 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Link className="h-4 w-4 mr-1.5" />
                <span>URL</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="rounded-full py-3 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Image className="h-4 w-4 mr-1.5" />
                <span>Image</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="rounded-full py-3 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Video className="h-4 w-4 mr-1.5" />
                <span>Video</span>
              </TabsTrigger>
              <TabsTrigger value="youtube" className="rounded-full py-3 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Youtube className="h-4 w-4 mr-1.5" />
                <span>YouTube</span>
              </TabsTrigger>
            </TabsList>
            </div>

            <TabsContent value="upload" className="space-y-6">
              {!uploadedFile ? (
                <div 
                  className={`border-2 border-dashed rounded-lg p-16 min-h-[280px] flex items-center justify-center text-center transition-colors max-w-5xl mx-auto ${
                    fileDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                  {...fileDragProps}
                >
                  <input 
                    type="file" 
                    id="file-upload-flashcard" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt,text/markdown,.md"
                  />
                  <label htmlFor="file-upload-flashcard" className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img src="/icons/upload.svg" alt="" className="w-full h-full" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-muted-foreground">Drag your file here, or <span className="text-primary underline">click here to upload</span></p>
                      <p className="text-xs text-muted-foreground">
                        Supports: PDF, DOC, DOCX, TXT, MD. Max 35MB.
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg max-w-5xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {uploadedFile.type || 'File uploaded'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setUploadedFile(null)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
              
              {fileValidationError && (
                <div className="max-w-5xl mx-auto">
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                    <p className="text-sm font-medium">{fileValidationError}</p>
                    <button 
                      onClick={() => setFileValidationError(null)}
                      className="text-xs text-red-600 hover:text-red-700 mt-2 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              
              {isFileProcessing && (
                <div className="flex justify-center items-center mt-4">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mr-2"></div>
                  <p>Processing your file...</p>
                </div>
              )}
              
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Settings for file upload */}
                {uploadedFile && renderSettings()}
                
                {/* Generate Flashcards button for file upload */}
                {uploadedFile && (
                  <GeneratorControls
                    isGenerating={loading}
                    onGenerateFlashcards={handleGenerateFlashcards}
                    hasContent={!!uploadedFile}
                    selectedSubject={selectedDeck}
                    showRegenerateOption={showRegenerateOption}
                    forceNewFlashcards={forceNewFlashcards}
                    onRegenerateChange={(checked) => setForceNewFlashcards(checked)}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-6">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="space-y-2">
                  <textarea
                    placeholder={`Enter text for ${selectedDeck || 'General'} flashcards. You can include paragraphs, lists, or key points.`}
                    className="min-h-[400px] w-full p-4 border-2 border-input rounded-md resize-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  {(() => {
                    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
                    const isOverLimit = wordCount > 6000;
                    const isBelowMinimum = inputText.trim() && wordCount < 120;
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Free tier: 6000 words • Minimum: 120 words
                          </p>
                          {inputText.trim() && (
                            <p className={`text-sm ${
                              isOverLimit ? 'text-red-600 font-semibold' : 
                              isBelowMinimum ? 'text-orange-600 font-semibold' : 
                              'text-muted-foreground'
                            }`}>
                              Word count: <span className="font-medium">{wordCount}</span>
                            </p>
                          )}
                        </div>
                        {isBelowMinimum && (
                          <p className="text-sm text-orange-600 font-medium">
                            ⚠️ Please enter at least 120 words to generate flashcards.
                          </p>
                        )}
                        {isOverLimit && (
                          <p className="text-sm text-red-600 font-medium">
                            ⚠️ Word limit exceeded. Please reduce your text or upgrade to Pro/Ultra for unlimited words.
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              
                {/* Settings for text */}
                {inputText.trim() && (() => {
                  const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
                  return wordCount >= 120 && renderSettings();
                })()}
              
                {/* Generate Flashcards button for text */}
                {inputText.trim() && (() => {
                  const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
                  const isValid = wordCount >= 120 && wordCount <= 6000;
                  return isValid && (
                    <GeneratorControls
                      isGenerating={loading}
                      onGenerateFlashcards={handleGenerateFlashcards}
                      hasContent={isValid}
                      selectedSubject={selectedDeck}
                      showRegenerateOption={showRegenerateOption}
                      forceNewFlashcards={forceNewFlashcards}
                      onRegenerateChange={(checked) => setForceNewFlashcards(checked)}
                    />
                  );
                })()}
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-6">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <img src="/icons/chain.svg" alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="url"
                      placeholder="Enter website URL (e.g., https://example.com/article)"
                      className="w-full p-4 pl-12 border-2 border-input rounded-md text-base"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Paste any article or webpage URL to generate flashcards from its content</p>
                </div>
              
                {/* Settings for URL */}
                {websiteUrl.trim() && renderSettings()}
              
                {/* Generate Flashcards button for URL */}
                {websiteUrl.trim() && (
                  <GeneratorControls
                    isGenerating={loading}
                    onGenerateFlashcards={handleGenerateFlashcards}
                    hasContent={!!websiteUrl.trim()}
                    selectedSubject={selectedDeck}
                    showRegenerateOption={showRegenerateOption}
                    forceNewFlashcards={forceNewFlashcards}
                    onRegenerateChange={(checked) => setForceNewFlashcards(checked)}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-6">
              {mediaType !== 'image' ? (
                <div 
                  className={`border-2 border-dashed rounded-lg p-16 min-h-[280px] flex items-center justify-center text-center transition-colors max-w-5xl mx-auto ${
                    imageDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                  {...imageDragProps}
                >
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img src="/icons/ImageUpload.svg" alt="" className="w-full h-full" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-muted-foreground">Drag your image here, or <span className="text-primary underline">click here to upload</span></p>
                      <p className="text-sm text-muted-foreground">JPG, PNG, GIF supported</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Free tier: 20 MB. Upgrade for more
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-md overflow-hidden border h-64 flex items-center justify-center bg-slate-50 max-w-5xl mx-auto">
                  <img src={mediaUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50" onClick={clearMedia}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Settings for image */}
                {mediaType === 'image' && renderSettings()}
              
                {/* Generate Flashcards button for image */}
                {mediaType === 'image' && (
                  <GeneratorControls
                    isGenerating={loading}
                    onGenerateFlashcards={handleGenerateFlashcards}
                    hasContent={mediaType === 'image'}
                    selectedSubject={selectedDeck}
                    showRegenerateOption={showRegenerateOption}
                    forceNewFlashcards={forceNewFlashcards}
                    onRegenerateChange={(checked) => setForceNewFlashcards(checked)}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-6">
              {mediaType !== 'video' ? (
                <div 
                  className={`border-2 border-dashed rounded-lg p-16 min-h-[280px] flex items-center justify-center text-center transition-colors max-w-5xl mx-auto ${
                    videoDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                  {...videoDragProps}
                >
                  <input
                    type="file"
                    id="video-upload"
                    className="hidden"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                  <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img src="/icons/videoUpload.svg" alt="" className="w-full h-full" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-muted-foreground">Drag your video here, or <span className="text-primary underline">click here to upload</span></p>
                      <p className="text-sm text-muted-foreground">MP4, AVI, MOV supported</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Free tier: 100 MB • Upgrade for more
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-md overflow-hidden border max-w-5xl mx-auto">
                  <video src={mediaUrl} controls className="w-full h-64 object-contain bg-slate-900" />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50" onClick={clearMedia}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Settings for video */}
                {mediaType === 'video' && renderSettings()}
              
                {/* Generate Flashcards button for video */}
                {mediaType === 'video' && (
                  <GeneratorControls
                    isGenerating={loading}
                    onGenerateFlashcards={handleGenerateFlashcards}
                    hasContent={mediaType === 'video'}
                    selectedSubject={selectedDeck}
                    showRegenerateOption={showRegenerateOption}
                    forceNewFlashcards={forceNewFlashcards}
                    onRegenerateChange={(checked) => setForceNewFlashcards(checked)}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="youtube" className="space-y-6">
              {mediaType !== 'youtube' ? (
                <div className="border-2 border-dashed rounded-lg p-16 min-h-[280px] flex items-center justify-center text-center transition-colors border-border hover:border-primary/40 max-w-5xl mx-auto">
                  <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img src="/icons/youtubeUpload.svg" alt="" className="w-full h-full" />
                    </div>
                    <div className="space-y-4 w-full">
                      <p className="text-lg font-medium text-muted-foreground">Add YouTube Video URL</p>
                      <div className="w-full">
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          className={`w-full p-3 border-2 rounded-md ${
                            youtubeError ? 'border-red-500 focus:ring-red-500' : 'border-input'
                          }`}
                          value={youtubeUrl}
                          onChange={(e) => {
                            setYoutubeUrl(e.target.value);
                            if (e.target.value) {
                              handleYoutubeUrl(e.target.value);
                            } else {
                              clearMedia();
                            }
                          }}
                        />
                        {youtubeError && (
                          <p className="mt-2 text-sm text-red-600">
                            {youtubeError}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Videos up to:</span> Free tier: 45 mins • Pro: 1 hr 30 mins • Ultra: 2 hrs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto">
                  <div className="relative rounded-md overflow-hidden border">
                    <iframe 
                      width="100%" 
                      height="315" 
                      src={`https://www.youtube.com/embed/${getYoutubeId(mediaUrl)}`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      className="bg-slate-900"
                    />
                    <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50" onClick={clearMedia}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Settings for youtube */}
                {mediaType === 'youtube' && renderSettings()}
                
                {/* Generate Flashcards button for YouTube */}
                {mediaType === 'youtube' && (
                  <GeneratorControls
                    isGenerating={loading}
                    onGenerateFlashcards={handleGenerateFlashcards}
                    hasContent={mediaType === 'youtube'}
                    selectedSubject={selectedDeck}
                    showRegenerateOption={showRegenerateOption}
                    forceNewFlashcards={forceNewFlashcards}
                    onRegenerateChange={(checked) => setForceNewFlashcards(checked)}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        
        {/* Popular Use Cases Section */}
        <PopularUseCases />
        
        {/* Upgrade Popup */}
        <UpgradePopup
          isOpen={showUpgradePopup}
          onClose={closeUpgradePopup}
          message={upgradeMessage}
        />
        
        {/* Generation Complete Dialog */}
        <FlashcardGenerationCompleteDialog
          open={showGenerationDialog}
          onOpenChange={setShowGenerationDialog}
          flashcardCount={
            generatedFlashcardsData?.flashcard_set?.flashcard_set?.flashcards?.length ||
            generatedFlashcardsData?.flashcard_set?.flashcards?.length || 
            0
          }
          onEdit={handleEditFlashcards}
          onPreview={handlePreviewFlashcards}
        />
      </div>
    );
};
export default FlashcardGenerator;