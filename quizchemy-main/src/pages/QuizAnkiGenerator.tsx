import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { FileUp, FileText, Loader2, X, Upload, Settings, BookText, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { DifficultyLevelSelector } from '@/components/ui/DifficultyLevelSelector';
import { QuestionCountSelector } from '@/components/ui/QuestionCountSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { ErrorNotificationBanner } from '@/components/ui/ErrorNotificationBanner';
import { PageHeader } from '@/components/ui/PageHeader';

const QuizAnkiGenerator: React.FC = () => {
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
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [hasConfigured, setHasConfigured] = useState(false);
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [forceNewQuiz, setForceNewQuiz] = useState(false);
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);
  const [displayError, setDisplayError] = useState<string | null>(null); // Error message to display
  const [showNotification, setShowNotification] = useState(false); // Control notification visibility

  // Check if current file with current params was previously processed whenever params change
  useEffect(() => {
    if (uploadedFile) {
      const wasProcessed = checkIfPreviouslyProcessed(uploadedFile);
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false);
      }
    }
  }, [uploadedFile, questionCount, difficultyLevel, questionType, includeExplanations, language]);

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
      validateAndSetFile(files[0]);
    }
  };

  // Helper function to create a file signature for tracking processed files
  const createFileSignature = (file: File, params: any) => {
    return `${file.name}_${file.size}_${file.lastModified}_${JSON.stringify(params)}`;
  };

  // Helper function to check if file with same params was previously processed
  const checkIfPreviouslyProcessed = (file: File) => {
    const currentParams = {
      questionCount,
      difficultyLevel,
      questionType,
      includeExplanations,
      language
    };
    const signature = createFileSignature(file, currentParams);
    const processedFiles = JSON.parse(localStorage.getItem('processedAnkiFiles') || '{}');
    return signature in processedFiles;
  };

  // Helper function to mark file as processed
  const markFileAsProcessed = (file: File) => {
    const currentParams = {
      questionCount,
      difficultyLevel,
      questionType,
      includeExplanations,
      language
    };
    const signature = createFileSignature(file, currentParams);
    const processedFiles = JSON.parse(localStorage.getItem('processedAnkiFiles') || '{}');
    processedFiles[signature] = Date.now();
    localStorage.setItem('processedAnkiFiles', JSON.stringify(processedFiles));
  };

  const validateAndSetFile = (file: File) => {
    // Validate Anki file types
    const validExtensions = ['.apkg', '.colpkg', '.txt', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid Anki file (.apkg, .colpkg, .txt, or .csv)",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setShowRegenerateOption(false);
    setForceNewQuiz(false);
    
    // Reset file input
    const fileInput = document.getElementById('anki-file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleGenerateQuiz = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload an Anki file to generate a quiz.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('num_questions', questionCount);
      formData.append('difficulty_level', difficultyLevel);
      formData.append('question_type', questionType);
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      formData.append('force_new_quiz', forceNewQuiz.toString());

      // Use the generateQuiz hook with the Anki-specific endpoint
      const data = await generateQuiz(formData, '/api/generate-quiz-from-anki');

      if (data && data.quiz) {
        markFileAsProcessed(uploadedFile);

        // Store the quiz data and navigate
        localStorage.setItem('generatedQuizData', JSON.stringify(data));

        // Navigate to preview with the generated quiz data
        navigate('/app/quiz-preview', {
          state: {
            inputType: 'anki-file',
            content: uploadedFile.name,
            file: uploadedFile,
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
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      
      const errorMessage = error instanceof Error ? error.message : error?.message || "Please try again later.";
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
        title="Anki & Generate Quiz"
        description="Upload your Anki deck files and transform them into interactive quiz questions with AI."
      />

      <div className="space-y-6">
        {/* Upload Section */}
        <div>
          {!uploadedFile ? (
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
                id="anki-file-upload" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept=".apkg,.colpkg,.txt,.csv"
              />
              <label htmlFor="anki-file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Upload className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-muted-foreground">
                    Drag your Anki file here, or <span className="text-primary underline">click here to upload</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: APKG, COLPKG, TXT, CSV files
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">File Types Supported:</p>
                    <p>• APKG files (Anki packages)</p>
                    <p>• COLPKG files (Collection packages)</p>
                    <p>• TXT and CSV files</p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {uploadedFile.size > 1024 * 1024 
                          ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(uploadedFile.size / 1024)} KB`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemoveFile}
                  disabled={loading}
                  className="text-destructive hover:text-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                </Button>
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

        {/* Force New Quiz (Regenerate) - Only show when same file with same params was previously processed */}
        {showRegenerateOption && (
          <div className="p-5 border rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-full bg-white shadow-sm border border-blue-100">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-semibold text-blue-900">Generate fresh questions</h4>
                  <p className="text-xs text-blue-700/70 mt-0.5">You've processed this file before - get different questions?</p>
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
          disabled={!uploadedFile || loading}
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 text-white animate-spin-slow" />
              {forceNewQuiz ? "Regenerating Quiz..." : (progress || "Processing Anki Deck...")}
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
                  <BookText className="mr-2 h-5 w-5" />
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

export default QuizAnkiGenerator;