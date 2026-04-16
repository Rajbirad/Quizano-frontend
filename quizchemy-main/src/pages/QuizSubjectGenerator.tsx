import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sparkles, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { DifficultyLevelSelector } from '@/components/ui/DifficultyLevelSelector';
import { QuestionCountSelector } from '@/components/ui/QuestionCountSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { ErrorNotificationBanner } from '@/components/ui/ErrorNotificationBanner';
import { PageHeader } from '@/components/ui/PageHeader';
const QuizSubjectGenerator: React.FC = () => {
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
  const [subject, setSubject] = useState('');
  const [hasConfigured, setHasConfigured] = useState(false);
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [displayError, setDisplayError] = useState<string | null>(null); // Error to display on UI
  const [showNotification, setShowNotification] = useState(false);
  const [forceNewQuiz, setForceNewQuiz] = useState(false); // Add regenerate option
  const [showRegenerateOption, setShowRegenerateOption] = useState(false); // Show regenerate only for previously processed subjects

  // Helper function to create a signature for the subject and parameters
  const createSubjectSignature = (subject: string, params: any) => {
    const normalizedSubject = subject.toLowerCase().trim();
    return `${normalizedSubject}_${params.questionCount}_${params.difficultyLevel}_${params.questionType}_${params.includeExplanations}_${params.language}`;
  };

  // Helper function to check if subject with current params was previously processed
  const checkIfPreviouslyProcessed = (subject: string) => {
    const currentParams = { questionCount, difficultyLevel, questionType, includeExplanations, language };
    const signature = createSubjectSignature(subject, currentParams);
    const processedSubjects = JSON.parse(localStorage.getItem('processedSubjects') || '[]');
    return processedSubjects.includes(signature);
  };

  // Check if current subject with current params was previously processed whenever params change
  React.useEffect(() => {
    if (subject.trim()) {
      const wasProcessed = checkIfPreviouslyProcessed(subject.trim());
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false);
      }
    } else {
      setShowRegenerateOption(false);
      setForceNewQuiz(false);
    }
  }, [subject, questionCount, difficultyLevel, questionType, includeExplanations, language]);
  
  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject or topic to generate a quiz.",
        variant: "destructive"
      });
      return;
    }
    try {
      // Transform question type for backend compatibility
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
      
      // Convert to FormData for consistency with async hook
      const formData = new FormData();
      formData.append('content', subject.trim());
      formData.append('num_questions', questionCount);
      formData.append('difficulty_level', difficultyLevel);
      formData.append('question_type', transformQuestionType(questionType));
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      formData.append('force_new_quiz', forceNewQuiz.toString());

      // Use the new async generation
      const data = await generateQuiz(formData, '/api/generate-quiz-subject');
      
      // Track this subject as processed with current parameters
      const currentParams = { questionCount, difficultyLevel, questionType, includeExplanations, language };
      const signature = createSubjectSignature(subject.trim(), currentParams);
      const processedSubjects = JSON.parse(localStorage.getItem('processedSubjects') || '[]');
      if (!processedSubjects.includes(signature)) {
        processedSubjects.push(signature);
        localStorage.setItem('processedSubjects', JSON.stringify(processedSubjects));
      }
      
      if (data.success && data.quiz) {
        // Store the quiz data
        localStorage.setItem('generatedQuizData', JSON.stringify(data));

        // Navigate to preview page with the same structure as text generator
        navigate('/app/quiz-preview', {
          state: {
            inputType: 'subject',
            content: subject,
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
      // Don't show any error display for quota errors - upgrade popup will handle it
      else if (errorMessage.includes('Quota limit exceeded') || errorMessage.includes('total_limit_exceeded') || errorMessage.includes('quiz limit')) {
        console.log('ℹ️ Quota/limit error detected, upgrade popup will be shown instead');
      } else {
        console.log('❌ Other error, showing toast');
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
            Subject & Generate Quiz
          </span>
          <div className="absolute -right-12 top-1 hidden md:block">
            <Sparkles className="h-8 w-8 text-primary animate-pulse-gentle" />
          </div>
        </h1>
        <p className="text-base text-muted-foreground text-center max-w-2xl">
          Enter any subject or topic and AI will generate a comprehensive quiz for you
        </p>
      </div>

      <div className="space-y-6">
        {/* Subject Input Section */}
        <div>
          <Input
            placeholder="e.g., Machine Learning, World War II, Photosynthesis, JavaScript..."
            className="min-h-[60px] text-lg"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Configuration Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question Type */}
          <QuestionTypeSelector
            value={questionType}
            onValueChange={setQuestionType}
            className="space-y-2"
          />

          {/* Question Count */}
          <QuestionCountSelector
            value={questionCount}
            onValueChange={setQuestionCount}
            className="space-y-2"
            maxCount={50}
          />

          {/* Difficulty Level */}
          <DifficultyLevelSelector
            value={difficultyLevel}
            onValueChange={setDifficultyLevel}
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
          onCheckedChange={setIncludeExplanations}
        />

        {/* Force New Quiz (Regenerate) - Only show when same subject with same params was previously processed */}
        {showRegenerateOption && (
          <div className="p-5 border rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-full bg-white shadow-sm border border-blue-100">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-semibold text-blue-900">Generate fresh questions</h4>
                  <p className="text-xs text-blue-700/70 mt-0.5">You've processed this subject before - get different questions?</p>
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
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                      )}
                    </div>
                  </span>
                </button>
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  forceNewQuiz ? 'text-blue-600' : 'text-muted-foreground'
                }`}>
                  New
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGenerate}
          disabled={!subject.trim() || loading}
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 text-white animate-spin-slow" />
              {forceNewQuiz ? "Regenerating Quiz..." : (progress || "Generating Quiz")}
            </>
          ) : (
            <>
              Generate Quiz
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
export default QuizSubjectGenerator;