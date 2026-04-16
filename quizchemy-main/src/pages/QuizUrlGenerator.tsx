import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Link, Loader2, BookText, Sparkles, X, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { DifficultyLevelSelector } from '@/components/ui/DifficultyLevelSelector';
import { QuestionCountSelector } from '@/components/ui/QuestionCountSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { ErrorNotificationBanner } from '@/components/ui/ErrorNotificationBanner';
import { PageHeader } from '@/components/ui/PageHeader';

const QuizUrlGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateQuiz, loading, progress, error, cancelGeneration, showUpgradePopup, closeUpgradePopup, upgradeMessage } = useAsyncQuizGeneration();
  
  const [inputUrl, setInputUrl] = useState('');
  const [hasConfigured, setHasConfigured] = useState(false);
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null); // Error message to display
  const [showNotification, setShowNotification] = useState(false); // Control notification visibility

  const handleGenerateQuiz = async () => {
    if (!inputUrl.trim()) {
      setValidationError("Please enter a URL to generate questions from.");
      return;
    }

    // Basic URL validation and sanitization
    try {
      const url = new URL(inputUrl.trim());
      // Ensure HTTPS for security
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        setValidationError("Please enter a valid HTTP or HTTPS URL.");
        return;
      }
      setValidationError(null);
    } catch {
      setValidationError("Please enter a valid URL.");
      return;
    }

    try {
      const transformDifficulty = (level: string) => {
        const map: { [key: string]: string } = {
          'very-hard': 'Very Hard',
          'hard': 'Hard',
          'medium': 'Medium',
          'easy': 'Easy',
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
      formData.append('url', inputUrl.trim());
      formData.append('topic', 'general');
      formData.append('num_questions', questionCount);
      formData.append('difficulty_level', transformDifficulty(difficultyLevel));
      formData.append('question_type', transformQuestionType(questionType));
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);

      // Use the async generation hook
      const data = await generateQuiz(formData, '/api/generate-quiz-from-url');
      
      if (data.success && data.quiz) {
        navigate('/app/quiz-preview', {
          state: {
            questions: data.quiz.questions,
            quiz: {
              id: data.quiz.id,
              title: data.quiz.title
            },
            settings: {
              questionCount,
              difficultyLevel,
              questionType,
              includeExplanations
            },
            topic: data.quiz.title || 'URL Quiz'
          }
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      
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
        
        <PageHeader
          title="URL to Quiz"
          description="Enter any website URL and let AI extract key information to create challenging quiz questions."
        />

        <div className="space-y-6">
          {/* URL Input Section */}
          <div>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://example.com/article"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the full URL of the webpage you want to generate quiz questions from
            </p>
            {validationError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{validationError}</p>
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
          {/* Generate Button */}
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerateQuiz}
            disabled={!inputUrl.trim() || loading}
          >
            {loading ? (
              <>
            <Sparkles className="mr-2 h-5 w-5 text-white animate-spin-slow" />
                {progress || 'Generating Quiz...'}
              </>
            ) : (
              <>
                Generate Quiz
              </>
            )}
          </Button>
        </div>

        {/* Upgrade Popup */}
        {showUpgradePopup && (
          <UpgradePopup isOpen={showUpgradePopup} onClose={closeUpgradePopup} message={upgradeMessage} />
        )}
      </div>
  );
};

export default QuizUrlGenerator;