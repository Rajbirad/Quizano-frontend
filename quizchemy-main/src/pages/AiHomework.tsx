import React, { useState, useEffect } from 'react';
import '@/components/ui/ShinyText.css';
import { CreditsButton } from '@/components/CreditsButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Sparkles, Copy, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from '@/lib/toast';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';
import { validateCreditsInResponse, extractCredits } from '@/utils/credits';
import { CreditsDisplay } from '@/components/podcast-generator/CreditsDisplay';
import { CreditsInfo } from '@/utils/credits';
import { useCredits } from '@/contexts/CreditsContext';

const AiHomework: React.FC = () => {
  const { credits: creditsData } = useCredits();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeButton, setActiveButton] = useState<'humanize' | 'check' | null>(null);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiDetectionResult, setAiDetectionResult] = useState<any>(null);
  const [credits, setCredits] = useState<CreditsInfo | null>(null);

  // Update credits display when context data changes
  useEffect(() => {
    if (creditsData?.ai_detection) {
      const aiDetectionData = creditsData.ai_detection;
      const creditsInfo = {
        cost: 1,
        balance: aiDetectionData.balance,
        unlimited: aiDetectionData.unlimited === true,
        transaction_id: undefined,
      };
      setCredits(creditsInfo);
    }
  }, [creditsData]);

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to humanize");
      return;
    }

    setIsProcessing(true);
    setActiveButton('humanize');

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock humanized text - in real implementation, this would call an API
      const humanizedText = inputText
        .replace(/\b(AI|artificial intelligence)\b/gi, 'advanced technology')
        .replace(/\b(algorithm)\b/gi, 'process')
        .replace(/\b(machine learning)\b/gi, 'pattern recognition')
        .replace(/\b(furthermore|moreover|additionally)\b/gi, 'also')
        .replace(/\b(utilize)\b/gi, 'use')
        .replace(/\b(facilitate)\b/gi, 'help');
      
      setOutputText(humanizedText);
      toast.success("Text humanized successfully!");
    } catch (error) {
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

    setIsProcessing(true);
    setActiveButton('check');

    try {
      const formData = new FormData();
      formData.append('text', inputText);

      console.log('🔐 Submitting text for AI detection:', { textLength: inputText.length });
      
      const response = await makeAuthenticatedFormRequest('/api/ai-detector/check', formData);

      console.log('📡 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📡 AI detection result:', result);

      // ✅ Check for credits information in response
      const creditsError = validateCreditsInResponse(result);
      if (creditsError) {
        console.warn('⚠️ Credits issue detected:', creditsError);
        toast.error(creditsError);
        return;
      }

      // Log credits if available and update state
      const creditsInfo = extractCredits(result);
      if (creditsInfo) {
        setCredits(creditsInfo);
        console.log('💰 Credits updated after AI check:', creditsInfo);
      }

      if (result.success && result.analysis) {
        setAiDetectionResult(result);
        setShowAiDialog(true);
        toast.success("AI check completed!");
      } else {
        throw new Error(result.message || 'AI detection failed');
      }
    } catch (error: any) {
      console.error('❌ AI detection error:', error);
      toast.error(error.message || "Failed to check for AI. Please try again.");
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

  const inputWordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const outputWordCount = outputText.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-10">
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <Edit className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold gradient-text shiny-gradient">AI Humanizer</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <div className="flex-1 flex justify-end">
              <CreditsButton balance={credits?.balance} />
            </div>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Humanize AI-generated text and check content for AI detection patterns.
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

      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:divide-x lg:divide-border">
            {/* Left Section */}
            <div className="lg:pr-6 flex flex-col">
              <Textarea
                placeholder="Enter your text here to humanize or check for AI content..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] resize-none flex-1 mb-4"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{inputWordCount} / 2500 Words</span>
                <div className="flex gap-3">
                  <Button
                    onClick={handleHumanize}
                    disabled={isProcessing}
                    variant={activeButton === 'humanize' ? 'default' : 'outline'}
                  >
                    {isProcessing && activeButton === 'humanize' ? 'Humanizing...' : 'Humanize'}
                  </Button>
                  <Button
                    onClick={handleCheckForAI}
                    disabled={isProcessing}
                    variant={activeButton === 'check' ? 'default' : 'outline'}
                  >
                    {isProcessing && activeButton === 'check' ? 'Checking...' : 'Check for AI'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="lg:pl-6 flex flex-col">
              <Textarea
                placeholder="Your humanized text will appear here."
                value={outputText}
                readOnly
                className="min-h-[400px] resize-none bg-muted/50 flex-1 mb-4"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{outputWordCount} Words</span>
                {outputText && (
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Check Results Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {aiDetectionResult?.is_ai_generated ? (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              AI Detection Results
            </DialogTitle>
          </DialogHeader>
          
          {aiDetectionResult && aiDetectionResult.analysis ? (
            <div className="space-y-6 mt-4">
              {/* Main Result */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">
                    {aiDetectionResult.analysis.detection_category}
                  </h3>
                  <p className="text-sm text-muted-foreground">{aiDetectionResult.message}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {(aiDetectionResult.confidence_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Indicators */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    AI Indicators ({aiDetectionResult.analysis.ai_indicators?.length || 0})
                  </h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {aiDetectionResult.analysis.ai_indicators?.length > 0 ? (
                      aiDetectionResult.analysis.ai_indicators.map((indicator: string, index: number) => (
                        <Badge key={index} variant="destructive" className="mr-1 mb-1">
                          {indicator}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None detected</p>
                    )}
                  </div>
                </div>

                {/* Human Indicators */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Human Indicators ({aiDetectionResult.analysis.human_indicators?.length || 0})
                  </h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {aiDetectionResult.analysis.human_indicators?.length > 0 ? (
                      aiDetectionResult.analysis.human_indicators.map((indicator: string, index: number) => (
                        <Badge key={index} variant="secondary" className="mr-1 mb-1">
                          {indicator}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Analysis Reasoning
                </h4>
                <p className="text-sm p-3 bg-muted/30 rounded-md leading-relaxed">
                  {aiDetectionResult.analysis.reasoning}
                </p>
              </div>

              {/* Recommendation */}
              {aiDetectionResult.analysis.recommendation && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Recommendation
                  </h4>
                  <p className="text-sm p-3 bg-muted/30 rounded-md leading-relaxed">
                    {aiDetectionResult.analysis.recommendation}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t">
                <span>Text Length: {aiDetectionResult.analysis.text_length} characters</span>
                <span>Threshold: {(aiDetectionResult.analysis.threshold_used * 100).toFixed(0)}%</span>
                <span>Analyzed: {new Date(aiDetectionResult.analysis.analysis_timestamp).toLocaleString()}</span>
              </div>

              {/* Copy Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    const resultText = `AI Detection Results\n\n` +
                      `Detection: ${aiDetectionResult.analysis.detection_category}\n` +
                      `Confidence: ${(aiDetectionResult.confidence_score * 100).toFixed(1)}%\n\n` +
                      `Reasoning: ${aiDetectionResult.analysis.reasoning}\n\n` +
                      `Recommendation: ${aiDetectionResult.analysis.recommendation}`;
                    navigator.clipboard.writeText(resultText);
                    toast.success("Results copied to clipboard!");
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Results
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-center text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2" />
                <p>No detection results available</p>
                <p className="text-sm">Please try the analysis again</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiHomework;