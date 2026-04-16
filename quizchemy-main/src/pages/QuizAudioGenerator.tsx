import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Upload, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAsyncQuizGeneration } from '@/hooks/use-async-quiz-generation';
import { QuizRecordingModal } from '@/components/quiz/QuizRecordingModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UpgradePopup } from '@/components/UpgradePopup';
import '@/components/ui/ShinyText.css';

const QuizAudioGenerator: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  
  // Quiz settings
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('Multiple Choice');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState('auto');
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { generateQuiz, loading, showUpgradePopup, closeUpgradePopup, upgradeMessage } = useAsyncQuizGeneration();

  // Cleanup object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleRecordingComplete = (recordedFile: File) => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const newAudioUrl = URL.createObjectURL(recordedFile);
    setAudioUrl(newAudioUrl);
    setAudioFile(recordedFile);
    
    toast({
      title: "Recording complete",
      description: "Audio recorded successfully"
    });
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const extension = file.name.toLowerCase().split('.').pop();
      const isAudio = file.type.startsWith('audio/');
      const isMp4 = file.type === 'video/mp4' || extension === 'mp4';
      const isValidExtension = ['mp3', 'wav', 'm4a', 'mp4'].includes(extension || '');
      
      if (!isValidExtension || (!isAudio && !isMp4)) {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file (MP3, WAV, M4A, or MP4)",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const newAudioUrl = URL.createObjectURL(file);
      setAudioUrl(newAudioUrl);
      setAudioFile(file);
      
      // Reset input to allow uploading the same file again
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleGenerateQuiz = async () => {
    if (!audioFile) {
      toast({
        title: "No audio file",
        description: "Please upload or record an audio file first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Transform difficulty to match API expectations
      const transformDifficulty = (level: string) => {
        const map: { [key: string]: string } = {
          'easy': 'Easy',
          'medium': 'Medium', 
          'hard': 'Hard',
          'very-hard': 'Very Hard',
          'expert': 'Expert'
        };
        return map[level] || 'Medium';
      };

      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('num_questions', questionCount);
      formData.append('difficulty_level', transformDifficulty(difficulty));
      formData.append('question_type', questionType);
      formData.append('include_explanations', includeExplanations.toString());
      formData.append('language', language);
      
      const quizData = await generateQuiz(formData, '/api/generate-quiz-from-audio');
      
      if (quizData?.quiz) {
        navigate('/app/quiz-preview', {
          state: {
            inputType: 'audio',
            content: audioFile.name,
            settings: {
              questionCount,
              difficulty,
              questionType,
              includeExplanations,
              language
            },
            generatedQuiz: quizData.quiz
          }
        });
      }
    } catch (error) {
      console.error('Error generating quiz from audio:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate quiz";
      
      if (!errorMessage.includes('quiz limit') && 
          !errorMessage.includes('Quota limit exceeded') && 
          !errorMessage.includes('total_limit_exceeded') &&
          !errorMessage.includes('upgrade your plan')) {
        toast({
          title: "Error generating quiz",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center space-y-6 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative shiny-gradient">
            Audio to Quiz
          </span>
          <div className="absolute -right-12 top-1 hidden md:block">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </h1>
        <p className="text-center text-muted-foreground max-w-xl text-base">
          Upload audio files or record your voice to generate quiz questions using AI.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Upload/Record Section */}
        {!audioFile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Upload Card */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center transition-colors border-border hover:border-primary/40 cursor-pointer"
              onClick={() => audioInputRef.current?.click()}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,.mp4"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upload Audio</h3>
                  <p className="text-sm text-muted-foreground">
                    Click to upload audio file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP3, WAV, M4A, MP4 (max 50MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Record Card */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center transition-colors border-border hover:border-primary/40 cursor-pointer"
              onClick={() => setIsRecordingModalOpen(true)}
            >
              <div className="flex flex-col items-center gap-3">
                <img src="/icons/microphone.svg" alt="Microphone" className="h-12 w-12" />
                <div>
                  <h3 className="font-semibold mb-1">Record Audio</h3>
                  <p className="text-sm text-muted-foreground">
                    Click to start recording
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Record directly from your mic
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Audio Preview */
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mic className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{audioFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAudioFile(null);
                  setAudioUrl(null);
                  setIsUploaded(false);
                }}
                className="text-destructive hover:text-destructive/90"
              >
                Remove
              </Button>
            </div>
            {audioUrl && (
              <audio controls className="w-full">
                <source src={audioUrl} />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        )}

        {/* Quiz Settings */}
        {audioFile && (
          <div className="space-y-6">
            {/* First Row: Question Type and Number of Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question-type">Question type</Label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger id="question-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                    <SelectItem value="True/False">True/False</SelectItem>
                    <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                    <SelectItem value="Short Answer">Short Answer</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-count">No of Question</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger id="question-count">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15 (For Paid Subscribers)</SelectItem>
                    <SelectItem value="20">20 (For Paid Subscribers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row: Difficulty Level and Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="very-hard">Very Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="arabic">Arabic</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Include Explanations Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="explanations">Include explanations for correct answers</Label>
              </div>
              <Switch
                id="explanations"
                checked={includeExplanations}
                onCheckedChange={setIncludeExplanations}
              />
            </div>

            <Button
              className="w-full py-6 text-lg"
              onClick={handleGenerateQuiz}
              disabled={loading || !audioFile}
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <QuizRecordingModal
        isOpen={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
        onRecordingComplete={handleRecordingComplete}
      />

      <UpgradePopup
        isOpen={showUpgradePopup}
        onClose={closeUpgradePopup}
        message={upgradeMessage}
      />
    </div>
  );
};

export default QuizAudioGenerator;
