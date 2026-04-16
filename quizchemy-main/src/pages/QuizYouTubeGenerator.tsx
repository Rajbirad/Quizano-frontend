import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMediaUpload } from '@/utils/media-utils';
import { Youtube, Loader2, X, BookText, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { DifficultyLevelSelector } from '@/components/ui/DifficultyLevelSelector';
import { QuestionCountSelector } from '@/components/ui/QuestionCountSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { ErrorNotificationBanner } from '@/components/ui/ErrorNotificationBanner';
import { PageHeader } from '@/components/ui/PageHeader';
import { checkIfPreviouslyProcessed, markAsProcessed, STORAGE_KEYS } from '@/utils/quiz-processing';

const QuizYouTubeGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateYoutubeUrl } = useMediaUpload();
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
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [hasConfigured, setHasConfigured] = useState(false);
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [forceNewQuiz, setForceNewQuiz] = useState(false); // Add regenerate option
  const [showRegenerateOption, setShowRegenerateOption] = useState(false); // Show regenerate only for previously processed URLs
  const [displayError, setDisplayError] = useState<string | null>(null); // Error message to display
  const [showNotification, setShowNotification] = useState(false); // Control notification visibility

  // Check if current YouTube URL with current params was previously processed whenever params change
  useEffect(() => {
    if (youtubeUrl && isValidUrl) {
      const wasProcessed = checkIfPreviouslyProcessed(youtubeUrl);
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false); // Reset regenerate option if this combination wasn't processed before
      }
    }
  }, [youtubeUrl, isValidUrl, questionCount, difficultyLevel, questionType, includeExplanations, language]);

  // Helper function to create a YouTube URL signature for tracking processed URLs
  const createYouTubeSignature = (url: string, params: any) => {
    // Normalize YouTube URL to extract video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : url;
    return `youtube_${videoId}_${JSON.stringify(params)}`;
  };

  // Helper function to check if YouTube URL with same params was previously processed
  const checkIfPreviouslyProcessed = (url: string) => {
    const currentParams = {
      questionCount,
      difficultyLevel,
      questionType,
      includeExplanations,
      language
    };
    
    const signature = createYouTubeSignature(url, currentParams);
    const processedYouTubeUrls = JSON.parse(localStorage.getItem('processedQuizYouTube') || '[]');
    return processedYouTubeUrls.includes(signature);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    
    if (!url.trim()) {
      setIsValidUrl(false);
      setYoutubeError('');
      return;
    }
    
    const validation = validateYoutubeUrl(url);
    setIsValidUrl(validation.isValid);
    setYoutubeError(validation.error);
  };

  const handleRemoveVideo = () => {
    setYoutubeUrl('');
    setIsValidUrl(false);
  };

  const handleGenerateQuiz = async () => {
    if (!youtubeUrl.trim() || !isValidUrl) {
      return;
    }

    try {
      // Transform values to match API expectations
      const transformDifficulty = (level: string) => {
        const map: { [key: string]: string } = {
          'easy': 'Easy',
          'medium': 'Medium', 
          'hard': 'Hard',
          'very-hard': 'Very Hard',
          'mixed': 'Mixed'
        };
        return map[level] || 'Medium';
      };

      const transformQuestionType = (type: string) => {
        const map: { [key: string]: string } = {
          'multiple-choice': 'Multiple Choice',
          'true-false': 'True/False',
          'short-answer': 'Short Answer',
          'fill-in-blank': 'Fill in the Blank',
          'mixed': 'Mixed'
        };
        return map[type] || 'Multiple Choice';
      };

      const formData = new FormData();
      formData.append('youtube_url', youtubeUrl);
      formData.append('topic', 'general');
      formData.append('num_questions', questionCount);
      formData.append('difficulty_level', transformDifficulty(difficultyLevel));
      formData.append('question_type', transformQuestionType(questionType));
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      formData.append('force_new_quiz', forceNewQuiz.toString()); // Add regenerate parameter

      // Use the new async generation
      const data = await generateQuiz(formData, '/api/generate-quiz-from-youtube');
      
      if (data.success && data.quiz) {
        // Track this YouTube URL as processed with current parameters
        const currentParams = {
          questionCount,
          difficultyLevel,
          questionType,
          includeExplanations,
          language
        };
        const signature = createYouTubeSignature(youtubeUrl, currentParams);
        const processedYouTubeUrls = JSON.parse(localStorage.getItem('processedQuizYouTube') || '[]');
        if (!processedYouTubeUrls.includes(signature)) {
          processedYouTubeUrls.push(signature);
          localStorage.setItem('processedQuizYouTube', JSON.stringify(processedYouTubeUrls));
        }

        // Store the quiz data
        localStorage.setItem('generatedQuizData', JSON.stringify(data));

        navigate('/app/quiz-preview', {
          state: {
            inputType: 'youtube',
            content: youtubeUrl,
            mediaType: 'youtube',
            mediaUrl: youtubeUrl,
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
      
      const errorMessage = error instanceof Error ? error.message : "Failed to generate quiz. Please try again.";
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
          title: "Error generating quiz",
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

        <PageHeader
          title="YouTube Learning Quiz"
          description="Transform any YouTube video into an interactive quiz. Perfect for educational content and skill assessment."
        />

        <div className="space-y-6">
          {/* YouTube URL Input Section */}
          {!isValidUrl && (
            <>
              <div className="space-y-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a2.9 2.9 0 0 0-2.04-2.054C19.644 3.6 12 3.6 12 3.6s-7.644 0-9.458.532A2.9 2.9 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.9 2.9 0 0 0 2.04 2.054C4.356 20.4 12 20.4 12 20.4s7.644 0 9.458-.532a2.9 2.9 0 0 0 2.04-2.054C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.75 12l-6 3.568z"/>
                  </svg>
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={handleUrlChange}
                    className={`pl-12 h-12 ${
                      youtubeError ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                {youtubeError ? (
                  <p className="text-sm text-red-600">{youtubeError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                  </p>
                )}
              </div>
            </>
          )}

          {/* YouTube Video Preview */}
          {isValidUrl && youtubeUrl && (
            <div className="rounded-lg overflow-hidden bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Youtube className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-medium">YouTube Video Preview</p>
                    <p className="text-sm text-muted-foreground">Ready to generate quiz questions</p>
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
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={getYoutubeEmbedUrl(youtubeUrl)}
                  className="w-full h-full"
                  allowFullScreen
                  title="YouTube video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}

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
              onValueChange={setLanguage}
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

          {/* Force New Quiz (Regenerate) - Only show when same YouTube URL with same params was previously processed */}
          {showRegenerateOption && (
            <div className="p-5 border rounded-xl bg-gradient-to-r from-red-50/80 to-pink-50/80 border-red-200/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-full bg-white shadow-sm border border-red-100">
                    <RefreshCw className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-red-900">Generate fresh questions</h4>
                    <p className="text-xs text-red-700/70 mt-0.5">You've processed this YouTube video before - get different questions?</p>
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
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      forceNewQuiz 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25' 
                        : 'bg-gradient-to-r from-gray-200 to-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                        forceNewQuiz ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    >
                      <div className={`flex items-center justify-center h-full w-full ${
                        forceNewQuiz ? 'text-red-600' : 'text-green-600'
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
                    forceNewQuiz ? 'text-red-600' : 'text-muted-foreground'
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
            disabled={!youtubeUrl.trim() || !isValidUrl || loading}
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

export default QuizYouTubeGenerator;