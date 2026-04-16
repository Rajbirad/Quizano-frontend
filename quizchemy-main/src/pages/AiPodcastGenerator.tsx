import React, { useState, useEffect } from 'react';
import { PodcastGeneratorContainer } from '@/components/podcast-generator/PodcastGeneratorContainer';
import { CreditsDisplay } from '@/components/podcast-generator/CreditsDisplay';
import { Mic, Sparkles } from 'lucide-react';
import { CreditsInfo } from '@/utils/credits';
import { CreditsButton } from '@/components/CreditsButton';
import { useCredits } from '@/contexts/CreditsContext';

const AiPodcastGenerator = () => {
  const { credits: creditsData } = useCredits();
  const [credits, setCredits] = useState<CreditsInfo | null>(null);

  // Update credits display when context data changes
  useEffect(() => {
    if (creditsData?.ai_podcast) {
      const aiPodcastData = creditsData.ai_podcast;
      const creditsInfo = {
        cost: 20,
        balance: aiPodcastData.balance,
        unlimited: aiPodcastData.unlimited === true,
        transaction_id: undefined,
      };
      setCredits(creditsInfo);
    }
  }, [creditsData]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-10">
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="flex items-center justify-between w-full max-w-7xl">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <Mic className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">AI Podcast Generator</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <div className="flex-1 flex justify-end">
              <CreditsButton balance={credits?.balance} />
            </div>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-2">
            Transform any content into engaging AI-powered podcasts. Upload files, paste text, or use website/YouTube links to generate professional podcast audio.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-primary/20 rotate-12">
            <Mic className="h-10 w-10" />
          </div>
        </div>
        <div className="absolute top-10 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="text-accent/30 -rotate-12">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>
      </div>
      
      <PodcastGeneratorContainer onCreditsUpdated={setCredits} />
    </div>
  );
};

export default AiPodcastGenerator;
