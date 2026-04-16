import React from 'react';
import { InfographicUploader } from './InfographicUploader';
import { useNavigate } from 'react-router-dom';
import { trackRecentTool } from '@/utils/recentTools';
import { Card } from '@/components/ui/card';

export const InfographicGeneratorContainer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="w-full max-w-4xl mx-auto">
        <InfographicUploader
          onInfographicGenerated={(infographic, infographicId, shareId) => {
            trackRecentTool('/app/ai-infographic');
            navigate('/app/infographic-result', { 
              state: { 
                infographic,
                infographic_id: infographicId,
                share_id: shareId
              } 
            });
          }}
        />
        {/* Popular Use Cases */}
        <div className="mt-52">
          <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
          <div className="container max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-panel p-6 rounded-2xl text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/presentation-image.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Data Visualization</h3>
                <p className="text-muted-foreground">
                  Transform data and statistics into beautiful visual infographics.
                </p>
              </Card>
              <Card className="glass-panel p-6 rounded-2xl text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/content-understanding.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Educational Content</h3>
                <p className="text-muted-foreground">
                  Convert educational material into engaging visual formats.
                </p>
              </Card>
              <Card className="glass-panel p-6 rounded-2xl text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/research-analysis.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Reports & Analysis</h3>
                <p className="text-muted-foreground">
                  Create professional infographics from reports and analysis.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
