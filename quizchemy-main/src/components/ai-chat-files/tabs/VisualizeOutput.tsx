import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, BarChart3, Download, Clock } from 'lucide-react';
import { useFileContext } from '../FileContext';
import { useToast } from '@/hooks/use-toast';

export const VisualizeOutput: React.FC = () => {
  const { selectedFile } = useFileContext();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVisualization, setActiveVisualization] = useState<string | null>(null);

  const generateVisualization = async (type: string) => {
    if (!selectedFile) {
      toast({
        title: "No document selected",
        description: "Please select a document first"
      });
      return;
    }

    setIsGenerating(true);
    setActiveVisualization(type);

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: `${type} generated successfully`,
        description: "Your visualization is ready"
      });
    }, 2000);
  };

  const downloadDiagram = () => {
    toast({
      title: "Diagram downloaded",
      description: "Your diagram has been downloaded as PNG"
    });
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-pulse flex space-x-2 mb-4">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
        <p className="text-muted-foreground">Generating {activeVisualization}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Concepts in Visual Form</h2>
        <p className="text-muted-foreground">Transform your document into visual representations</p>
      </div>

      <div className="grid gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateVisualization('Flowchart')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Network className="h-5 w-5 text-primary" />
              Flowchart of Key Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Visualize connections between concepts, processes, and ideas in your document
            </p>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); generateVisualization('Flowchart'); }}>
              Generate Flowchart
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateVisualization('Chart')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Data Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Convert numerical data and statistics into charts and graphs
            </p>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); generateVisualization('Chart'); }}>
              Generate Charts
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateVisualization('Timeline')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Timeline Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Create a timeline view of events, dates, and chronological information
            </p>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); generateVisualization('Timeline'); }}>
              Generate Timeline
            </Button>
          </CardContent>
        </Card>
      </div>

      {activeVisualization && (
        <div className="flex justify-center pt-4">
          <Button onClick={downloadDiagram} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Diagram (PNG/SVG)
          </Button>
        </div>
      )}
    </div>
  );
};