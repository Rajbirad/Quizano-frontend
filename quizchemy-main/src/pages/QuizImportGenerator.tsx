import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, FileText, Upload, Loader2, X, Sparkles, RefreshCw, BookText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { QuestionTypeSelector } from '@/components/ui/QuestionTypeSelector';
import { IncludeExplanationsSwitch } from '@/components/ui/IncludeExplanationsSwitch';
import { PageHeader } from '@/components/ui/PageHeader';

const QuizImportGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Quiz generation settings
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [forceNewQuiz, setForceNewQuiz] = useState(false);
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);

  // Check if current file with current params was previously processed whenever params change
  React.useEffect(() => {
    if (file) {
      const wasProcessed = checkIfPreviouslyProcessed(file);
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false);
      }
    }
  }, [file, questionType, includeExplanations, language]);

  // Helper function to create a file signature for tracking processed files
  const createFileSignature = (file: File, params: any) => {
    return `${file.name}_${file.size}_${file.lastModified}_${JSON.stringify(params)}`;
  };

  // Helper function to check if file with same params was previously processed
  const checkIfPreviouslyProcessed = (file: File) => {
    const currentParams = {
      questionType,
      includeExplanations,
      language
    };
    const signature = createFileSignature(file, currentParams);
    const processedFiles = JSON.parse(localStorage.getItem('processedImportFiles') || '{}');
    return signature in processedFiles;
  };

  // Helper function to mark file as processed
  const markFileAsProcessed = (file: File) => {
    const currentParams = {
      questionType,
      includeExplanations,
      language
    };
    const signature = createFileSignature(file, currentParams);
    const processedFiles = JSON.parse(localStorage.getItem('processedImportFiles') || '{}');
    processedFiles[signature] = Date.now();
    localStorage.setItem('processedImportFiles', JSON.stringify(processedFiles));
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
      const droppedFile = files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.json', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a PDF, DOC, DOCX, TXT, JSON, or CSV file. Current file: ${fileExtension}`,
        variant: "destructive"
      });
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleRemoveFile = () => {
    setFile(null);
    setShowRegenerateOption(false);
    setForceNewQuiz(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateQuiz = async () => {
    if (!file) return;
    
    try {
      // Transform question type to match backend format
      const transformQuestionType = (type: string): string => {
        const map: Record<string, string> = {
          'multiple-choice': 'Multiple Choice',
          'true-false': 'True/False',
          'short-answer': 'Short Answer',
          'fill-in-blank': 'Fill in the Blank',
          'mixed': 'Mixed'
        };
        return map[type] || 'Multiple Choice';
      };
      
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question_type', transformQuestionType(questionType));
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      formData.append('force_new_quiz', forceNewQuiz.toString());
      
      // Use the new async generation
      const data = await generateQuiz(formData, '/api/import-quiz-from-questions');
      
      if (data.success && data.quiz) {
        markFileAsProcessed(file);
        
        // Store the quiz data
        localStorage.setItem('generatedQuizData', JSON.stringify(data));
        
        // Navigate to preview page with the generated quiz
        navigate('/app/quiz-preview', { 
          state: { 
            inputType: 'import',
            content: file.name,
            file: file,
            settings: {
              questionType,
              includeExplanations,
              language
            },
            generatedQuiz: data.quiz
          } 
        });
        
        toast({
          title: "Quiz imported successfully",
          description: `Imported questions from "${file.name}"`
        });
      } else {
        throw new Error('Invalid response from quiz import');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to import questions from the file. Please try again.";
      
      // Don't show toast for quota limit errors - upgrade popup is shown instead
      if (!errorMessage.includes('Quota limit exceeded') && !errorMessage.includes('total_limit_exceeded')) {
        toast({
          title: "Import failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container max-w-[52rem] mx-auto px-6 py-4">
      
      <div className="flex flex-col items-center space-y-6 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative shiny-gradient">
            Import Quiz Questions
          </span>
          <div className="absolute -right-12 top-1 hidden md:block">
            <Sparkles className="h-8 w-8 text-primary animate-pulse-gentle" />
          </div>
        </h1>
        <p className="text-base text-muted-foreground text-center max-w-2xl">
          Upload a file containing existing quiz questions and generate a quiz with your preferred settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Section */}
        <div>
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
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
                accept=".pdf,.doc,.docx,.txt,.json,.csv"
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
                    Supports: PDF, DOC, DOCX, TXT, JSON, CSV files
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(file.size / 1024)} KB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemoveFile}
                  className="text-destructive hover:text-destructive/90"
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
            onValueChange={setQuestionType}
            className="space-y-2"
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
          onCheckedChange={setIncludeExplanations}
        />

        {/* Force New Quiz Option - shown only if file was processed before */}
        {showRegenerateOption && (
          <div className="bg-blue-50/80 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <RefreshCw className="h-5 w-5 text-white" />
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
                  onClick={() => setForceNewQuiz(!forceNewQuiz)}
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
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 text-white animate-spin-slow" />
              {forceNewQuiz ? "Regenerating Quiz..." : (progress || "Generating Quiz")}
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

export default QuizImportGenerator;