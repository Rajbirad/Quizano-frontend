import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMediaUpload } from '@/utils/media-utils';
import { Image, Loader2, X, CloudUpload, BookText, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { DifficultyLevelSelector } from '@/components/ui/DifficultyLevelSelector';
import { QuestionCountSelector } from '@/components/ui/QuestionCountSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { ErrorNotificationBanner } from '@/components/ui/ErrorNotificationBanner';
import { PageHeader } from '@/components/ui/PageHeader';

const QuizImageGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateImageFile } = useMediaUpload();
  const { 
    generateQuiz, 
    loading, 
    progress, 
    error, 
    cancelGeneration, 
    showUpgradePopup, 
    closeUpgradePopup, 
    upgradeMessage 
  } = useAsyncQuizGeneration();
  
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [hasConfigured, setHasConfigured] = useState(false);
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [forceNewQuiz, setForceNewQuiz] = useState(false); // Add regenerate option
  const [showRegenerateOption, setShowRegenerateOption] = useState(false); // Show regenerate only for previously processed images
  const [displayError, setDisplayError] = useState<string | null>(null); // Error message to display
  const [showNotification, setShowNotification] = useState(false); // Control notification visibility
  const [notificationVariant, setNotificationVariant] = useState<'error' | 'warning' | 'info'>('error'); // Notification variant

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      mediaUrls.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mediaUrls]);

  // Check if current images with current params were previously processed whenever params change
  useEffect(() => {
    if (uploadedImages.length > 0) {
      const wasProcessed = uploadedImages.some(img => checkIfPreviouslyProcessed(img));
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false); // Reset regenerate option if this combination wasn't processed before
      }
    }
  }, [uploadedImages, questionCount, difficultyLevel, questionType, includeExplanations, language]);

  // Helper function to create an image signature for tracking processed images
  const createImageSignature = (image: File, params: any) => {
    return `image_${image.name}_${image.size}_${image.lastModified}_${JSON.stringify(params)}`;
  };

  // Helper function to check if image with same params was previously processed
  const checkIfPreviouslyProcessed = (image: File) => {
    const currentParams = {
      questionCount,
      difficultyLevel,
      questionType,
      includeExplanations,
      language
    };
    
    const signature = createImageSignature(image, currentParams);
    const processedImages = JSON.parse(localStorage.getItem('processedQuizImages') || '[]');
    return processedImages.includes(signature);
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
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];
    const newUrls: string[] = [];
    
    for (const file of files) {
      if (uploadedImages.length + validFiles.length >= 10) {
        toast({
          title: "Upload limit reached",
          description: "You can upload up to 10 images at once.",
          variant: "destructive"
        });
        break;
      }
      if (validateImageFile(file)) {
        validFiles.push(file);
        newUrls.push(URL.createObjectURL(file));
      }
    }
    
    if (validFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...validFiles]);
      setMediaUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validFiles: File[] = [];
    const newUrls: string[] = [];
    
    for (const file of files) {
      if (uploadedImages.length + validFiles.length >= 10) {
        toast({
          title: "Upload limit reached",
          description: "You can upload up to 10 images at once.",
          variant: "destructive"
        });
        break;
      }
      if (validateImageFile(file)) {
        validFiles.push(file);
        newUrls.push(URL.createObjectURL(file));
      }
    }
    
    if (validFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...validFiles]);
      setMediaUrls(prev => [...prev, ...newUrls]);
    }
    
    // Reset input to allow uploading the same file again
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const urlToRevoke = mediaUrls[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateQuiz = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload at least one image to generate questions from.",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      uploadedImages.forEach((image, index) => {
        formData.append('files', image);
      });
      formData.append('num_questions', questionCount);
      const difficultyMap: Record<string, string> = {
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
        'very-hard': 'Very Hard',
        'mixed': 'Mixed'
      };
      formData.append('difficulty_level', difficultyMap[difficultyLevel] || (difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)));
      formData.append('question_type', questionType === 'multiple-choice' ? 'Multiple Choice' : 
                     questionType === 'true-false' ? 'True/False' :
                     questionType === 'short-answer' ? 'Short Answer' :
                     questionType === 'fill-in-blank' ? 'Fill in the Blank' : 'Mixed');
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      formData.append('force_new_quiz', forceNewQuiz.toString()); // Add regenerate parameter

      // Use the new async generation
      const data = await generateQuiz(formData, '/api/generate-quiz-from-image');
      
      if (data.success && data.quiz) {
        // Track this image as processed with current parameters
        const currentParams = {
          questionCount,
          difficultyLevel,
          questionType,
          includeExplanations,
          language
        };
        uploadedImages.forEach(img => {
          const signature = createImageSignature(img, currentParams);
          const processedImages = JSON.parse(localStorage.getItem('processedQuizImages') || '[]');
          if (!processedImages.includes(signature)) {
            processedImages.push(signature);
            localStorage.setItem('processedQuizImages', JSON.stringify(processedImages));
          }
        });

        // Store the quiz data
        localStorage.setItem('generatedQuizData', JSON.stringify(data));

        navigate('/app/quiz-preview', {
          state: {
            inputType: 'image',
            content: uploadedImages.map(img => img.name).join(', '),
            questions: data.quiz.questions,
            quiz: {
              id: data.quiz.id,
              title: data.quiz.title
            },
            settings: {
              questionCount,
              difficultyLevel,
              questionType,
              includeExplanations,
              language
            },
            generatedQuiz: data.quiz,
            topic: data.quiz.title || 'Image Quiz'
          }
        });
      } else {
        throw new Error('Invalid response from quiz generation');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      console.log('📝 Error message:', errorMessage);
      
      // Check if this is an image limit error for free tier
      if (errorMessage.includes('Maximum 5 images allowed') || errorMessage.includes('images allowed for free tier')) {
        console.log('✅ Image limit error detected, showing user-friendly banner');
        setDisplayError('You\'ve reached the free tier limit of 5 images. Upgrade to Pro to upload up to 10 images and unlock more features!');
        setNotificationVariant('warning');
        setShowNotification(true);
      }
      // Check if this is a question limit error
      else if (errorMessage.includes('exceeds question limit') || errorMessage.includes('Quiz exceeds') || errorMessage.includes('maximum') || errorMessage.includes('free plan')) {
        console.log('✅ Question limit error detected, showing banner');
        // Extract the limit from error message if available
        const match = errorMessage.match(/maximum (\d+)/);
        const limit = match ? match[1] : '20';
        setDisplayError(`Free Tier allowed only ${limit} Questions. Please upgrade for more.`);
        setNotificationVariant('error');
        setShowNotification(true);
      }
      // Don't show any error display for quota errors - upgrade popup will handle it
      else if (errorMessage.includes('Quota limit exceeded') || errorMessage.includes('total_limit_exceeded') || errorMessage.includes('quiz limit')) {
        console.log('ℹ️ Quota/limit error detected, upgrade popup will be shown instead');
      } else {
        toast({
          title: "Failed to generate quiz",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  return (
      <div className="container max-w-[52rem] mx-auto px-6 py-8">
        
        {/* Error Notification Banner */}
        <ErrorNotificationBanner
          show={showNotification}
          message={displayError}
          onDismiss={() => setShowNotification(false)}
          variant={notificationVariant}
        />

        <div className="flex flex-col items-center space-y-6 mb-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative shiny-gradient">
              Visual Learning Quiz
            </span>
            <div className="absolute -right-12 top-1 hidden md:block">
              <Sparkles className="h-8 w-8 text-primary animate-pulse-gentle" />
            </div>
          </h1>
          <p className="text-base text-muted-foreground text-center max-w-2xl">
            Upload images, diagrams, or charts and generate intelligent quiz questions based on visual content analysis.
          </p>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          <div>
            {uploadedImages.length === 0 ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/40'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="image-upload" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  accept="image/*"
                  multiple
                />
                 <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Image className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <CloudUpload className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-muted-foreground">
                      Drag your images here, or <span className="text-primary underline">click here to upload</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: JPG, PNG, GIF, WebP, SVG image files (up to 10 images)
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-md">
                      <p className="font-medium">File Limits:</p>
                      <p>• Image files: Max 20MB</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Free tier: Up to 5 images • <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => navigate('/pricing')}>Upgrade for more</span>
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded (max 10)
                  </p>
                  {uploadedImages.length < 10 && (
                    <label htmlFor="image-upload-more" className="cursor-pointer">
                      <input 
                        type="file" 
                        id="image-upload-more" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                        accept="image/*"
                        multiple
                        disabled={loading}
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        disabled={loading}
                        asChild
                        title="Add More Images"
                      >
                        <span>
                          <CloudUpload className="h-4 w-4" />
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
                <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className={`grid gap-3 ${uploadedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Image className="h-5 w-5 text-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-xs truncate">{image.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(image.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveImage(index)}
                            disabled={loading}
                            className="text-destructive hover:text-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {mediaUrls[index] && (
                          <div className={`p-1.5 bg-background border rounded-lg flex items-center justify-center ${
                            uploadedImages.length === 1 ? 'h-64 max-h-64' : 'h-40'
                          }`}>
                            <img 
                              src={mediaUrls[index]} 
                              alt={`Uploaded ${index + 1}`} 
                              className="max-w-full max-h-full object-contain rounded"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Type */}
            <QuestionTypeSelector
              value={questionType}
              onValueChange={(value) => { setQuestionType(value); setHasConfigured(true); }}
              className="space-y-2"
            />

            {/* Question Count */}
            <QuestionCountSelector
              value={questionCount}
              onValueChange={(value) => { setQuestionCount(value); setHasConfigured(true); }}
              className="space-y-2"
              maxCount={50}
            />

            {/* Difficulty Level */}
            <DifficultyLevelSelector
              value={difficultyLevel}
              onValueChange={(value) => { setDifficultyLevel(value); setHasConfigured(true); }}
              className="space-y-2"
              includeVeryHard={true}
              includeMixed={true}
            />

            {/* Language */}
            <LanguageSelector
              value={language}
              onValueChange={(value) => { setLanguage(value); setHasConfigured(true); }}
              label="Language"
              useLowercase={true}
              className="space-y-2"
            />
          </div>

          {/* Include Explanations */}
            <IncludeExplanationsSwitch
              checked={includeExplanations}
              onCheckedChange={(checked) => { setIncludeExplanations(checked); setHasConfigured(true); }}
            />
          {/* Force New Quiz (Regenerate) - Only show when same image with same params was previously processed */}
          {showRegenerateOption && (
            <div className="p-5 border rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-full bg-white shadow-sm border border-green-100">
                    <RefreshCw className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-green-900">Generate fresh questions</h4>
                    <p className="text-xs text-green-700/70 mt-0.5">You've processed this image before - get different questions?</p>
                  </div>
                </div>
                
                {/* Custom Styled Switch */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium transition-colors duration-200 ${
                    !forceNewQuiz ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    Same
                  </span>
                  <button
                    onClick={() => { setForceNewQuiz(!forceNewQuiz); setHasConfigured(true); }}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      forceNewQuiz 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25' 
                        : 'bg-gradient-to-r from-gray-200 to-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                        forceNewQuiz ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    >
                      <div className={`flex items-center justify-center h-full w-full ${
                        forceNewQuiz ? 'text-green-600' : 'text-green-600'
                      }`}>
                        {forceNewQuiz ? (
                          <RefreshCw className="h-3 w-3" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        )}
                      </div>
                    </span>
                  </button>
                  <span className={`text-xs font-medium transition-colors duration-200 ${
                    forceNewQuiz ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    Different
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerateQuiz}
            disabled={uploadedImages.length === 0 || loading}
          >
            {loading ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 text-white animate-spin-slow" />
                {forceNewQuiz ? "Regenerating Quiz..." : (progress || "Generating Quiz...")}
              </>
            ) : (
              <>
                {forceNewQuiz ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Regenerate Quiz
                  </>
                ) : (
                  <>
                    Generate Quiz 
                  </>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Upgrade Popup */}
        <UpgradePopup
          isOpen={showUpgradePopup}
          onClose={closeUpgradePopup}
          message={upgradeMessage}
        />
      </div>
  );
};

export default QuizImageGenerator;