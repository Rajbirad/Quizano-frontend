
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConceptMapProps {
  data: {
    nodes: Array<{
      id: string;
      label: string;
      group: string;
    }>;
    links: Array<{
      source: string;
      target: string;
      label?: string;
    }>;
  };
}

export const ConceptMap: React.FC<ConceptMapProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [zoom, setZoom] = useState(1);
  
  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;
    
    // In a real implementation, this would use a library like d3.js or react-force-graph
    // Since we can't install additional packages, this is a simplified visual representation
    renderSimplifiedConceptMap();
    
  }, [data]);
  
  const renderSimplifiedConceptMap = () => {
    // This is a placeholder for a real concept map rendering
    // In a production app, you would use a proper graph visualization library
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleSave = () => {
    toast({
      title: "Concept map saved",
      description: "Your concept map has been saved successfully.",
    });
  };
  
  const handleExport = () => {
    toast({
      title: "Concept map exported",
      description: "Your concept map has been exported as an image.",
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Simple representation of a concept map */}
      <div 
        ref={containerRef} 
        className="w-full h-[500px] border rounded-md p-4 bg-white overflow-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        <div className="flex flex-col items-center">
          {/* Root node */}
          {data.nodes.length > 0 && (
            <div className="relative">
              {/* Main concept */}
              <Card className="w-40 h-16 mb-8 flex items-center justify-center bg-primary text-primary-foreground font-bold text-center p-2">
                {data.nodes[0].label}
              </Card>
              
              {/* Child nodes */}
              <div className="flex flex-wrap justify-center gap-16 mb-8">
                {data.nodes.slice(1, 4).map((node, i) => (
                  <div key={node.id} className="flex flex-col items-center">
                    <div className="w-0.5 h-8 bg-gray-300 mb-2"></div>
                    <Card className={`w-32 h-14 flex items-center justify-center text-center p-2 ${
                      node.group === 'component' ? 'bg-blue-100' : 
                      node.group === 'type' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {node.label}
                    </Card>
                    
                    {/* Subnodes */}
                    {i === 1 && (
                      <div className="flex gap-4 mt-8">
                        {data.nodes.slice(4, 7).map((subNode) => (
                          <div key={subNode.id} className="flex flex-col items-center">
                            <div className="w-0.5 h-8 bg-gray-300 mb-2"></div>
                            <Card className="w-28 h-12 flex items-center justify-center text-center p-2 bg-green-50 text-sm">
                              {subNode.label}
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {i === 2 && (
                      <div className="flex gap-4 mt-8">
                        {data.nodes.slice(7, 9).map((subNode) => (
                          <div key={subNode.id} className="flex flex-col items-center">
                            <div className="w-0.5 h-8 bg-gray-300 mb-2"></div>
                            <Card className="w-28 h-12 flex items-center justify-center text-center p-2 bg-purple-50 text-sm">
                              {subNode.label}
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        Note: This is a simplified representation. In a production environment, this would use a more sophisticated graph visualization library.
      </p>
    </div>
  );
};
