import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Network, Share2, Download, FileDown, Plus, Palette, ZoomIn, ZoomOut, Info, Maximize2, Minimize2 } from 'lucide-react';
import D3MindMap, { D3MindMapRef } from '@/components/ai-chat-files/D3MindMap';
import D3MindMapExpandable, { D3MindMapExpandableRef } from '@/components/ai-chat-files/D3MindMapExpandable';
import { MindMapShareDialog } from '@/components/mindmap/MindMapShareDialog';
import { downloadSVGAsPNG, downloadSVG, downloadJSON } from '@/utils/mindmap-download';
import { mindMapThemes, getThemeById, type MindMapTheme } from '@/utils/mindmap-themes';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MindMapNode {
  name: string;
  children: MindMapNode[];
}

interface MindMapData {
  name: string;
  children: MindMapNode[];
}

const MindMapResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [mindmapId, setMindmapId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [useExpandableView, setUseExpandableView] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [conceptCanvasSize, setConceptCanvasSize] = useState({ width: 1600, height: 1200 });
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const mindMapRef = useRef<D3MindMapRef>(null);
  const expandableMindMapRef = useRef<D3MindMapExpandableRef>(null);

  const handleZoomIn = () => {
    if (useExpandableView) {
      expandableMindMapRef.current?.zoomIn();
    } else {
      mindMapRef.current?.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (useExpandableView) {
      expandableMindMapRef.current?.zoomOut();
    } else {
      mindMapRef.current?.zoomOut();
    }
  };

  useEffect(() => {
    const stateData = location.state?.mindmap;
    const stateMindmapId = location.state?.mindmap_id;
    const stateShareId = location.state?.share_id;
    
    console.log('📍 MindMapResult - Location State:', location.state);
    console.log('📋 Received Mindmap ID:', stateMindmapId);
    console.log('🔗 Received Share ID:', stateShareId);
    console.log('🗺️ Mindmap Data Structure:', JSON.stringify(stateData, null, 2));
    
    if (stateData) {
      // Extract the actual mindmap from the wrapper if it exists
      const actualMindmap = stateData.mindmap || stateData;
      setMindMapData(actualMindmap);
      setMindmapId(stateMindmapId || null);
      setShareId(stateShareId || null);
    } else {
      navigate('/app/ai-mindmap');
    }
  }, [location.state, navigate]);

  const handleDownloadPNG = async () => {
    if (!svgContainerRef.current) {
      toast({
        title: 'Error',
        description: 'Could not find mindmap to download',
        variant: 'destructive',
      });
      return;
    }

    try {
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error('SVG element not found');
      }

      const filename = `mindmap_${mindMapData?.name?.replace(/[^a-z0-9]/gi, '_') || 'export'}.png`;
      await downloadSVGAsPNG(svgElement, filename);
      
      toast({
        title: 'Download successful',
        description: 'Mind map saved as PNG',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download mind map. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadSVG = () => {
    if (!svgContainerRef.current) {
      toast({
        title: 'Error',
        description: 'Could not find mindmap to download',
        variant: 'destructive',
      });
      return;
    }

    try {
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error('SVG element not found');
      }

      const filename = `mindmap_${mindMapData?.name?.replace(/[^a-z0-9]/gi, '_') || 'export'}.svg`;
      downloadSVG(svgElement, filename);
      
      toast({
        title: 'Download successful',
        description: 'Mind map saved as SVG',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download mind map. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadJSON = () => {
    if (!mindMapData) return;

    try {
      const filename = `mindmap_${mindMapData.name?.replace(/[^a-z0-9]/gi, '_') || 'export'}.json`;
      downloadJSON(mindMapData, filename);
      
      toast({
        title: 'Download successful',
        description: 'Mind map data saved as JSON',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download mind map data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getThemeSwatches = (theme: MindMapTheme) => [
    theme.colors.root,
    theme.colors.level1,
    theme.colors.level2,
    theme.colors.level3,
    theme.colors.level4,
  ];

  if (!mindMapData) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading mind map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 bg-background overflow-hidden">
      <div className="relative h-full min-h-0 bg-white overflow-hidden">
        <div
          ref={svgContainerRef}
          className="absolute inset-0 overflow-auto thin-scrollbar bg-white"
        >
          <div
            className="relative min-w-full min-h-full bg-white"
            style={useExpandableView
              ? { width: `${conceptCanvasSize.width}px`, height: `${conceptCanvasSize.height}px` }
              : { width: '1600px', height: '1200px' }}
          >
            {useExpandableView ? (
              <D3MindMapExpandable
                ref={expandableMindMapRef}
                summary={mindMapData}
                theme={getThemeById(selectedTheme)}
                centerRootOnInitialRender={false}
                onContentSizeChange={setConceptCanvasSize}
              />
            ) : (
              <D3MindMap
                ref={mindMapRef}
                summary={mindMapData}
                theme={getThemeById(selectedTheme)}
              />
            )}
          </div>
        </div>

        <div className="absolute top-4 inset-x-0 z-10 px-6 pointer-events-none">
          <div className="mx-auto max-w-6xl relative min-h-[100px]">
            <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center gap-3">
              <div className="relative bg-gray-200/95 rounded-full p-1 inline-flex shadow-sm">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full bg-white shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out`}
                  style={{ transform: useExpandableView ? 'translateX(2px)' : 'translateX(calc(100% + 2px))' }}
                />
                <button
                  onClick={() => setUseExpandableView(true)}
                  className={`relative z-10 px-5 py-2 rounded-full font-medium text-sm transition-colors duration-300 ${
                    useExpandableView ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Concept Map
                </button>
                <button
                  onClick={() => setUseExpandableView(false)}
                  className={`relative z-10 px-5 py-2 rounded-full font-medium text-sm transition-colors duration-300 ${
                    !useExpandableView ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Radial View
                </button>
              </div>
            </div>

            <TooltipProvider>
              <div className="pointer-events-auto absolute right-0 top-0 flex items-center justify-end gap-2 rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-end gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setIsShareDialogOpen(true)}
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share</p>
                    </TooltipContent>
                  </Tooltip>

                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <Download className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleDownloadPNG}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Download as PNG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadSVG}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Download as SVG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadJSON}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Download as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-9 w-9 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 border-0 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600">
                            <Palette className="h-4 w-4 text-white" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Change Theme</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-[360px] p-3">
                      <DropdownMenuLabel className="px-1 pb-2">Theme Combinations</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {mindMapThemes.map((theme) => {
                          const isSelected = selectedTheme === theme.id;
                          return (
                            <DropdownMenuItem
                              key={theme.id}
                              onClick={() => setSelectedTheme(theme.id)}
                              className={`rounded-xl border p-2 focus:bg-transparent ${
                                isSelected
                                  ? 'border-primary ring-2 ring-primary/20'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex w-full items-center gap-1.5">
                                {getThemeSwatches(theme).map((swatchColor) => (
                                  <span
                                    key={`${theme.id}-${swatchColor}`}
                                    className="h-7 w-7 rounded-md border border-black/10"
                                    style={{ backgroundColor: swatchColor }}
                                  />
                                ))}
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    onClick={() => navigate('/app/ai-mindmap')}
                    variant="default"
                    className="rounded-full px-4 h-9 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Generate Another
                  </Button>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>

        <TooltipProvider>
          <div className="pointer-events-auto absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsFullscreen(true)}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-white/95 shadow-md"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Full Screen</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleZoomIn}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-white/95 shadow-md"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleZoomOut}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-white/95 shadow-md"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Share Dialog */}
      <MindMapShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        mindmapData={mindMapData}
        mindmapId={mindmapId}
        initialShareId={shareId}
      />

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
            <span className="font-semibold text-foreground">{mindMapData?.name?.replace(/^["']|["']$/g, '') || 'Mind Map'}</span>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleZoomIn} variant="outline" size="icon" className="h-9 w-9">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Zoom In</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleZoomOut} variant="outline" size="icon" className="h-9 w-9">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Zoom Out</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsFullscreen(false)} variant="outline" size="icon" className="h-9 w-9">
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Exit Full Screen</p></TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          <div className="flex-1 relative bg-white overflow-auto thin-scrollbar">
            <div
              className="relative min-w-full min-h-full p-4"
              style={useExpandableView
                ? { width: `${conceptCanvasSize.width}px`, height: `${conceptCanvasSize.height}px` }
                : { width: '1600px', height: '1200px' }}
            >
              {useExpandableView ? (
                <D3MindMapExpandable
                  ref={expandableMindMapRef}
                  summary={mindMapData}
                  theme={getThemeById(selectedTheme)}
                  centerRootOnInitialRender={true}
                  onContentSizeChange={setConceptCanvasSize}
                />
              ) : (
                <D3MindMap
                  ref={mindMapRef}
                  summary={mindMapData}
                  theme={getThemeById(selectedTheme)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapResult;
