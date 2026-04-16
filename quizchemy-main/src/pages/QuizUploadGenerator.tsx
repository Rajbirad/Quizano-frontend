// Updated QuizUploadGenerator.tsx with async API integration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import VideoUploadService from '@/components/ai-chat-files/services/VideoUploadService';
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
import { validateFile } from '@/utils/file-validation';

const QuizUploadGenerator: React.FC = () => {
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
  const [difficultyLevel, setDifficultyLevel] = useState('Medium'); // Updated to match backend enum
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto'); // Add language state
  const [forceNewQuiz, setForceNewQuiz] = useState(false); // Add regenerate option
  const [showRegenerateOption, setShowRegenerateOption] = useState(false); // Show regenerate only for previously processed files
  const [displayError, setDisplayError] = useState<string | null>(null); // Error message to display
  const [showNotification, setShowNotification] = useState(false); // Control notification visibility

  // Check if current file with current params was previously processed whenever params change
  useEffect(() => {
    if (uploadedFile) {
      const wasProcessed = checkIfPreviouslyProcessed(uploadedFile);
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false); // Reset regenerate option if this combination wasn't processed before
      }
    }
  }, [uploadedFile, questionCount, difficultyLevel, questionType, includeExplanations, language]);

  // Helper function to detect video files
  const isVideoFile = (file: File): boolean => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return videoExtensions.includes(fileExtension);
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
    const processedFiles = JSON.parse(localStorage.getItem('processedQuizFiles') || '[]');
    return processedFiles.includes(signature);
  };

  const validateAndSetFile = (file: File) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', ...videoExtensions];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    const validation = validateFile(file, {
      allowedExtensions,
      customMaxSizes: {
        '.pdf': 32,
        '.mp4': 100,
        '.avi': 100,
        '.mov': 100,
        '.wmv': 100,
        '.flv': 100,
        '.webm': 100,
        '.mkv': 100
      },
      maxSizeMB: 10
    });

    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    
    // Check if this file with current params was previously processed
    const wasProcessed = checkIfPreviouslyProcessed(file);
    setShowRegenerateOption(wasProcessed);
    setForceNewQuiz(false); // Reset regenerate option when new file is selected
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setForceNewQuiz(false); // Reset regenerate option when file is removed
    setShowRegenerateOption(false); // Hide regenerate option when file is removed
  };

  const handleGenerateQuiz = async () => {
    if (!uploadedFile) {
      toast({
        title: "File required",
        description: "Please upload a file to generate questions from.",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile, uploadedFile.name);
      
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
      
      // Add other form fields
      formData.append('num_questions', questionCount.toString());
      formData.append('difficulty_level', difficultyLevel);
      formData.append('question_type', transformQuestionType(questionType));
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      formData.append('force_new_quiz', forceNewQuiz.toString());

      // Use PDF-specific endpoint
      const fileExtension = uploadedFile.name.toLowerCase().substring(uploadedFile.name.lastIndexOf('.'));
      const endpoint = fileExtension === '.pdf' ? '/api/generate-quiz-from-pdf' : '/api/generate-quiz-from-file';

        // Use the new async generation
        const data = await generateQuiz(formData, endpoint);
        
        if (data.success && data.quiz) {
          // Track this file as processed with current parameters
          const currentParams = {
            questionCount,
            difficultyLevel,
            questionType,
            includeExplanations,
            language
          };
          const signature = createFileSignature(uploadedFile, currentParams);
          const processedFiles = JSON.parse(localStorage.getItem('processedQuizFiles') || '[]');
          if (!processedFiles.includes(signature)) {
            processedFiles.push(signature);
            localStorage.setItem('processedQuizFiles', JSON.stringify(processedFiles));
          }

          // Store the quiz data and navigate
          localStorage.setItem('generatedQuizData', JSON.stringify(data));

          // Navigate to preview with the generated quiz data
          navigate('/app/quiz-preview', {
            state: {
              inputType: 'file',
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
        title="Upload & Generate Quiz"
        description="Upload your study notes, PDFs, Word files and generate personalized quiz questions with AI."
      />

      <div className="space-y-6">
        {/* Upload Section */}
        <div>
          {!uploadedFile ? (
            <div 
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-colors ${
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
                id="file-upload" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt,text/markdown,.md"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
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
                    Drag your file here, or <span className="text-primary underline">click here to upload</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: PDF, DOC, DOCX, TXT, MD files
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1 mt-3 p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">File Limits:</p>
                    <p>• PDF: Max 35MB, 100 pages</p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-3xl">
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

export default QuizUploadGenerator;