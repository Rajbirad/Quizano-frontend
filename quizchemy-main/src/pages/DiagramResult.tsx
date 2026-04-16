import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Network, Share2, Download, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mermaid from 'mermaid';

interface DiagramData {
  success: boolean;
  diagramType: string;
  mermaidCode: string;
  title: string;
  confidence: number;
  warnings: string[];
  processingTime: number;
  creditsUsed: number;
}

const DiagramResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stateData = location.state?.diagram;
    
    console.log('📍 DiagramResult - Location State:', location.state);
    
    if (stateData) {
      setDiagramData(stateData);
    } else {
      navigate('/app/ai-diagram');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (diagramData && diagramRef.current) {
      // Initialize mermaid with neutral theme
      mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        securityLevel: 'loose',
        logLevel: 'fatal',
        suppressErrors: true,
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          padding: 10,
          nodeSpacing: 30,
          rankSpacing: 40,
        },
        block: {
          padding: 20,
          nodeSpacing: 50,
          rankSpacing: 60,
        },
        themeVariables: {
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          primaryColor: '#86efac',
          primaryTextColor: '#1e293b',
          primaryBorderColor: '#22c55e',
          lineColor: '#64748b',
          secondaryColor: '#fed7aa',
          secondaryTextColor: '#1e293b',
          secondaryBorderColor: '#fb923c',
          tertiaryColor: '#bae6fd',
          tertiaryTextColor: '#1e293b',
          tertiaryBorderColor: '#38bdf8',
          noteBkgColor: '#f0abfc',
          noteTextColor: '#1e293b',
          noteBorderColor: '#d946ef',
          mainBkg: '#86efac',
          secondBkg: '#fed7aa',
          tertiaryBkg: '#bae6fd',
          nodeBorder: '#22c55e',
          clusterBkg: '#f0f9ff',
          clusterBorder: '#93c5fd',
          edgeLabelBackground: '#ffffff',
          quadrant1Fill: '#3b82f6',
          quadrant2Fill: '#60a5fa',
          quadrant3Fill: '#93c5fd',
          quadrant4Fill: '#dbeafe',
          quadrant1TextFill: '#1e293b',
          quadrant2TextFill: '#1e293b',
          quadrant3TextFill: '#1e293b',
          quadrant4TextFill: '#1e293b',
          quadrantPointFill: '#1e293b',
          quadrantPointTextFill: '#1e293b',
          quadrantXAxisTextFill: '#1e293b',
          quadrantYAxisTextFill: '#1e293b',
          quadrantTitleFill: '#1e293b',
          pie1: '#3b82f6',
          pie2: '#8b5cf6',
          pie3: '#ec4899',
          pie4: '#f59e0b',
          pie5: '#10b981',
          pie6: '#06b6d4',
          pie7: '#6366f1',
          pie8: '#f43f5e',
          pie9: '#84cc16',
          pie10: '#a855f7',
          pie11: '#0ea5e9',
          pie12: '#f97316',
          xyChart: {
            plotColorPalette: '#1e40af',
            backgroundColor: '#ffffff',
            titleColor: '#1e293b',
            xAxisLabelColor: '#64748b',
            xAxisTitleColor: '#475569',
            yAxisLabelColor: '#64748b',
            yAxisTitleColor: '#475569',
          }
        }
      });

      // Render the diagram
      const renderDiagram = async () => {
        try {
          const element = diagramRef.current;
          if (!element) return;

          // Clear previous content
          element.innerHTML = '';

          // Generate unique ID for the diagram
          const id = `mermaid-${Date.now()}`;
          
          // Fix mermaid syntax issues
          let mermaidCode = diagramData.mermaidCode;
          
          // Fix bar chart syntax - backend may send incorrect xychart-beta format
          if (diagramData.diagramType === 'bar' || mermaidCode.includes('xychart-beta')) {
            // Remove duplicate xychart-beta declarations and theme init
            mermaidCode = mermaidCode.replace(/xychart-beta\s*\n\s*%%\{[^}]+\}%%\s*\n\s*xychart-beta/g, 'xychart-beta');
            mermaidCode = mermaidCode.replace(/%%\{init:[^}]+\}%%\s*\n/g, '');
            
            // Extract all quoted strings after "label" keyword
            const labelMatches = [...mermaidCode.matchAll(/"([^"]+)"/g)];
            const categories: string[] = [];
            const dataValues: number[] = [];
            
            // Separate categories from data values
            labelMatches.forEach(match => {
              const fullMatch = match[0];
              const value = match[1];
              
              // Check if this is a data line (has : followed by number)
              const dataPattern = new RegExp(`"${value}"\\s*:\\s*(\\d+)`);
              const dataMatch = mermaidCode.match(dataPattern);
              
              if (dataMatch) {
                categories.push(value);
                dataValues.push(parseInt(dataMatch[1]));
              }
            });
            
            // Rebuild the chart with correct syntax
            if (categories.length > 0 && dataValues.length > 0) {
              const maxValue = Math.max(...dataValues) * 1.2; // Add 20% padding
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
              const colorPalette = colors.slice(0, Math.max(categories.length, 4)).join(', ');
              mermaidCode = `%%{init: {"theme":"base", "themeVariables": {"xyChart": {"plotColorPalette": "${colorPalette}"}}}}%%\nxychart-beta\n    title User Authentication Flow\n    x-axis [${categories.map(c => `"${c}"`).join(', ')}]\n    y-axis "Number of Users" 0 --> ${Math.ceil(maxValue)}\n    bar [${dataValues.join(', ')}]`;
            }
          }
          
          // Enhance XY charts to support both line and bar visualization
          if (diagramData.diagramType === 'xy') {
            // If the mermaidCode doesn't specify bar or line, add both visualizations
            if (!mermaidCode.includes(' bar ') && !mermaidCode.includes(' line ')) {
              // Parse the chart and add bar representation
              const lines = mermaidCode.split('\n');
              const newLines: string[] = [];
              let inDataSection = false;
              
              for (const line of lines) {
                newLines.push(line);
                // Check if this is a data line (contains y-axis values in square brackets)
                if (line.trim().match(/^\[.*\]$/)) {
                  inDataSection = true;
                }
              }
              
              // If no explicit chart type, it defaults to line. Add bar version too.
              // We'll keep the original line chart as is
              mermaidCode = newLines.join('\n');
            }
          }
          
          // Fix block diagram syntax - backend might send flowchart syntax with block-beta header
          // Only convert to flowchart if it contains incompatible flowchart patterns
          if (diagramData.diagramType === 'block' && mermaidCode.includes('block-beta')) {
            // Check if it's actually flowchart syntax (has graph TD or flowchart-style arrows like -->| with labels)
            if (mermaidCode.includes('graph TD') || mermaidCode.match(/-->\|[^|]+\|/)) {
              // Remove block-beta, keep as flowchart
              mermaidCode = mermaidCode.replace(/block-beta\s*\n/, '');
              // Ensure it has graph TD if not present
              if (!mermaidCode.trim().startsWith('graph TD')) {
                mermaidCode = 'graph TD\n' + mermaidCode;
              }
            }
            // Otherwise keep block-beta syntax as is (proper block diagram with columns)
          }
          
          // Fix class diagram stereotypes syntax for Mermaid
          if (diagramData.diagramType === 'class') {
            const lines = mermaidCode.split('\n');
            const processed: string[] = [];
            let i = 0;
            
            while (i < lines.length) {
              const line = lines[i].trim();
              
              // Skip empty lines
              if (!line) {
                processed.push(lines[i]);
                i++;
                continue;
              }
              
              // Pattern 0: class ClassName { with <<stereotype>> inside body
              // Example: class CustomerSupportTicket {\n    <<abstract>>\n    +members...
              const classMatch = line.match(/^(class|enum)\s+(\w+)\s*\{/);
              
              if (classMatch && !line.includes('<<')) {
                const [, keyword, className] = classMatch;
                const indent = lines[i].match(/^\s*/)?.[0] || '';
                const bodyLines: string[] = [];
                let stereotype: string | null = null;
                i++;
                let braceCount = 1;
                
                while (i < lines.length && braceCount > 0) {
                  const bodyLine = lines[i];
                  if (bodyLine.includes('{')) braceCount++;
                  if (bodyLine.includes('}')) braceCount--;
                  
                  if (braceCount > 0) {
                    // Check if this line is a stereotype annotation
                    const stereoMatch = bodyLine.trim().match(/^<<(abstract|interface|enumeration)>>$/);
                    if (stereoMatch) {
                      stereotype = stereoMatch[1];
                      // Skip this line, don't add to body
                    } else {
                      bodyLines.push(bodyLine);
                    }
                  }
                  i++;
                }
                
                processed.push(`${indent}class ${className} {`);
                processed.push(...bodyLines);
                processed.push(`${indent}}`);
                if (stereotype) {
                  processed.push(`${indent}<<${stereotype}>> ${className}`);
                }
                continue;
              }
              
              // Pattern 1: <<stereotype>> ClassName (without class/enum keyword, followed by members)
              // Example: <<interface>> OrderProcessor
              const standaloneMatch = line.match(/^<<(abstract|interface|enumeration)>>\s+(\w+)\s*$/);
              
              if (standaloneMatch) {
                const [, stereotype, className] = standaloneMatch;
                const indent = lines[i].match(/^\s*/)?.[0] || '';
                const memberLines: string[] = [];
                
                // Collect following lines that are members (ClassName : member)
                i++;
                while (i < lines.length) {
                  const nextLine = lines[i].trim();
                  if (!nextLine || nextLine.startsWith('<<') || 
                      nextLine.startsWith('class ') || nextLine.startsWith('style ') ||
                      nextLine.includes('<|--') || nextLine.includes('-->') || 
                      nextLine.includes('o--') || nextLine.includes('*--') ||
                      nextLine.includes('<..') || nextLine.includes('..|>')) {
                    break;
                  }
                  
                  // Transform "ClassName : member" to just "+member" or "-member"
                  const memberMatch = nextLine.match(/^\w+\s*:\s*(.+)$/);
                  if (memberMatch) {
                    const member = memberMatch[1].trim();
                    // Preserve the visibility indicator if present, otherwise add +
                    const visibility = member.match(/^[+\-#~]/) ? '' : '        +';
                    memberLines.push(`${visibility}${member}`);
                  }
                  i++;
                }
                
                // Output proper Mermaid class with stereotype
                processed.push(`${indent}class ${className} {`);
                if (memberLines.length > 0) {
                  processed.push(...memberLines);
                }
                processed.push(`${indent}}`);
                processed.push(`${indent}<<${stereotype}>> ${className}`);
                continue;
              }
              
              // Pattern 2: <<stereotype>> ClassName <relationship>
              const relationshipMatch = line.match(/^<<(abstract|interface|enumeration)>>\s+(\w+)\s+(<[|o.]+--?[|o.>]*|--[|o.>]+|\.\.|<\.\.|<\|\.\.)/);
              
              if (relationshipMatch) {
                // Remove stereotype from relationship line
                const cleanLine = lines[i].replace(/<<(abstract|interface|enumeration)>>\s+/, '');
                processed.push(cleanLine);
                i++;
                continue;
              }
              
              // Pattern 3: class <<stereotype>> ClassName {
              const matchStereotypeAfter = line.match(/^(class|enum)\s+<<(abstract|interface|enumeration)>>\s+(\w+)\s*\{/);
              
              if (matchStereotypeAfter) {
                const [, keyword, stereotype, className] = matchStereotypeAfter;
                const indent = lines[i].match(/^\s*/)?.[0] || '';
                const bodyLines: string[] = [];
                i++;
                let braceCount = 1;
                
                while (i < lines.length && braceCount > 0) {
                  const bodyLine = lines[i];
                  if (bodyLine.includes('{')) braceCount++;
                  if (bodyLine.includes('}')) braceCount--;
                  
                  if (braceCount > 0) {
                    bodyLines.push(bodyLine);
                  }
                  i++;
                }
                
                processed.push(`${indent}class ${className} {`);
                processed.push(...bodyLines);
                processed.push(`${indent}}`);
                processed.push(`${indent}<<${stereotype}>> ${className}`);
                continue;
              }
              
              // Pattern 4: <<stereotype>> class/enum ClassName {
              const match = line.match(/^<<(abstract|interface|enumeration)>>\s+(class|enum)\s+(\w+)\s*\{/);
              
              if (match) {
                const [, stereotype, keyword, className] = match;
                const indent = lines[i].match(/^\s*/)?.[0] || '';
                const bodyLines: string[] = [];
                i++;
                let braceCount = 1;
                
                while (i < lines.length && braceCount > 0) {
                  const bodyLine = lines[i];
                  if (bodyLine.includes('{')) braceCount++;
                  if (bodyLine.includes('}')) braceCount--;
                  
                  if (braceCount > 0) {
                    bodyLines.push(bodyLine);
                  }
                  i++;
                }
                
                processed.push(`${indent}class ${className} {`);
                processed.push(...bodyLines);
                processed.push(`${indent}}`);
                processed.push(`${indent}<<${stereotype}>> ${className}`);
                continue;
              }
              
              // No match - keep line as is
              processed.push(lines[i]);
              i++;
            }
            
            mermaidCode = processed.join('\n');
            
            // Remove quotes from relationship cardinality (e.g., "1..*" -> 1..*, "0..*" -> 0..*)
            mermaidCode = mermaidCode.replace(/:\s*"([0-9.*]+)"/g, ': $1');
          }
          
          // Render the mermaid diagram
          const { svg } = await mermaid.render(id, mermaidCode);
          element.innerHTML = svg;
          
          // Scale down flowcharts to 70% for more compact display
          const svgElement = element.querySelector('svg');
          if (svgElement && diagramData.diagramType === 'flowchart') {
            svgElement.style.transform = 'scale(0.7)';
            svgElement.style.transformOrigin = 'top center';
          }
          
          // Reduce font size for quadrant charts to prevent overlap
          if (svgElement && diagramData.diagramType === 'quadrant') {
            const textElements = svgElement.querySelectorAll('text');
            textElements.forEach((text) => {
              const currentSize = text.getAttribute('font-size') || '14';
              const newSize = Math.max(8, parseFloat(currentSize) * 0.5);
              text.setAttribute('font-size', newSize.toString());
            });
          }
        } catch (error) {
          console.error('Error rendering diagram:', error);
          toast({
            title: 'Rendering Error',
            description: 'Failed to render the diagram. Please try again.',
            variant: 'destructive',
          });
        }
      };

      renderDiagram();
    }
  }, [diagramData, toast]);

  const handleDownloadSVG = () => {
    if (!diagramRef.current) return;

    const svgElement = diagramRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram_${diagramData?.title?.replace(/[^a-z0-9]/gi, '_') || 'export'}.svg`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download successful',
      description: 'Diagram saved as SVG',
    });
  };

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;

    const svgElement = diagramRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Get original dimensions
      const bbox = svgElement.getBBox();
      const originalWidth = bbox.width || svgElement.clientWidth || 800;
      const originalHeight = bbox.height || svgElement.clientHeight || 600;
      
      // Set high resolution scale factor (3x for better quality)
      const scale = 3;
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      
      // Update SVG attributes for high resolution
      clonedSvg.setAttribute('width', scaledWidth.toString());
      clonedSvg.setAttribute('height', scaledHeight.toString());
      clonedSvg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
      
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        
        // Fill white background for better visibility
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, scaledWidth, scaledHeight);
          ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `diagram_${diagramData?.title?.replace(/[^a-z0-9]/gi, '_') || 'export'}.png`;
            link.click();
            URL.revokeObjectURL(url);
            
            toast({
              title: 'Download successful',
              description: 'High-quality diagram saved as PNG',
            });
          }
        }, 'image/png', 1.0); // Maximum quality
      };

      img.onerror = (error) => {
        console.error('Image load error:', error);
        toast({
          title: 'Download failed',
          description: 'Unable to render diagram. Please try SVG download.',
          variant: 'destructive',
        });
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download diagram. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3)); // Max 300%
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5)); // Min 50%
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (!diagramData) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading diagram...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="relative flex items-center justify-center mb-2">
          {/* Centered Title */}
          <div className="flex items-center gap-3">
            <Network className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Generated Diagram</h1>
          </div>

          {/* Action Buttons - Right */}
          <div className="absolute right-0 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadSVG}>
                  <Download className="h-4 w-4 mr-2" />
                  Download SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPNG}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => navigate('/app/ai-diagram')}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Generate Another
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground mt-4 text-center">
          {diagramData?.title || 'Untitled Diagram'} ({diagramData?.diagramType})
        </p>
      </div>

      <Card className="glass-panel border-0 shadow-lg p-6">
        <div 
          className="min-h-[500px] flex items-center justify-center bg-white rounded-lg overflow-hidden relative p-8"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Zoom Controls - Top Right Corner */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleZoomIn}
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 bg-white/90 hover:bg-white shadow-md"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleZoomOut}
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 bg-white/90 hover:bg-white shadow-md"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div 
            ref={diagramRef} 
            className="w-full flex justify-center items-center"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
              transformOrigin: 'center', 
              minWidth: '800px', 
              minHeight: '600px',
              transition: isDragging ? 'none' : 'transform 0.2s',
              pointerEvents: 'none'
            }}
          />
        </div>
      </Card>

      {diagramData.warnings && diagramData.warnings.length > 0 && (
        <Card className="mt-4 bg-yellow-50 border-yellow-200">
          <div className="p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Warnings:</h3>
            <ul className="list-disc list-inside text-yellow-700 text-sm">
              {diagramData.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DiagramResult;
