import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, X, AlertCircle } from 'lucide-react';
import '@/components/ui/ShinyText.css';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { DifficultyLevelSelector } from '@/components/ui/DifficultyLevelSelector';
import { QuestionCountSelector } from '@/components/ui/QuestionCountSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { ErrorNotificationBanner } from '@/components/ui/ErrorNotificationBanner';
import { PageHeader } from '@/components/ui/PageHeader';

const validateQuizletUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'quizlet.com' && urlObj.pathname.length > 1;
  } catch {
    return false;
  }
};

const QuizQuizletGenerator: React.FC = () => {
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
  
  const [url, setUrl] = useState("");
  const [hasConfigured, setHasConfigured] = useState(false);
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [displayError, setDisplayError] = useState<string | null>(null); // Error message to display
  const [showNotification, setShowNotification] = useState(false); // Control notification visibility

  const handleGenerateQuiz = async () => {
    if (!url.trim()) {
      toast({
        title: "Quizlet URL required",
        description: "Please enter a Quizlet URL to convert to a quiz.",
        variant: "destructive"
      });
      return;
    }

    if (!validateQuizletUrl(url)) {
      toast({
        title: "Invalid Quizlet URL",
        description: "Please enter a valid Quizlet URL (e.g., https://quizlet.com/...)",
        variant: "destructive"
      });
      return;
    }

    try {
      // Transform values to match backend expectations
      const transformDifficulty = (level: string) => {
        const map: { [key: string]: string } = {
          'medium': 'Medium',
          'easy': 'Easy',
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
      formData.append('quizlet_url', url);
      formData.append('num_questions', questionCount);
      formData.append('difficulty_level', transformDifficulty(difficultyLevel));
      formData.append('question_type', transformQuestionType(questionType));
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);

      // Use the async generation hook with Quizlet endpoint
      const data = await generateQuiz(formData, '/api/generate-quiz-from-quizlet');
      
      if (data.success && data.quiz) {
        navigate('/app/quiz-preview', {
          state: {
            questions: data.quiz.questions,
            quiz: {
              id: data.quiz.id,
              title: data.quiz.title || 'Quizlet Quiz'
            },
            settings: {
              questionCount,
              difficultyLevel,
              questionType,
              includeExplanations,
              language
            },
            topic: data.quiz.title || 'Quizlet Quiz',
            inputType: 'quizlet-url',
            content: url
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
    <div className="container max-w-[52rem] mx-auto px-6 py-4">
      
      {/* Question Limit Notification */}
      <ErrorNotificationBanner
        show={showNotification}
        message={displayError}
        onDismiss={() => setShowNotification(false)}
      />
      
      <PageHeader
        title="Quizlet & Generate Quiz"
        description="Import your Quizlet study sets and transform them into interactive quizzes with AI."
      />

      <div className="space-y-6">
        {/* URL Input Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quizlet URL</label>
          <input
            type="url"
            placeholder="https://quizlet.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Example: https://quizlet.com/123456/your-study-set-name
          </p>
        </div>

        {/* Configuration Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question Type - Custom for Quizlet with Essay option */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Question Type</label>
            <Select value={questionType} onValueChange={(value) => { setQuestionType(value); setHasConfigured(true); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <label className="text-sm font-medium">Include explanations for correct answers</label>
          <Switch
            checked={includeExplanations}
            onCheckedChange={setIncludeExplanations}
          />
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateQuiz}
          disabled={!url.trim() || loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 text-white animate-spin-slow" />
              {progress || "Processing Quizlet..."}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Quiz from Quizlet
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

export default QuizQuizletGenerator;
