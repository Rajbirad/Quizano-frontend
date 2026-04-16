import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';
import { useAsyncSimilarQuestions } from '@/hooks/use-async-similar-questions';
import { TransformedSimilarQuestion } from '@/lib/types/similar-questions';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

const QuizSimilarGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateSimilarQuestions, isProcessing, progress, error, showUpgradePopup, closeUpgradePopup, upgradeMessage } = useAsyncSimilarQuestions();
  
  const [originalQuestion, setOriginalQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [language, setLanguage] = useState('auto');
  const [validationError, setValidationError] = useState('');
  const [hasConfigured, setHasConfigured] = useState(false);
  const [forceNewQuiz, setForceNewQuiz] = useState(false);
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);

  const validateQuestion = (question: string) => {
    const trimmedQuestion = question.trim();
    
    if (!trimmedQuestion) {
      return "Please enter a quiz question to generate similar ones.";
    }

    if (trimmedQuestion.length < 10) {
      return "Please provide a more detailed question (at least 10 characters).";
    }

    const wordCount = trimmedQuestion.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 3) {
      return "Please provide at least 3 words in your question for better results.";
    }

    if (!trimmedQuestion.includes('?') && !trimmedQuestion.toLowerCase().includes('what') && 
        !trimmedQuestion.toLowerCase().includes('how') && !trimmedQuestion.toLowerCase().includes('which') && 
        !trimmedQuestion.toLowerCase().includes('when') && !trimmedQuestion.toLowerCase().includes('where') && 
        !trimmedQuestion.toLowerCase().includes('why') && !trimmedQuestion.toLowerCase().includes('who')) {
      return "Please enter a proper question. Include question words (what, how, which, etc.) or end with '?'";
    }

    return "";
  };

  // Helper function to create a question signature for tracking processed questions
  const createQuestionSignature = (question: string, params: any) => {
    const questionHash = question.trim().replace(/\s+/g, ' '); // Normalize whitespace
    return `similar_${questionHash.length}_${JSON.stringify(params)}_${questionHash.slice(0, 50)}`;
  };

  // Helper function to check if question with same params was previously processed
  const checkIfPreviouslyProcessed = (question: string) => {
    const currentParams = {
      questionCount,
      language
    };
    
    const signature = createQuestionSignature(question, currentParams);
    const processedQuestions = JSON.parse(localStorage.getItem('processedSimilarQuestions') || '[]');
    return processedQuestions.includes(signature);
  };

  // Check if current question was previously processed
  useEffect(() => {
    if (originalQuestion.trim()) {
      const wasProcessed = checkIfPreviouslyProcessed(originalQuestion);
      setShowRegenerateOption(wasProcessed);
      if (!wasProcessed) {
        setForceNewQuiz(false); // Reset regenerate option if this question wasn't processed before
      }
    }
  }, [originalQuestion, questionCount, language]);

  const handleQuestionChange = (value: string) => {
    setOriginalQuestion(value);
    setValidationError(validateQuestion(value));
    setHasConfigured(true);
  };

  // Monitor error state and show upgrade popup if quota limit exceeded
  useEffect(() => {
    if (error && (error.includes('Quota limit exceeded') || error.includes('total_limit_exceeded'))) {
      console.log('🔔 Quota limit error detected from hook, ensuring popup is visible');
    }
  }, [error]);

  // Monitor upgrade popup state changes
  useEffect(() => {
    console.log('🔔 [QuizSimilarGenerator] Upgrade popup state changed:', showUpgradePopup);
    console.log('🔔 [QuizSimilarGenerator] Upgrade message:', upgradeMessage);
  }, [showUpgradePopup, upgradeMessage]);

  const handleGenerate = async () => {
    const validationErr = validateQuestion(originalQuestion);
    if (validationErr) {
      setValidationError(validationErr);
      toast({
        title: "Validation Error",
        description: validationErr,
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if this question was processed before
      const hasProcessedBefore = false; // This should be implemented to check from storage/API
      if (hasProcessedBefore) {
        setShowRegenerateOption(true);
      }

      const questions = await generateSimilarQuestions(
        originalQuestion,
        parseInt(questionCount),
        language,
        forceNewQuiz
      );

      // Track this question as processed with current parameters
      const currentParams = {
        questionCount,
        language
      };
      const signature = createQuestionSignature(originalQuestion, currentParams);
      const processedQuestions = JSON.parse(localStorage.getItem('processedSimilarQuestions') || '[]');
      if (!processedQuestions.includes(signature)) {
        processedQuestions.push(signature);
        localStorage.setItem('processedSimilarQuestions', JSON.stringify(processedQuestions));
      }

      // Navigate to similar questions page
      navigate('/quiz/similar-questions', {
        state: {
          originalQuestion,
          similarQuestions: questions.map(q => q.question),
          language 
        }
      });
      
      toast({
        title: "Success",
        description: `Generated ${questions.length} similar questions successfully.`
      });
    } catch (err) {
      console.error('Error generating similar questions:', err);
      console.log('📍 Quota Popup State:', showUpgradePopup);
      
      // Don't show toast for quota limit errors - upgrade popup is shown instead
      const errorMessage = err instanceof Error ? err.message : (error || "Failed to generate similar questions. Please try again.");
      if (!errorMessage.includes('Quota limit exceeded') && !errorMessage.includes('total_limit_exceeded')) {
      }
      return;
    }

    setValidationError('');
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 py-6 min-h-screen overflow-x-hidden">
          <div className="flex flex-col items-center space-y-6 mb-10 max-w-full">
            <h1 className="text-4xl md:text-3xl font-bold tracking-tight text-center relative max-w-full">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative shiny-gradient">
                Generate Similar Quiz Questions
              </span>
               <div className="absolute -right-8 top-1 hidden lg:block">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </h1>
            <p className="text-muted-foreground">
              Enter a quiz question and AI will generate similar variations and question types
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Textarea 
                placeholder="Example: What is the capital of France? Enter your quiz question here and AI will generate similar variations..."
                value={originalQuestion} 
                onChange={e => handleQuestionChange(e.target.value)} 
                className={`min-h-[200px] text-base resize-none ${validationError ? 'border-destructive focus:ring-destructive' : ''}`}
              />
              <div className="min-h-[20px]">
                {validationError && (
                  <p className="text-sm text-destructive mt-1">{validationError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Select
                  value={questionCount}
                  onValueChange={(value) => setQuestionCount(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of questions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <LanguageSelector
                  value={language}
                  onValueChange={(value) => setLanguage(value)}
                  label="Language"
                  useLowercase={true}
                />
              </div>
            </div>

            {/* Generate Fresh Questions Switch */}
            <div className={`transition-all duration-300 ${showRegenerateOption ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <label className="text-sm font-medium">Generate fresh questions</label>
                </div>
                <Switch
                  checked={forceNewQuiz}
                  onCheckedChange={(checked) => {
                    setForceNewQuiz(checked);
                    setHasConfigured(true);
                  }}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={isProcessing || !!validationError || !originalQuestion.trim()} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 text-white animate-spin-slow" />
                  {progress || "Generating Quiz"}
                </>
              ) : (
                <>
                  Generate Similar Questions
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

export default QuizSimilarGenerator;