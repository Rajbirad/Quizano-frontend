import React, { useState, useEffect } from 'react';
import { MindMapGeneratorContainer } from '@/components/mindmap/MindMapGeneratorContainer';
import { Network, Sparkles } from 'lucide-react';
import { CreditsButton } from '@/components/CreditsButton';
import { CreditsInfo } from '@/utils/credits';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';

const AiMindMapGenerator = () => {
  const { user } = useAuth();
  const { credits: creditsData } = useCredits();
  const [credits, setCredits] = useState<CreditsInfo | null>(null);

  // Update credits display when context data changes
  useEffect(() => {
    if (creditsData?.ai_mindmap) {
      const aiMindMapData = creditsData.ai_mindmap;
      const creditsInfo = {
        cost: 20,
        balance: aiMindMapData.balance ?? 0,
        unlimited: aiMindMapData.unlimited === true,
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
              <Network className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">AI MindMap Generator</h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
            </div>
            <div className="flex-1 flex justify-end">
              <CreditsButton balance={credits?.balance} />
            </div>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Transform any content into visual mind maps. Upload files, videos, paste text, or use YouTube links to generate interactive mind maps.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-primary/20 rotate-12">
            <Network className="h-10 w-10" />
          </div>
        </div>
        <div className="absolute top-10 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="text-accent/30 -rotate-12">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>
      </div>
      
      <MindMapGeneratorContainer />
    </div>
  );
};

export default AiMindMapGenerator;
