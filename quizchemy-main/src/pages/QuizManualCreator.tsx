import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/components/ui/ShinyText.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Sparkles, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { makeAuthenticatedJSONRequest, API_URL } from '@/lib/api-utils';

interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_blank';
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const QuizManualCreator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    }
  ]);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
          } 
        : q
    ));
  };

  const validateQuiz = (): boolean => {
    if (!quizTitle.trim()) {
      toast({
        title: "Quiz title required",
        description: "Please enter a title for your quiz.",
        variant: "destructive"
      });
      return false;
    }

    for (const question of questions) {
      if (!question.question.trim()) {
        toast({
          title: "Question text required",
          description: `Please enter text for question ${question.id}.`,
          variant: "destructive"
        });
        return false;
      }

      if (question.type === 'multiple_choice') {
        const filledOptions = question.options.filter(opt => opt.trim());
        if (filledOptions.length < 2) {
          toast({
            title: "Not enough options",
            description: `Question ${question.id} needs at least 2 options.`,
            variant: "destructive"
          });
          return false;
        }
      }

      if (!question.correctAnswer) {
        toast({
          title: "Correct answer required",
          description: `Please select the correct answer for question ${question.id}.`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  // Check if quiz has valid content (without showing toasts) for button disabling
  const isQuizValid = (): boolean => {
    if (!quizTitle.trim()) {
      return false;
    }

    for (const question of questions) {
      if (!question.question.trim()) {
        return false;
      }

      if (question.type === 'multiple_choice') {
        const filledOptions = question.options.filter(opt => opt.trim());
        if (filledOptions.length < 2) {
          return false;
        }
      }

      if (!question.correctAnswer) {
        return false;
      }
    }

    return true;
  };

  const handleCreateQuiz = async () => {
    if (!validateQuiz()) return;
    
    setIsCreating(true);
    
    try {
      // Prepare the payload for the API
      const payload = {
        title: quizTitle,
        description: quizDescription,
        questions: questions.map((q) => ({
          question: q.question,
          type: q.type,
          options: q.type === 'multiple_choice' 
            ? q.options.filter(opt => opt.trim()) 
            : q.type === 'true_false' 
            ? ['True', 'False']
            : [], // For short_answer and fill_in_blank, no options needed
          correctAnswer: q.correctAnswer,
          explanation: includeExplanations ? (q.explanation || '') : ''
        })),
        includeExplanations: includeExplanations,
        language: 'english'
      };

      // Call the backend API
      const response = await makeAuthenticatedJSONRequest(
        `${API_URL}/api/create-manual-quiz`,
        payload,
        'POST'
      );

      if (response.success && response.quiz) {
        // Store the quiz data 
        localStorage.setItem('generatedQuizData', JSON.stringify(response));
        
        // Navigate to preview page
        navigate('/app/quiz-preview', { 
          state: { 
            inputType: 'manual',
            content: quizTitle,
            settings: {
              questionType: 'Mixed',
              includeExplanations,
              language: 'english'
            },
            generatedQuiz: response.quiz
          } 
        });

        toast({
          title: "Quiz created successfully",
          description: `Created ${questions.length} questions for "${quizTitle}"`
        });
      } else {
        throw new Error(response.message || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Manual quiz creation error:', error);
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create the quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 py-4">
      <div className="flex flex-col items-center space-y-6 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative shiny-gradient">
            Manual Quiz Creator
          </span>
          <div className="absolute -right-12 top-1 hidden md:block">
            <Sparkles className="h-8 w-8 text-primary animate-pulse-gentle" />
          </div>
        </h1>
        <p className="text-base text-muted-foreground text-center max-w-2xl">
          Create your quiz questions manually with complete control over content and format.
        </p>
      </div>

      <div className="space-y-6">
        {/* Quiz Details */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quiz Title</label>
          <Input
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Enter quiz title..."
            className="w-full border-2"
          />
        </div>

        {/* Include Explanations */}
        <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-muted/30">
          <label className="text-sm font-medium">Include explanations for correct answers</label>
          <Switch
            checked={includeExplanations}
            onCheckedChange={setIncludeExplanations}
          />
        </div>

        {questions.map((question, questionIndex) => (
          <Card key={`question-card-${question.id}-${question.type}`} className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {questionIndex + 1}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({question.type.replace('_', ' ')})
                  </span>
                </CardTitle>
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  placeholder="Enter your question..."
                  rows={2}
                />
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Type</label>
                <Select 
                  key={`question-${question.id}-type-${question.type}-${renderKey}`}
                  value={question.type}
                  onValueChange={(value: string) => {
                    const typedValue = value as 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_blank';
                    
                    // Update all fields in a single state update
                    setQuestions(prevQuestions => 
                      prevQuestions.map(q => {
                        if (q.id === question.id) {
                          let newOptions: string[] = [];
                          if (typedValue === 'true_false') {
                            newOptions = ['True', 'False'];
                          } else if (typedValue === 'short_answer' || typedValue === 'fill_in_blank') {
                            newOptions = [];
                          } else {
                            newOptions = ['', '', '', ''];
                          }
                          
                          return {
                            ...q,
                            type: typedValue,
                            options: newOptions,
                            correctAnswer: ''
                          };
                        }
                        return q;
                      })
                    );
                    
                    // Force re-render
                    setRenderKey(prev => prev + 1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer Options</label>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex}>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.type === 'true_false' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer Options</label>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm">True</span>
                    </div>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm">False</span>
                    </div>
                  </div>
                </div>
              )}

              {(question.type === 'short_answer' || question.type === 'fill_in_blank') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer Format</label>
                  <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                    {question.type === 'short_answer' 
                      ? "Students will type their answer in a text field" 
                      : "Students will fill in the blank with the correct word/phrase"
                    }
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Correct Answer</label>
                {question.type === 'short_answer' || question.type === 'fill_in_blank' ? (
                  <Input
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                    placeholder={question.type === 'short_answer' ? "Enter the correct answer" : "Enter the word/phrase for the blank"}
                  />
                ) : (
                  <Select 
                    key={`${question.id}-answer`}
                    value={question.correctAnswer}
                    onValueChange={(value: string) => {
                      updateQuestion(question.id, 'correctAnswer', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.type === 'multiple_choice' 
                        ? question.options
                            .filter(opt => opt.trim())
                            .map((option, idx) => (
                              <SelectItem key={idx} value={option}>
                                {String.fromCharCode(65 + idx)}. {option}
                              </SelectItem>
                            ))
                        : ['True', 'False'].map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Explanation */}
              {includeExplanations && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation</label>
                  <Textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                    placeholder="Explain why this is the correct answer (optional)..."
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add Question Button */}
        <Button
          variant="outline"
          onClick={addQuestion}
          className="w-full py-6 text-lg border-dashed border-2"
          style={{ borderStyle: 'dashed', borderSpacing: '10px' }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Another Question
        </Button>

        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreateQuiz}
          disabled={isCreating || !isQuizValid()}
        >
          {isCreating ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 text-white animate-spin-slow" />
              Creating Quiz...
            </>
          ) : (
            <>
              Create Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuizManualCreator;