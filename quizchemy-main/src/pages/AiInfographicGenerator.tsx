import React, { useState, useEffect } from 'react';
import { InfographicGeneratorContainer } from '@/components/infographic/InfographicGeneratorContainer';
import { ImageIcon, Sparkles } from 'lucide-react';
import { CreditsInfo } from '@/utils/credits';
import { CreditsButton } from '@/components/CreditsButton';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';

const AiInfographicGenerator = () => {
  const { user } = useAuth();
  const { credits: creditsData } = useCredits();
  const [credits, setCredits] = useState<CreditsInfo | null>(null);

  // Update credits display when context data changes
  useEffect(() => {
    if (creditsData?.ai_infographic) {
      const aiInfographicData = creditsData.ai_infographic;
      const creditsInfo = {
        cost: 20,
        balance: aiInfographicData.balance ?? 0,
        unlimited: aiInfographicData.unlimited === true,
        transaction_id: undefined,
      };
      setCredits(creditsInfo);
    }
  }, [creditsData]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-10">
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">AI Infographic Generator</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <div className="flex-1 flex justify-end">
              <CreditsButton balance={credits?.balance} />
            </div>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Transform any content into stunning infographics. Upload files, videos, paste text, or use YouTube links to generate visual infographics.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-primary/20 rotate-12">
            <ImageIcon className="h-10 w-10" />
          </div>
        </div>
        <div className="absolute top-10 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="text-accent/30 -rotate-12">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>
      </div>
      
      <InfographicGeneratorContainer />
    </div>
  );
};

export default AiInfographicGenerator;
