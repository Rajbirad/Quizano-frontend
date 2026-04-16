import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { makeAuthenticatedFormRequest, API_URL } from '@/lib/api-utils';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, BookText, Sparkles, X, RefreshCw, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { DifficultyLevelSelector } from '@/components/ui/DifficultyLevelSelector';
import { QuestionCountSelector } from '@/components/ui/QuestionCountSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { ErrorNotificationBanner } from '@/components/ui/ErrorNotificationBanner';
import { PageHeader } from '@/components/ui/PageHeader';

const QuizTextGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [hasConfigured, setHasConfigured] = useState(false);
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [forceNewQuiz, setForceNewQuiz] = useState(false); // Add regenerate option
  const [showRegenerateOption, setShowRegenerateOption] = useState(false); // Show regenerate only for previously processed text
  const [displayError, setDisplayError] = useState<string | null>(null); // Error message to display
  const [showNotification, setShowNotification] = useState(false); // Control notification visibility

  // Helper function to create a text signature for tracking processed content
  const createTextSignature = (text: string, params: any) => {
    // Create a hash-like signature based on text content and parameters
    const textHash = text.trim().replace(/\s+/g, ' '); // Normalize whitespace
    return `text_${textHash.length}_${JSON.stringify(params)}_${textHash.slice(0, 50)}`;
  };

  // Helper function to check if text with same params was previously processed
  const checkIfPreviouslyProcessed = (text: string) => {
    const currentParams = {
      questionCount,
      difficultyLevel,
      questionType,
      includeExplanations,
      language
    };
    
    const signature = createTextSignature(text, currentParams);
    const processedTexts = JSON.parse(localStorage.getItem('processedQuizTexts') || '[]');
    return processedTexts.includes(signature);
  };

  // Check if current text with current params was previously processed whenever params or text change
  useEffect(() => {
    if (inputText.trim() && getWordCount(inputText) >= 50) {
      const wasProcessed = checkIfPreviouslyProcessed(inputText);
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false); // Reset regenerate option if this combination wasn't processed before
      }
    } else {
      setShowRegenerateOption(false);
      setForceNewQuiz(false);
    }
  }, [inputText, questionCount, difficultyLevel, questionType, includeExplanations, language]);

  // Word count calculation
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = getWordCount(inputText);
  const minWords = 120;
  const maxWords = 6000;

  const validateText = (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return "Please enter some text to generate questions from.";
    }
    
    const words = getWordCount(trimmedText);
    if (words < minWords) {
      return `Text must contain at least ${minWords} words. Currently: ${words} words.`;
    }
    
    if (words > maxWords) {
      return `Text must not exceed ${maxWords} words. Currently: ${words} words.`;
    }
    
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setValidationError(validateText(text));
  };

  const handleGenerateQuiz = async () => {
    const validationError = validateText(inputText);
    if (validationError) {
      setValidationError(validationError);
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
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

      // Create FormData
      const formData = new FormData();
      formData.append('content', inputText);
      formData.append('num_questions', questionCount);
      formData.append('difficulty_level', transformDifficulty(difficultyLevel));
      formData.append('question_type', transformQuestionType(questionType));
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      formData.append('force_new_quiz', forceNewQuiz.toString()); // Add regenerate parameter

      // Use the new async generation
      const data = await generateQuiz(formData);
      
      if (data.success && data.quiz) {
        // Track this text as processed with current parameters
        const currentParams = {
          questionCount,
          difficultyLevel,
          questionType,
          includeExplanations,
          language
        };
        const signature = createTextSignature(inputText, currentParams);
        const processedTexts = JSON.parse(localStorage.getItem('processedQuizTexts') || '[]');
        if (!processedTexts.includes(signature)) {
          processedTexts.push(signature);
          localStorage.setItem('processedQuizTexts', JSON.stringify(processedTexts));
        }

        navigate('/app/quiz-preview', {
          state: {
            inputType: 'text',
            content: inputText,
            settings: {
              questionCount,
              difficultyLevel,
              questionType,
              includeExplanations
            },
            generatedQuiz: data.quiz
          }
        });
      } else {
        throw new Error(data.message || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('🚨 Full error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      console.log('📝 Error message:', errorMessage);
      
      if (errorMessage.includes('Authentication required')) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate quizzes.",
          variant: "destructive"
        });
        navigate('/login');
      }
      // Check if this is a question limit error
      else if (errorMessage.includes('exceeds question limit') || errorMessage.includes('Quiz exceeds') || errorMessage.includes('maximum') || errorMessage.includes('free plan')) {
        console.log('✅ Question limit error detected, showing banner');
        // Extract the limit from error message if available
        const match = errorMessage.match(/maximum (\d+)/);
        const limit = match ? match[1] : '20';
        setDisplayError(`Free Tier allowed only ${limit} Questions. Please upgrade for more.`);
        setShowNotification(true);
      }
      // Don't show any error display for quota errors - upgrade popup will handle it
      else if (errorMessage.includes('Quota limit exceeded') || errorMessage.includes('total_limit_exceeded') || errorMessage.includes('quiz limit')) {
        console.log('ℹ️ Quota/limit error detected, upgrade popup will be shown instead');
      }
      else if (errorMessage.includes('fetch')) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to the backend API. Please check if the server is running.",
          variant: "destructive"
        });
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
      <div className="container max-w-[52rem] mx-auto px-6 py-4">
        
        {/* Question Limit Notification */}
        <ErrorNotificationBanner
          show={showNotification}
          message={displayError}
          onDismiss={() => setShowNotification(false)}
        />

        <div className="flex flex-col items-center space-y-6 mb-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative shiny-gradient">
              Transform Text into Quiz
            </span>
            <div className="absolute -right-12 top-1 hidden md:block">
              <Sparkles className="h-8 w-8 text-primary animate-pulse-gentle" />
            </div>
          </h1>
          <p className="text-base text-muted-foreground text-center max-w-2xl">
            Enter your text content and generate engaging quiz questions instantly with AI-powered analysis.
          </p>
        </div>

        <div className="space-y-6">
          {/* Text Input Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="text-input" className="text-sm font-medium">
                Enter your text content
              </Label>
              <div className="text-sm text-muted-foreground">
                <span className={`${wordCount < minWords ? 'text-red-500' : wordCount > maxWords ? 'text-red-500' : 'text-green-600'}`}>
                  {wordCount}
                </span>
                <span className="text-muted-foreground"> / {maxWords} words</span>
                {wordCount < minWords && (
                  <span className="text-red-500 ml-2">
                    (minimum {minWords} words required)
                  </span>
                )}
              </div>
            </div>
            <Textarea
              id="text-input"
              placeholder="Enter your text content here to generate questions..."
              className={`min-h-[300px] border-2 ${validationError ? 'border-red-500 focus-visible:ring-red-500' : 'border-input focus-visible:ring-primary'}`}
              value={inputText}
              onChange={handleInputChange}
            />
            {validationError && (
              <p className="text-sm text-red-500 mt-2">{validationError}</p>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              <span>
                {wordCount >= minWords ? '✓ Minimum word count met' : `Need ${minWords - wordCount} more words`}
              </span>
            </div>
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
          {/* Force New Quiz (Regenerate) - Only show when same text with same params was previously processed */}
          {showRegenerateOption && (
            <div className="p-5 border rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-full bg-white shadow-sm border border-blue-100">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-blue-900">Generate fresh questions</h4>
                    <p className="text-xs text-blue-700/70 mt-0.5">You've processed this text before - get different questions?</p>
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
            disabled={!inputText.trim() || loading || validationError !== '' || wordCount < minWords}
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

export default QuizTextGenerator;