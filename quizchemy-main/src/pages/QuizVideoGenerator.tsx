import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import ShinyText from '@/components/ui/ShinyText';
import '@/components/ui/ShinyText.css';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMediaUpload } from '@/utils/media-utils';
import { Video, Loader2, X, Upload, BookText, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { DifficultyLevelSelector } from '@/components/ui/DifficultyLevelSelector';
import { QuestionCountSelector } from '@/components/ui/QuestionCountSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { ErrorNotificationBanner } from '@/components/ui/ErrorNotificationBanner';
import { PageHeader } from '@/components/ui/PageHeader';

const QuizVideoGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateVideoFile } = useMediaUpload();
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
  
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [hasConfigured, setHasConfigured] = useState(false);
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [forceNewQuiz, setForceNewQuiz] = useState(false); // Add regenerate option
  const [showRegenerateOption, setShowRegenerateOption] = useState(false); // Show regenerate only for previously processed videos
  const [displayError, setDisplayError] = useState<string | null>(null); // Error message to display
  const [showNotification, setShowNotification] = useState(false); // Control notification visibility

  // Check if current video with current params was previously processed whenever params change
  useEffect(() => {
    if (uploadedVideo) {
      const wasProcessed = checkIfPreviouslyProcessed(uploadedVideo);
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false); // Reset regenerate option if this combination wasn't processed before
      }
    }
  }, [uploadedVideo, questionCount, difficultyLevel, questionType, includeExplanations, language]);

  // Helper function to create a video signature for tracking processed videos
  const createVideoSignature = (video: File, params: any) => {
    return `${video.name}_${video.size}_${video.lastModified}_${JSON.stringify(params)}`;
  };

  // Helper function to check if video with same params was previously processed
  const checkIfPreviouslyProcessed = (video: File) => {
    const currentParams = {
      questionCount,
      difficultyLevel,
      questionType,
      includeExplanations,
      language
    };
    
    const signature = createVideoSignature(video, currentParams);
    const processedVideos = JSON.parse(localStorage.getItem('processedQuizVideos') || '[]');
    return processedVideos.includes(signature);
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
      if (validateVideoFile(files[0])) {
        setUploadedVideo(files[0]);
        setMediaUrl(URL.createObjectURL(files[0]));

      }
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateVideoFile(file)) {
        setUploadedVideo(file);
        setMediaUrl(URL.createObjectURL(file));

      }
    }
  };

  const handleRemoveVideo = () => {
    setUploadedVideo(null);
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
      setMediaUrl('');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!uploadedVideo) {
      toast({
        title: "Video required",
        description: "Please upload a video to generate questions from.",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadedVideo);
      formData.append('topic', 'general');
      formData.append('num_questions', questionCount);
      // Map difficultyLevel values to backend-friendly labels
      const difficultyMap: Record<string, string> = {
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
        'very-hard': 'Very Hard',
        'mixed': 'Mixed'
      };
      formData.append('difficulty_level', difficultyMap[difficultyLevel] || (difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)));
      // Map questionType to display string for backend compatibility
      const questionTypeMap: Record<string, string> = {
        'multiple-choice': 'Multiple Choice',
        'true-false': 'True/False',
        'short-answer': 'Short Answer',
        'fill-in-blank': 'Fill in the Blank',
        'mixed': 'Mixed',
      };
      formData.append('question_type', questionTypeMap[questionType] || questionType);
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      formData.append('force_new_quiz', forceNewQuiz.toString()); // Add regenerate parameter

      // Use the new async generation
      const data = await generateQuiz(formData, '/api/generate-quiz-from-video');
      
      if (data.success && data.quiz) {
        // Track this video as processed with current parameters
        const currentParams = {
          questionCount,
          difficultyLevel,
          questionType,
          includeExplanations,
          language
        };
        const signature = createVideoSignature(uploadedVideo, currentParams);
        const processedVideos = JSON.parse(localStorage.getItem('processedQuizVideos') || '[]');
        if (!processedVideos.includes(signature)) {
          processedVideos.push(signature);
          localStorage.setItem('processedQuizVideos', JSON.stringify(processedVideos));
        }

        // Store the quiz data
        localStorage.setItem('generatedQuizData', JSON.stringify(data));

        navigate('/app/quiz-preview', {
          state: {
            inputType: 'video',
            content: uploadedVideo.name,
            mediaType: 'video',
            mediaUrl,
            settings: {
              questionCount,
              difficultyLevel,
              questionType,
              includeExplanations,
              language
            },
            generatedQuiz: data.quiz
          }
        });
      } else {
        throw new Error('Invalid response from quiz generation');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      console.log('📝 Error message:', errorMessage);
      
      // Check if this is a question limit error
      if (errorMessage.includes('exceeds question limit') || errorMessage.includes('Quiz exceeds') || errorMessage.includes('maximum') || errorMessage.includes('free plan')) {
        console.log('✅ Question limit error detected, showing banner');
        // Extract the limit from error message if available
        const match = errorMessage.match(/maximum (\d+)/);
        const limit = match ? match[1] : '20';
        setDisplayError(`Free Tier allowed only ${limit} Questions. Please upgrade for more.`);
        setShowNotification(true);
      }
      // Don't show toast for quota limit errors - upgrade popup is shown instead
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
        
        {/* Question Limit Notification */}
        <ErrorNotificationBanner
          show={showNotification}
          message={displayError}
          onDismiss={() => setShowNotification(false)}
        />

        <div className="flex flex-col items-center space-y-6 mb-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative shiny-gradient">
              Video Intelligence Quiz
            </span>
            <div className="absolute -right-12 top-1 hidden md:block">
              <Sparkles className="h-8 w-8 text-primary animate-pulse-gentle" />
            </div>
          </h1>
          <p className="text-base text-muted-foreground text-center max-w-2xl">
            Upload video files and let AI analyze the content to create comprehensive quiz questions automatically.
          </p>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          <div>
            {!uploadedVideo ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                  id="video-upload" 
                  className="hidden" 
                  onChange={handleVideoUpload} 
                  accept="video/*"
                />
                 <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Upload className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-muted-foreground">
                      Drag your video here, or <span className="text-primary underline">click here to upload</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: MP4, MOV, AVI, WMV video files
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-md">
                      <p className="font-medium">File Limits:</p>
                      <p>• Video files: Max 2 GB</p>
                      <p>• Duration: Max Up to 120 minutes</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Free tier: 100 MB (60 minutes)• <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => navigate('/pricing')}>Upgrade for more</span>
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Video className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{uploadedVideo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(uploadedVideo.size / (1024 * 1024))} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveVideo}
                    disabled={loading}
                    className="text-destructive hover:text-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {mediaUrl && (
                  <video 
                    src={mediaUrl} 
                    controls 
                    className="w-full max-h-64 rounded-lg bg-black"
                  />
                )}
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Question type</label>
              <Select value={questionType} onValueChange={(value) => { setQuestionType(value); setHasConfigured(true); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">No of Question</label>
              <Select value={questionCount} onValueChange={(value) => { setQuestionCount(value); setHasConfigured(true); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15 (For Paid Subscribers)</SelectItem>
                  <SelectItem value="20">20 (For Paid Subscribers)</SelectItem>
                  <SelectItem value="25">25 (For Paid Subscribers)</SelectItem>
                  <SelectItem value="30">30 (For Paid Subscribers)</SelectItem>
                  <SelectItem value="35">35 (For Paid Subscribers)</SelectItem>
                  <SelectItem value="40">40 (For Paid Subscribers)</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          {/* Force New Quiz (Regenerate) - Only show when same video with same params was previously processed */}
          {showRegenerateOption && (
            <div className="p-5 border rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-full bg-white shadow-sm border border-blue-100">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-blue-900">Generate fresh questions</h4>
                    <p className="text-xs text-blue-700/70 mt-0.5">You've processed this video before - get different questions?</p>
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
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      forceNewQuiz 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' 
                        : 'bg-gradient-to-r from-gray-200 to-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                        forceNewQuiz ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    >
                      <div className={`flex items-center justify-center h-full w-full ${
                        forceNewQuiz ? 'text-blue-600' : 'text-green-600'
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
                    forceNewQuiz ? 'text-blue-600' : 'text-muted-foreground'
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
            disabled={!uploadedVideo || loading}
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

export default QuizVideoGenerator;