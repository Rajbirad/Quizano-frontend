
import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FlashcardComponent } from '@/components/FlashcardComponent';
import { Flashcard } from '@/lib/types';
import { LayoutGrid, LayoutPanelLeft, LayoutPanelTop, Split, Maximize2, Minimize2 } from 'lucide-react';

interface SplitScreenViewProps {
  card: Flashcard;
  notes: string;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  isBookmarked: boolean;
  onToggleBookmark: (cardId: string) => void;
  videoUrl?: string;
}

export const SplitScreenView: React.FC<SplitScreenViewProps> = ({
  card,
  notes,
  onNext,
  onPrevious,
  onRate,
  isBookmarked,
  onToggleBookmark,
  videoUrl
}) => {
  const [layout, setLayout] = useState<'split' | 'left' | 'top' | 'grid'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'video'>('notes');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const renderSecondaryPanel = () => (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'notes' | 'video')} className="w-full h-full">
      <div className="flex justify-between items-center p-2 border-b">
        <TabsList>
          <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
          <TabsTrigger value="video" className="text-xs">Video</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 ${layout === 'split' ? 'text-primary' : ''}`} 
            onClick={() => setLayout('split')}
          >
            <Split className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 ${layout === 'left' ? 'text-primary' : ''}`}
            onClick={() => setLayout('left')}
          >
            <LayoutPanelLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 ${layout === 'top' ? 'text-primary' : ''}`}
            onClick={() => setLayout('top')}
          >
            <LayoutPanelTop className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 ${layout === 'grid' ? 'text-primary' : ''}`}
            onClick={() => setLayout('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="p-3 h-[calc(100%-42px)] overflow-auto">
        <TabsContent value="notes" className="mt-0 h-full">
          <div className="prose prose-sm max-w-none h-full overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: notes }} />
          </div>
        </TabsContent>
        
        <TabsContent value="video" className="mt-0 h-full">
          {videoUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No video available for this card
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );

  // Render different layouts
  const renderSplitLayout = () => (
    <ResizablePanelGroup direction={layout === 'top' ? 'vertical' : 'horizontal'} className="h-full">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="p-2 h-full">
          <FlashcardComponent
            card={card}
            onNext={onNext}
            onPrevious={onPrevious}
            onRate={(cardId, rating) => onRate(cardId, rating)}
            isBookmarked={isBookmarked}
            onToggleBookmark={onToggleBookmark}
          />
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50} minSize={30}>
        {renderSecondaryPanel()}
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  const renderGridLayout = () => (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
      <Card className="col-span-1 row-span-1 overflow-hidden">
        <CardContent className="p-2 h-full">
          <FlashcardComponent
            card={card}
            onNext={onNext}
            onPrevious={onPrevious}
            onRate={(cardId, rating) => onRate(cardId, rating)}
            isBookmarked={isBookmarked}
            onToggleBookmark={onToggleBookmark}
            showControls={false}
          />
        </CardContent>
      </Card>
      
      <Card className="col-span-1 row-span-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <Tabs value="notes" className="h-full">
            <div className="h-full overflow-auto p-3">
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: notes }} />
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className="col-span-2 row-span-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <Tabs value="video" className="h-full">
            <div className="p-0 h-full">
              {videoUrl ? (
                <div className="aspect-video w-full h-full">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No video available for this card
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-180px)] bg-background">
      {layout === 'grid' ? renderGridLayout() : renderSplitLayout()}
    </div>
  );
};
