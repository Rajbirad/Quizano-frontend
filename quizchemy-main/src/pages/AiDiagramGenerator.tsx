import React, { useState, useEffect } from 'react';
import { DiagramGeneratorContainer } from '@/components/diagram/DiagramGeneratorContainer';
import { Sparkles } from 'lucide-react';
import { CreditsInfo } from '@/utils/credits';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';
import { Card } from '@/components/ui/card';
import { CreditsButton } from '@/components/CreditsButton';
import '@/components/ui/ShinyText.css';

const AiDiagramGenerator = () => {
  const { user } = useAuth();
  const { credits: creditsData } = useCredits();
  const [credits, setCredits] = useState<CreditsInfo | null>(null);

  // Update credits display when context data changes
  useEffect(() => {
    if (creditsData?.ai_diagram) {
      const aiDiagramData = creditsData.ai_diagram;
      const creditsInfo = {
        cost: 20,
        balance: aiDiagramData.balance ?? 0,
        unlimited: aiDiagramData.unlimited === true,
        transaction_id: undefined,
      };
      setCredits(creditsInfo);
    }
  }, [creditsData]);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center space-y-6 mb-10">
        <div className="flex items-center justify-between w-full max-w-7xl">
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 shiny-gradient">
                Create AI Diagram
              </span>
            </h1>
            <Sparkles className="h-7 w-7 text-primary animate-pulse-gentle" />
          </div>
          <div className="flex-1 flex justify-end">
            <CreditsButton balance={credits?.balance} />
          </div>
        </div>
        <p className="text-base text-muted-foreground text-center max-w-3xl">
          Transform your ideas into professional diagrams. Enter text and select a diagram type to create flowcharts, sequence diagrams, and more.
        </p>
      </div>
      
      <DiagramGeneratorContainer />



      {/* Popular Use Cases */}
      <div className="mt-36">
        <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/lecture.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">Flowcharts</h3>
              <p className="text-muted-foreground">
                Visualize processes and workflows with professional flowcharts.
              </p>
            </Card>
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/Research.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">System Architecture</h3>
              <p className="text-muted-foreground">
                Design and document system architectures with sequence diagrams.
              </p>
            </Card>
            <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/meeting-notes.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium">Project Planning</h3>
              <p className="text-muted-foreground">
                Create Gantt charts and project timelines for better planning.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDiagramGenerator;
