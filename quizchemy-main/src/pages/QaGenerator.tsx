import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import downloadAnim from '@/assets/download.json';
import { useNavigate } from 'react-router-dom';
import '@/components/ui/ShinyText.css';
import { trackRecentTool } from '@/utils/recentTools';
import { CreditsButton } from '@/components/CreditsButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Sparkles, Copy, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

const AiHomework: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeButton, setActiveButton] = useState<'humanize' | 'check' | null>(null);
  const [showAiCheckLoading, setShowAiCheckLoading] = useState(false);
  const [aiCheckResult, setAiCheckResult] = useState('');
  const [detectionDetails, setDetectionDetails] = useState<any>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [credits, setCredits] = useState<number>(500); // Default 500 for free tier, will sync with backend
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Fetch user credits on mount
  const fetchCredits = async () => {
    if (!session?.access_token) {
      setIsLoadingCredits(false);
      return;
    }
    try {
      const response = await fetch('/api/user/credits', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const aiHumanizeData = data?.ai_humanize;
        if (aiHumanizeData?.balance !== undefined) {
          setCredits(aiHumanizeData.balance);
          setIsUnlimited(aiHumanizeData.unlimited === true);
        }
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [session]);

  // Show upgrade prompt when credits are low
  const showUpgradePrompt = () => {
    setShowUpgradeDialog(true);
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to humanize");
      return;
    }

    if (inputWordCount < MIN_WORDS) {
      toast.error(`Please enter at least ${MIN_WORDS} words to humanize.`);
      return;
    }

    if (inputWordCount > MAX_WORDS) {
      toast.error(`Text exceeds the ${MAX_WORDS}-word limit. Please shorten your content.`);
      return;
    }

    if (!session?.access_token) {
      toast.error("Please log in to use this feature");
      return;
    }

    // Check if user has minimum credits (skip for unlimited users)
    if (!isUnlimited && credits < 120) {
      toast.error(`Insufficient credits. You have ${credits} credits remaining.`);
      showUpgradePrompt();
      return;
    }

    setIsProcessing(true);
    setActiveButton('humanize');

    try {
      const response = await fetch('/api/ai-detector/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          text: inputText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Log the API response for debugging
      console.log('Humanize API response:', data);
      
      // Update credits from /api/user/credits
      if (data.credits) {
        const { cost, unlimited } = data.credits;
        await fetchCredits();

        if (!unlimited) {
          trackRecentTool('/app/ai-humanizer');
          toast.success(`Text humanized! ${cost} credits deducted.`);
        } else {
          trackRecentTool('/app/ai-humanizer');
          toast.success('Text humanized! (Unlimited plan)');
        }
      }
      
      // Check if the API returned an error
      if (data.error || data.success === false) {
        throw new Error(data.message || data.error || 'API returned an error');
      }
      
      // Extract humanized text - API now returns humanized_texts array
      let humanizedText;
      if (data.humanized_texts && Array.isArray(data.humanized_texts)) {
        humanizedText = data.humanized_texts[0]; // Get first result from array
      } else if (Array.isArray(data)) {
        humanizedText = data[0]; // Get first result from array
      } else {
        humanizedText = data.humanized_text || data.text || data.result || data.content;
      }
      
      if (!humanizedText) {
        console.error('No humanized text found in response:', data);
        throw new Error('No humanized text returned from API');
      }
      
      setOutputText(humanizedText);
    } catch (error) {
      console.error('Error humanizing text:', error);
      toast.error("Failed to humanize text. Please try again.");
    } finally {
      setIsProcessing(false);
      setActiveButton(null);
    }
  };



  const handleCheckForAI = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to check");
      return;
    }

    if (inputWordCount < MIN_WORDS) {
      toast.error(`Please enter at least ${MIN_WORDS} words to check.`);
      return;
    }

    if (inputWordCount > MAX_WORDS) {
      toast.error(`Text exceeds the ${MAX_WORDS}-word limit. Please shorten your content.`);
      return;
    }

    if (!session?.access_token) {
      toast.error("Please log in to use this feature");
      return;
    }

    // Check if user has minimum credits (skip for unlimited users)
    if (!isUnlimited && credits < 120) {
      toast.error(`Insufficient credits. You have ${credits} credits remaining.`);
      showUpgradePrompt();
      return;
    }

    setIsProcessing(true);
    setActiveButton('check');
    setShowAiCheckLoading(true);
    setAiCheckResult('');
    setDetectionDetails(null);

    try {
      const response = await fetch('/api/ai-detector/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          text: inputText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update credits from /api/user/credits
      if (data.credits) {
        const { cost, unlimited } = data.credits;
        await fetchCredits();

        if (!unlimited) {
          toast.success(`AI check complete! ${cost} credits deducted.`);
        } else {
          toast.success('AI check complete! (Unlimited plan)');
        }
      }
      
      // Log the API response for debugging
      console.log('Check API response:', data);
      console.log('Details object:', data.details);
      console.log('API response inside details:', data.details?.api_response);
      console.log('Sentences:', data.details?.api_response?.sentences);
      
      if (data.success && data.details) {
        // Set the AI percentage from the API response
        const aiPercentage = data.ai_percentage || 0;
        setAiCheckResult(`${aiPercentage}`);
        
        // Store detection details for rendering
        setDetectionDetails(data.details);
        
        // Show success message
        toast.success('AI detection analysis completed');
      } else {
        console.error('Response validation failed:', { 
          success: data.success, 
          hasDetails: !!data.details,
          details: data.details 
        });
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error checking for AI:', error);
      toast.error("Failed to check for AI. Please try again.");
      setShowAiCheckLoading(false);
    } finally {
      setIsProcessing(false);
      setActiveButton(null);
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast.success("Copied to clipboard!");
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    if (type === 'up') {
      toast.success('Thank you for your positive feedback!');
    } else {
      toast.info('Thank you for your feedback. We\'ll work on improving!');
    }
  };

  const MIN_WORDS = 25;
  const RECOMMENDED_WORDS = 250;
  const MAX_WORDS = 2000;
  const inputWordCount = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const outputWordCount = outputText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isOverLimit = inputWordCount > MAX_WORDS;
  const isBelowMin = inputText.trim().length > 0 && inputWordCount < MIN_WORDS;
  const showRecommendation = !isBelowMin && !isOverLimit && inputWordCount > 0 && inputWordCount < RECOMMENDED_WORDS;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="relative mb-10">
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="flex items-center justify-between w-full max-w-6xl">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <Edit className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">AI Humanizer</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <div className="flex-1 flex justify-end">
              <CreditsButton balance={credits} isLoading={isLoadingCredits} isUnlimited={isUnlimited} />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-600 max-w-xl mx-auto mt-2 font-medium">
            Transform AI-generated text into natural, human-like content that seamlessly bypasses all AI detection systems
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-primary/20 rotate-12">
            <Edit className="h-10 w-10" />
          </div>
        </div>
        <div className="absolute top-10 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="text-accent/30 -rotate-12">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto">
          <div className={`grid grid-cols-1 ${outputText ? 'lg:grid-cols-2' : ''} gap-1`}>
            {/* Left Section */}
            <div className="lg:pr-1 flex flex-col">
              <div className="relative mb-4">
                <Textarea
                  placeholder="Enter your text here to humanize or check for AI content..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`h-[480px] w-full resize-none pr-4 pb-8 mx-4 border-2 rounded-2xl transition-colors ${
                    isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'
                  }`}
                />
                <div className={`absolute bottom-2 right-3 bg-background/80 px-2 py-1 rounded text-xs font-medium ${
                  isOverLimit ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {inputWordCount} / {MAX_WORDS} Words
                </div>
                {isBelowMin && (
                  <div className="absolute bottom-2 left-6 bg-background/80 px-2 py-1 rounded text-xs text-amber-500 font-medium">
                    Minimum {MIN_WORDS} words required
                  </div>
                )}
                {showRecommendation && (
                  <div className="absolute bottom-2 left-6 bg-background/80 px-2 py-1 rounded text-xs text-blue-500 font-medium">
                    💡 For accurate results, use 250+ words
                  </div>
                )}
                {isOverLimit && (
                  <div className="absolute bottom-2 left-6 bg-background/80 px-2 py-1 rounded text-xs text-red-500 font-medium">
                    {inputWordCount - MAX_WORDS} words over limit
                  </div>
                )}
              </div>
              
              <div className="flex justify-end items-center">
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleCheckForAI}
                    disabled={isProcessing || !inputText.trim() || isOverLimit || isBelowMin}
                    className={`group relative overflow-hidden w-40 py-5 text-base bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 rounded-xl ${
                      activeButton === 'check' ? 'ring-2 ring-accent/50' : ''
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {isProcessing && activeButton === 'check' ? 'Checking...' : 'Check for AI'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                  <Button
                    onClick={handleHumanize}
                    disabled={isProcessing || !inputText.trim() || isOverLimit || isBelowMin}
                    className={`group relative overflow-hidden w-40 py-5 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 rounded-xl ${
                      activeButton === 'humanize' ? 'ring-2 ring-primary/50' : ''
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      {isProcessing && activeButton === 'humanize' ? 'Humanizing...' : 'Humanize'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Section - Only show when there's output */}
            {outputText && (
              <div className="lg:pl-1 flex flex-col">
                <p className="text-sm font-semibold text-muted-foreground mb-2 ml-4">Humanized Text</p>
                <div className="relative mb-4">
                  <Textarea
                    placeholder="Your humanized text will appear here."
                    value={outputText}
                    readOnly
                    className="h-[480px] w-full resize-none bg-muted/50 pr-4 pb-8 mx-4 border-2 border-border rounded-2xl"
                  />
                  <div className="absolute bottom-2 right-3 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground">
                    {outputWordCount} Words
                  </div>
                </div>
                
                <div className="flex justify-end items-center">
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
      </div>

      {/* Popular Use Cases */}
      <div className="mt-28">
        <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/content-lecture.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">Academic Writing</h3>
              <p className="text-muted-foreground">
                Humanize AI-generated essays and research papers to pass detection
              </p>
            </Card>
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/meeting-notes.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">Content Creation</h3>
              <p className="text-muted-foreground">
                Make AI-generated content sound more natural and human-like
              </p>
            </Card>
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/research-analysis.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">Professional Documents</h3>
              <p className="text-muted-foreground">
                Ensure business content maintains authenticity and human touch
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Check Loading Overlay */}
      {showAiCheckLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-5xl mx-4 relative max-h-[90vh] overflow-hidden flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setShowAiCheckLoading(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <XCircle className="h-6 w-6" />
            </button>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left side - Text with highlighting */}
              <div className="flex-1 p-8 overflow-y-auto border-r">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Analyzed Text</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {detectionDetails?.api_response?.text_words || inputText.split(' ').length} Words
                  </p>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {detectionDetails?.api_response?.sentences ? (
                    <div className="p-4 rounded-md leading-relaxed text-gray-900">
                      {(() => {
                        const normalizeSentence = (value: string) =>
                          value
                            .toLowerCase()
                            .replace(/[\r\n]+/g, ' ')
                            .replace(/[#*_`>\-]+/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();

                        const aiSentencesRaw = Array.isArray(detectionDetails.api_response.sentences)
                          ? detectionDetails.api_response.sentences
                          : [];
                        const aiSentencesNormalized = new Set(
                          aiSentencesRaw
                            .map((sentence: string) => normalizeSentence(sentence))
                            .filter(Boolean)
                        );

                        const allSentences = inputText
                          .split(/(?<=[.!?])\s+|\n+/)
                          .map((sentence: string) => sentence.trim())
                          .filter(Boolean);

                        const aiPercentNumber = Number(aiCheckResult || 0);
                        const shouldHighlightAll = aiPercentNumber >= 95;

                        return allSentences.map((sentence: string, index: number) => {
                          const normalizedSentence = normalizeSentence(sentence);
                          const isSentenceMatch = aiSentencesNormalized.has(normalizedSentence) ||
                            Array.from(aiSentencesNormalized).some((aiSentence) => {
                              if (!aiSentence || !normalizedSentence) return false;
                              if (aiSentence.length < 25 || normalizedSentence.length < 25) return false;
                              return normalizedSentence.includes(aiSentence.slice(0, 60)) ||
                                aiSentence.includes(normalizedSentence.slice(0, 60));
                            });

                          const isAI = shouldHighlightAll || isSentenceMatch;
                          
                          return (
                            <span
                              key={index}
                              className={isAI ? "bg-orange-200 text-gray-900 px-1 py-0.5 rounded" : "text-gray-900"}
                              style={{ display: 'inline', lineHeight: '1.8' }}
                            >
                              {sentence}{' '}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <p className="p-4 rounded-md leading-relaxed text-gray-900 whitespace-pre-wrap">
                      {inputText}
                    </p>
                  )}
                </div>
                
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => handleFeedback('up')}
                    className={`p-2 rounded-md transition-colors ${
                      feedback === 'up' 
                        ? 'bg-green-100 hover:bg-green-200' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="text-2xl">👍</span>
                  </button>
                  <button 
                    onClick={() => handleFeedback('down')}
                    className={`p-2 rounded-md transition-colors ${
                      feedback === 'down' 
                        ? 'bg-red-100 hover:bg-red-200' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="text-2xl">👎</span>
                  </button>
                </div>
                
                {aiCheckResult && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Analysis complete</span>
                  </div>
                )}
              </div>
              
              {/* Right side - Detection results */}
              <div className="w-96 p-8 overflow-y-auto">
                <div className="text-center mb-6">                  
                  {/* Large percentage display */}
                  
                  
                  {/* Show results when available */}
                  {aiCheckResult ? (
                    <>
                      {/* Circular/Donut chart */}
                      <div className="mb-6 flex justify-center">
                        <div className="relative w-48 h-48">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            {/* Background circle (gradient blue for Human) */}
                            <defs>
                              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#22d3ee" />
                              </linearGradient>
                            </defs>
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="url(#blueGradient)"
                              strokeWidth="12"
                            />
                            {/* AI percentage arc (always orange) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#fb923c"
                              strokeWidth="12"
                              strokeDasharray={`${(parseInt(aiCheckResult) / 100) * 251.2} 251.2`}
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Center text */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-400">
                                {aiCheckResult}%
                              </div>
                              <div className="text-xs text-muted-foreground leading-tight">
                                of text is<br />likely AI
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Category breakdown */}
                      <div className="space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-orange-400"></div>
                            <span className="text-sm">AI-generated</span>
                            <button 
                              className="text-muted-foreground hover:text-foreground"
                              title="Text likely generated by AI, like ChatGPT or Gemini."
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                            <span className="text-sm font-medium">{parseInt(aiCheckResult) || 0}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                            <span className="text-sm">Human-written</span>
                            <button 
                              className="text-muted-foreground hover:text-foreground"
                              title="Text likely written by humans without the help of AI or paraphrasing tools."
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{100 - parseInt(aiCheckResult)}%</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Loading state */
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="w-40 h-40">
                        <Lottie animationData={downloadAnim} loop={true} />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-lg font-semibold">Checking...</p>
                        <p className="text-sm text-muted-foreground">Analyzing your text for AI patterns</p>
                      </div>
                      <div className="w-full max-w-xs">
                        <Progress value={undefined} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Credits
            </DialogTitle>
            <DialogDescription className="pt-4">
              You have <span className="font-semibold text-foreground">{credits} credits</span> remaining. This is not enough for another AI check.
              <br /><br />
              Would you like to upgrade to get more credits?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowUpgradeDialog(false);
                navigate('/pricing');
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
            >
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiHomework;