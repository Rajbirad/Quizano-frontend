import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ShareDialog } from '@/components/ShareDialog';
import { supabase } from '@/integrations/supabase/client';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';

const API_URL = 'https://127.0.0.1:8000';
import { Loader2, ArrowLeft, Download, Copy, CheckCircle, XCircle, ChevronDown, ChevronUp, Edit3, Save, X, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import shareIcon from '/icons/share.svg?raw';
import studyIcon from '/icons/study.svg?raw';
import exportIcon from '/icons/export.svg?raw';
const QuizPreview: React.FC = () => {
  const {
    toast
  } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openQuestions, setOpenQuestions] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingQuestions, setEditingQuestions] = useState<{
    [key: string]: boolean;
  }>({});
  const [editedQuestions, setEditedQuestions] = useState<{
    [key: string]: any;
  }>({});
  const [savingQuestions, setSavingQuestions] = useState<{
    [key: string]: boolean;
  }>({});
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);

  // Get data from location state
  const {
    inputType,
    content,
    topic,
    settings,
    generatedQuiz,
    questions: directQuestions,
    quiz
  } = location.state || {};

  // Manage quizId through state so it can be updated after saving
  const [quizId, setQuizId] = useState<string | undefined>(quiz?.id || generatedQuiz?.id);
  const hasInitialized = useRef(false);
  useEffect(() => {
    // Prevent double execution in development StrictMode
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    console.log("QuizPreview mounted, state:", location.state);

    const saveQuiz = async (quizData: any) => {
      try {
        // If we already have a quiz ID from the generator (e.g., from PDF upload),
        // no need to save again
        if (quiz?.id || generatedQuiz?.id) {
          setQuizId(quiz?.id || generatedQuiz?.id);
          return;
        }

        // Create FormData with quiz details
        const formData = new FormData();
        formData.append('title', topic || 'Generated Quiz');
        formData.append('questions', JSON.stringify(quizData));
        formData.append('settings', JSON.stringify(settings || {}));
        formData.append('is_public', 'false');  // Default to private

        // Save quiz to backend
        const response = await makeAuthenticatedFormRequest(
          `${API_URL}/api/quizzes`,
          formData
        );

        if (!response.ok) {
          throw new Error('Failed to save quiz');
        }

        const savedQuiz = await response.json();
        console.log('Quiz saved:', savedQuiz);

        // Store the quiz ID
        if (savedQuiz.id) {
          setQuizId(savedQuiz.id);
        }
      } catch (err) {
        console.error('Error saving quiz:', err);
        toast({
          title: "Warning",
          description: "Quiz was loaded but couldn't be saved for sharing.",
          variant: "destructive"
        });
      }
    };

    // Check if we have the required data
    if (!location.state || !settings && !directQuestions && !quiz) {
      console.error("Missing quiz data in location state");
      setError("Quiz data is missing. Please try generating a new quiz.");
      setLoading(false);
      toast({
        title: "Error loading quiz",
        description: "Quiz data is missing. Please try generating a new quiz.",
        variant: "destructive"
      });
      return;
    }

    // Use the real quiz data from the API (new format from URL/YouTube generators)
    if (directQuestions && Array.isArray(directQuestions)) {
      // Transform API questions to match component format
      const transformedQuestions = directQuestions.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type || 'Multiple Choice',
        options: Array.isArray(q.options) ? 
          q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text) : [],
        correctAnswer: q.correctAnswer || q.correct_answer,
        explanation: q.explanation || ''
      }));
      setQuestions(transformedQuestions);
      setLoading(false);
    } else if (generatedQuiz && generatedQuiz.questions) {
      // Transform API questions to match component format (old format)
      const transformedQuestions = generatedQuiz.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type || 'Multiple Choice',
        options: Array.isArray(q.options) ? 
          q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text) : [],
        correctAnswer: q.correctAnswer || q.correct_answer,
        explanation: q.explanation || ''
      }));
      setQuestions(transformedQuestions);
      setLoading(false);
      // Save the quiz to get an ID for sharing
      saveQuiz(transformedQuestions);
    } else if (quiz && quiz.questions) {
      // Handle the new API format from video/image generators
      const transformedQuestions = quiz.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type || 'Multiple Choice',
        options: Array.isArray(q.options) ? 
          q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text) : [],
        correctAnswer: q.correctAnswer || q.correct_answer,
        explanation: q.explanation || ''
      }));
      setQuestions(transformedQuestions);
      setLoading(false);
    } else if (generatedQuiz && generatedQuiz.id && (inputType === 'anki-file' || inputType === 'file')) {
      // For Anki imports and file uploads, fetch the questions using the quiz ID
      const fetchQuizQuestions = async () => {
        try {
          const response = await makeAuthenticatedRequest(
            `/api/quizzes/${generatedQuiz.id}`,
            {
              method: 'GET',
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch quiz questions');
          }

          const quizData = await response.json();
          if (quizData.questions) {
            const transformedQuestions = quizData.questions.map((q: any) => ({
              id: q.id,
              question: q.question,
              type: q.type || 'Multiple Choice',
              options: Array.isArray(q.options) ? 
                q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text) : [],
              correctAnswer: q.correctAnswer || q.correct_answer,
              explanation: q.explanation || ''
            }));
            setQuestions(transformedQuestions);
            setLoading(false);
          } else {
            throw new Error('No questions in quiz data');
          }
        } catch (err) {
          console.error('Error fetching quiz questions:', err);
          setError("Failed to load quiz questions.");
          setLoading(false);
          toast({
            title: "Error loading quiz",
            description: "Failed to fetch quiz questions. Please try again.",
            variant: "destructive"
          });
        }
      };
      fetchQuizQuestions();
    } else {
      console.error("No quiz data found in location state");
      setError("Quiz data is missing. Please try generating a new quiz.");
      setLoading(false);
      toast({
        title: "Error loading quiz",
        description: "Quiz data is missing. Please try generating a new quiz.",
        variant: "destructive"
      });
    }
  }, [location.state, toast, topic, settings]);

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  const startEditing = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    setEditedQuestions(prev => ({
      ...prev,
      [questionId]: {
        ...question
      }
    }));
    setEditingQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
    setOpenQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
  };
  const cancelEditing = (questionId: string) => {
    setEditingQuestions(prev => ({
      ...prev,
      [questionId]: false
    }));
    setEditedQuestions(prev => {
      const newState = {
        ...prev
      };
      delete newState[questionId];
      return newState;
    });
  };
  const saveQuestion = async (questionId: string) => {
    const editedQuestion = editedQuestions[questionId];

    // Set saving state
    setSavingQuestions(prev => ({ ...prev, [questionId]: true }));

    try {
      // Create FormData with the updated question data
      const formData = new FormData();
      formData.append('question', editedQuestion.question);
      formData.append('options', JSON.stringify(editedQuestion.options));
      formData.append('correct_answer', editedQuestion.correctAnswer);
      formData.append('explanation', editedQuestion.explanation || '');

      // Save to backend
      const response = await makeAuthenticatedFormRequest(
        `${API_URL}/api/quizzes/${quizId}/questions/${questionId}`,
        formData,
        'PUT'
      );

      if (!response.ok) {
        throw new Error('Failed to save question');
      }

      // Update local state only after successful save
      setQuestions(prev => prev.map(q => q.id === questionId ? editedQuestion : q));
      setEditingQuestions(prev => ({
        ...prev,
        [questionId]: false
      }));
      setEditedQuestions(prev => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });

      toast({
        title: "Question updated",
        description: "Your changes have been saved successfully.",
        duration: 2000,
      });
    } catch (err) {
      console.error('Error saving question:', err);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Clear saving state
      setSavingQuestions(prev => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });
    }
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setEditingQuestions(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
    setEditedQuestions(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
    setOpenQuestions(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
    toast({
      title: "Question deleted",
      description: "The question has been removed from your quiz.",
      variant: "destructive"
    });
  };
  const updateEditedQuestion = (questionId: string, field: string, value: any) => {
    setEditedQuestions(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };
  const updateEditedOption = (questionId: string, optionIndex: number, value: string) => {
    setEditedQuestions(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        options: prev[questionId].options.map((opt: string, idx: number) => idx === optionIndex ? value : opt)
      }
    }));
  };
  const handleShare = () => {
    if (!quizId) {
      toast({
        title: "Cannot share quiz",
        description: "This quiz hasn't been saved yet.",
        variant: "destructive"
      });
      return;
    }
    setIsShareDialogOpen(true);
  };
  const handleStudy = () => {
    navigate('/quiz-study', {
      state: {
        questions,
        quizTitle: (inputType === 'file' || inputType === 'anki-file') ? content : (generatedQuiz?.title || topic || 'Quiz'),
        quizId
      }
    });
  };
  const handleExport = () => {
    const quizData = {
      title: (inputType === 'file' || inputType === 'anki-file') ? content : (generatedQuiz?.title || topic || 'Quiz'),
      questions: questions
    };
    const dataStr = JSON.stringify(quizData, null, 2);
    const dataBlob = new Blob([dataStr], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quizData.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Quiz exported",
      description: "Your quiz has been downloaded as a JSON file."
    });
  };
  const renderQuestionOptions = (question: any) => {
    if (question.type === 'Fill in the Blank' || question.type === 'fill-in-blank' || question.type === 'Short Answer' || question.type === 'short-answer') {
      return showAnswers ? (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-green-50 border-2 border-green-300 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Correct Answer:</span>
              <span className="text-green-700 font-medium">{question.correctAnswer}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-muted border-2 border-border">
          <p className="text-sm text-muted-foreground italic">Answer hidden. Toggle "Show Answers" to reveal.</p>
        </div>
      );
    }
    if (question.type === 'True/False') {
      return <div className="space-y-3">
          {/* Correct Answer Display */}
          {showAnswers && (
            <div className="p-4 rounded-lg bg-green-50 border-2 border-green-300 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Correct Answer:</span>
                <span className="text-green-700 font-medium">{question.correctAnswer}</span>
              </div>
            </div>
          )}
          {/* Options */}
          {question.options.map((option: string, index: number) => {
          const isCorrect = option === question.correctAnswer;
          return <div key={index} className={`p-4 rounded-lg border-2 flex items-center justify-between transition-all duration-200 ${showAnswers && isCorrect ? 'bg-green-50 border-green-300 text-green-800 shadow-md' : 'bg-card border-border text-foreground hover:border-primary/30'}`}>
                <span className="font-medium">{option}</span>
                {showAnswers && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>;
        })}
        </div>;
    }

    // Multiple Choice and Multiple Select
    return <div className="space-y-3">
        {question.options.map((option: string, index: number) => {
        const isCorrect = option === question.correctAnswer;
        return <div key={index} className={`p-4 rounded-lg border-2 flex items-center justify-between transition-all duration-200 ${showAnswers && isCorrect ? 'bg-green-50 border-green-300 text-green-800 shadow-md' : 'bg-card border-border text-foreground hover:border-primary/30'}`}>
              <span className="font-medium">{option}</span>
              {showAnswers && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>;
      })}
      </div>;
  };

  // If there's an error, show a message and a button to go back
  if (error) {
    return <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Quiz</h2>
                <p className="mb-6 text-muted-foreground">{error}</p>
                <Button onClick={() => navigate('/quiz')}>
                  Return to Quiz Generator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>;
  }
  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header with action buttons */}
        <div className="pb-6 mb-8">
          <div className="text-center">
            <h1 className="text-2xl lg:text-2xl font-bold text-zinc-800">
              {(inputType === 'file' || inputType === 'anki-file') ? content : (generatedQuiz?.title || topic || 'Quiz Preview')}
            </h1>
            {!loading && (
              <div className="flex items-center justify-center gap-8 mt-6">
                <button onClick={handleShare} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 group">
                  <div className="h-6 w-6 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: shareIcon }} />
                  <span className="text-xs font-medium">Share</span>
                </button>
                <button onClick={handleStudy} className="flex flex-col items-center gap-1 text-primary hover:text-primary/80 transition-all duration-200 group">
                  <div className="h-8 w-8 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: studyIcon }} />
                  <span className="text-xs font-semibold text-primary">Study</span>
                </button>
                <button onClick={handleExport} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 group">
                  <div className="h-6 w-6 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: exportIcon }} />
                  <span className="text-xs font-medium">Export</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your quiz...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-answers" className="text-sm font-medium cursor-pointer">
                  Show Answers
                </Label>
                <Switch
                  id="show-answers"
                  checked={showAnswers}
                  onCheckedChange={setShowAnswers}
                />
              </div>
            </div>
            <div className="space-y-4">
            {questions.map((question, index) => {
              const isOpen = openQuestions[question.id];
              const isEditing = editingQuestions[question.id];
              const editedQuestion = editedQuestions[question.id] || question;
              return (
                <Card key={question.id} className="group transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 border border-border">
                  <Collapsible open={isOpen} onOpenChange={() => !isEditing && toggleQuestion(question.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className={`transition-all duration-200 ${!isEditing ? 'cursor-pointer hover:bg-gradient-to-r hover:from-muted/30 hover:to-primary/5' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 text-sm font-semibold text-foreground mr-2">
                                {index + 1}.
                              </span>
                              <CardTitle className="text-left text-base font-medium leading-relaxed break-words">
                                {question.question}
                              </CardTitle>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!isEditing && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  startEditing(question.id);
                                }}
                                className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md text-muted-foreground transition-all duration-200 hover:scale-110 flex items-center gap-1"
                                title="Edit question"
                              >
                                <Edit3 className="h-4 w-4" />
                                <span className="text-sm">Edit</span>
                              </button>
                            )}
                            {!isEditing && (
                              <div className="transition-transform duration-200 group-hover:scale-110">
                                {isOpen ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {isEditing ? (
                          <div className="space-y-4">
                            {/* Edit Question */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Question</label>
                              <Textarea
                                value={editedQuestion.question}
                                onChange={e => updateEditedQuestion(question.id, 'question', e.target.value)}
                                className="min-h-[80px]"
                              />
                            </div>
                            {/* Edit Options */}
                            {editedQuestion.type !== 'Fill in the Blank' && editedQuestion.type !== 'fill-in-blank' && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Options</label>
                                <div className="space-y-2">
                                  {editedQuestion.options.map((option: string, optionIndex: number) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      <Input
                                        value={option}
                                        onChange={e => updateEditedOption(question.id, optionIndex, e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                      {option === editedQuestion.correctAnswer && (
                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Edit Correct Answer */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Correct Answer</label>
                              <Input
                                value={editedQuestion.correctAnswer}
                                onChange={e => updateEditedQuestion(question.id, 'correctAnswer', e.target.value)}
                                placeholder="Enter correct answer"
                              />
                            </div>
                            {/* Edit Explanation */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Explanation (Optional)</label>
                              <Textarea
                                value={editedQuestion.explanation || ''}
                                onChange={e => updateEditedQuestion(question.id, 'explanation', e.target.value)}
                                placeholder="Explain why this is the correct answer"
                                className="min-h-[60px]"
                              />
                            </div>
                            {/* Save/Cancel/Delete Buttons */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => saveQuestion(question.id)} 
                                  disabled={savingQuestions[question.id]}
                                  className="flex items-center gap-1"
                                >
                                  {savingQuestions[question.id] ? (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-3 w-3" />
                                      Save
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => cancelEditing(question.id)} 
                                  disabled={savingQuestions[question.id]}
                                  className="flex items-center gap-1"
                                >
                                  <X className="h-3 w-3" />
                                  Cancel
                                </Button>
                              </div>
                              <Button size="sm" variant="destructive" onClick={() => deleteQuestion(question.id)} className="flex items-center gap-1">
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Options and correct answer */}
                            {renderQuestionOptions(question)}
                            {/* Explanation */}
                            {question.explanation && (
                              <Collapsible>
                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                  <ChevronDown className="h-4 w-4" />
                                  Show Explanation
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-4 mt-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                                    <p className="text-blue-800 text-sm">{question.explanation}</p>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
          </>
        )}
        {/* ShareDialog integration */}
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          quizId={quizId}
        />
      </div>
    </AuthenticatedLayout>
  );
}

export default QuizPreview;