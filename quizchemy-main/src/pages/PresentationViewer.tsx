import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Maximize2,
  Minimize2,
  Home,
} from 'lucide-react';
import {
  TitleSlide,
  SectionHeader,
  BulletsSlide,
  TwoColumnImageLeft,
  TwoColumnTextLeft,
  ImageGrid,
  ComparisonSlide,
  QuoteSlide,
  ContentIconList,
  SummarySlide,
  TimelineSlide,
  StatsSlide,
  MediaSlide,
  AgendaSlide,
  FullWidthText,
  ChevronStepsSlide,
  DefinitionSlide,
  SplitHeroSlide,
  InsightSlide,
  SectionDividerSlide,
  GridSlide,
  TwoColumnSlide,
  CalloutSlide,
  TwoColumnCodeSlide,
} from '@/components/presentation-templates/SlideTemplates';
import {
  InteractiveFeatures,
  ProcessFlow,
  BeforeAfter,
  TeamShowcase,
  ThreeColumnLayout,
  CTAFormSlide,
  TestimonialSlide,
} from '@/components/presentation-templates/AdvancedSlideTemplates';
import { dummyPresentationData, SlideData } from '@/data/dummyPresentationData';
import { useToast } from '@/hooks/use-toast';

export const PresentationViewer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get presentation data from navigation state or use dummy data as fallback
  const presentationData = location.state?.presentationData || location.state?.presentation || dummyPresentationData;
  const selectedTheme = location.state?.theme || presentationData.theme?.id || 'modern';
  const slides = presentationData.slides;

  console.log('🎬 [PresentationViewer] Loaded presentation data:', {
    title: presentationData.title,
    theme: selectedTheme,
    slideCount: slides?.length,
    hasData: !!location.state?.presentationData
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex, isFullscreen]);

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = async () => {
    try {
      toast({
        title: 'Preparing Download',
        description: 'Creating PDF...',
      });

      // Check if these are visual slides with images
      const hasVisualSlides = slides.some((slide: any) => {
        const slideType = slide.type.toLowerCase();
        const content = slide.content as any;
        return slideType === 'visual' && content.imageUrl;
      });

      if (hasVisualSlides) {
        // Download as PDF for visual slides
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1920, 1080]
        });

        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          const slideType = slide.type.toLowerCase();
          const content = slide.content as any;

          if (slideType === 'visual' && content.imageUrl) {
            if (i > 0) {
              pdf.addPage();
            }

            try {
              // Add image URL directly to PDF
              pdf.addImage(content.imageUrl, 'PNG', 0, 0, 1920, 1080, undefined, 'FAST');
            } catch (err) {
              console.error('Error adding image to PDF:', err);
              // Add text as fallback
              pdf.setFontSize(32);
              pdf.text(`Slide ${i + 1}`, 960, 540, { align: 'center' });
            }
          }
        }

        pdf.save(`${presentationData.title || 'presentation'}.pdf`);
        
        toast({
          title: 'Download Complete',
          description: 'Presentation downloaded as PDF',
        });
      } else {
        // For traditional slides, still use PPTX
        const pptxgenjs = await import("pptxgenjs");
        const pptx = new pptxgenjs.default();

        slides.forEach((slide: any, index: number) => {
          const pptxSlide = pptx.addSlide();
          const content = slide.content as any;

          if (content.title) {
            pptxSlide.addText(content.title, {
              x: 0.5,
              y: 0.5,
              w: 9,
              h: 1,
              fontSize: 32,
              bold: true,
              color: '363636',
            });
          }

          if (content.text) {
            pptxSlide.addText(content.text, {
              x: 0.5,
              y: 1.8,
              w: 9,
              h: 4,
              fontSize: 18,
              color: '666666',
            });
          }

          if (content.bullets && Array.isArray(content.bullets)) {
            pptxSlide.addText(content.bullets.map((b: string) => ({ text: b, options: { bullet: true } })), {
              x: 0.5,
              y: 1.8,
              w: 9,
              h: 4,
              fontSize: 16,
            });
          }
        });

        await pptx.writeFile({ fileName: `${presentationData.title || 'presentation'}.pptx` });
        
        toast({
          title: 'Download Complete',
          description: 'Presentation downloaded as PPTX',
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download presentation',
        variant: 'destructive',
      });
    }
  };

  const handleExit = () => {
    navigate('/app/dashboard');
  };

  const renderSlide = (slide: SlideData, theme: string) => {
    const content = slide.content as any;

    // Map API slide types to component types
    const slideType = slide.type.toLowerCase();
    
    // Handle visual slides with AI-generated images
    if (slideType === 'visual' && content.imageUrl) {
      return (
        <img 
          src={content.imageUrl} 
          alt={content.title}
          className="w-full h-full max-w-[95%] max-h-[85vh] min-h-[70vh] object-contain"
          onError={(e) => {
            console.error('Failed to load image:', content.imageUrl);
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23e2e8f0" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%2364748b" text-anchor="middle" dominant-baseline="middle"%3EImage Loading...%3C/text%3E%3C/svg%3E';
          }}
        />
      );
    }
    
    switch (slideType) {
      case 'title':
      case 'titleslide':
        return <TitleSlide title={content.title} subtitle={content.subtitle || content.text} backgroundImage={content.image} theme={theme} />;
      
      case 'hero':
        return <SplitHeroSlide title={content.title} text={content.text} theme={theme} />;
      
      case 'sectionheader':
        return <SectionHeader title={content.title} description={content.description} number={content.number} theme={theme} />;
      
      case 'agendaslide':
        return <AgendaSlide title={content.title} items={content.items} theme={theme} />;
      
      case 'bullets':
      case 'bullets-left':
      case 'multi-point':
      case 'bulletsslide':
        return <BulletsSlide title={content.title} bullets={content.bullets} image={content.image} theme={theme} />;
      
      case 'twocolumnimageleft':
        return <TwoColumnImageLeft image={content.image} title={content.title} content={content.content || content.text} theme={theme} />;
      
      case 'twocolumntextleft':
        return <TwoColumnTextLeft title={content.title} content={content.content} image={content.image} theme={theme} />;
      
      case 'imagegrid':
        return <ImageGrid title={content.title} images={content.images} columns={content.columns} theme={theme} />;
      
      case 'comparison':
      case 'comparisonslide':
      case 'compare-two':
      case 'comparison-2col':
        // Parse left/right content from API format - handle multiple field names
        const leftItems = content.leftPoints || content.leftList || (Array.isArray(content.left) 
          ? content.left 
          : (content.left ? content.left.split('\n').filter((line: string) => line.trim().startsWith('•')).map((line: string) => line.replace('•', '').trim()) : content.leftItems));
        const rightItems = content.rightPoints || content.rightList || (Array.isArray(content.right)
          ? content.right
          : (content.right ? content.right.split('\n').filter((line: string) => line.trim().startsWith('•')).map((line: string) => line.replace('•', '').trim()) : content.rightItems));
        
        // Extract labels - prioritize explicit leftTitle/rightTitle fields
        const titleParts = content.title?.split('&') || [];
        const leftLabel = content.leftTitle || (titleParts.length >= 3 ? titleParts[2]?.trim() : content.leftLabel || 'Left');
        const rightLabel = content.rightTitle || (titleParts.length >= 2 ? titleParts[1]?.trim() : content.rightLabel || 'Right');
        const mainTitle = titleParts.length >= 3 ? titleParts[0]?.trim() : content.title;
        
        return <ComparisonSlide title={mainTitle} leftLabel={leftLabel} rightLabel={rightLabel} leftItems={leftItems} rightItems={rightItems} theme={theme} />;
      
      case 'quoteslide':
        return <QuoteSlide quote={content.quote} author={content.author} image={content.image} theme={theme} />;
      
      case 'contenticonlist':
      case 'icon-list':
        return <ContentIconList 
          title={content.title} 
          items={content.items?.map((item: any) => {
            // Handle string format "Term: Description"
            if (typeof item === 'string') {
              const [term, ...descParts] = item.split(':');
              return {
                icon: '📌',
                title: term.trim(),
                description: descParts.join(':').trim()
              };
            }
            // Handle object format
            return {
              icon: item.icon || '📌',
              title: item.title || '',
              description: item.text || item.description || ''
            };
          })} 
          columns={content.columns || 2} 
          theme={theme} 
        />;
      
      case 'definition-list':
        return <ContentIconList 
          title={content.title} 
          items={content.items?.map((item: any) => {
            // Handle string format "Term: Definition"
            if (typeof item === 'string') {
              const [term, ...defParts] = item.split(':');
              return {
                icon: '📌',
                title: term.trim(),
                description: defParts.join(':').trim()
              };
            }
            // Handle object format
            return {
              icon: item.icon || '📌',
              title: item.title || item.term || '',
              description: item.text || item.description || item.definition || ''
            };
          })} 
          columns={1} 
          theme={theme} 
        />;
      
      case 'card-grid':
        const cardCount = content.cards?.length || 0;
        // For 3 cards: use 3 columns, for 4 cards: use 2 columns (2x2 grid)
        const gridColumns = cardCount === 4 ? 2 : cardCount === 3 ? 3 : cardCount === 2 ? 2 : 1;
        return <ContentIconList 
          title={content.title} 
          items={content.cards?.map((card: any) => ({
            icon: card.icon || '📌',
            title: card.title || '',
            description: card.text || card.description || ''
          }))} 
          columns={gridColumns}
          theme={theme} 
        />;
      
      case 'code-block':
        // Use two-column code slide if columns are provided
        if (content.columns && Array.isArray(content.columns)) {
          return <TwoColumnCodeSlide title={content.title} columns={content.columns} theme={theme} />;
        }
        // Fallback to single column
        return <FullWidthText heading={content.title} subheading={content.subtitle} bodyText={content.code || content.text} theme={theme} />;
      
      case 'code':
        // Handle code slides from API - format as single column code display
        if (content.code) {
          return <TwoColumnCodeSlide 
            title={content.title} 
            columns={[
              {
                subtitle: '',
                code: content.code,
                codeLanguage: content.language || 'java'
              }
            ]} 
            theme={theme} 
          />;
        }
        // Fallback if no code field
        return <FullWidthText heading={content.title} subheading={''} bodyText={content.code || content.text || ''} theme={theme} />;
      
      case 'fact-box':
        return <CalloutSlide title={content.title} text={content.text} theme={theme} />;
      
      case 'summary':
      case 'summaryslide':
        // Handle both array (bullets) and string (text) format
        const summaryContent = content.bullets && content.bullets.length > 0 
          ? content.bullets 
          : (content.summary && Array.isArray(content.summary) 
            ? content.summary 
            : (content.text && typeof content.text === 'string' 
              ? [content.text] 
              : []));
        return <SummarySlide title={content.title} summary={summaryContent} cta={content.cta} theme={theme} />;
      
      case 'timelineslide':
        return <TimelineSlide title={content.title} events={content.events} theme={theme} />;
      
      case 'stats':
      case 'statsslide':
        return <StatsSlide title={content.title} stats={content.stats} theme={theme} />;
      
      case 'mediaslide':
        return <MediaSlide title={content.title} mediaUrl={content.mediaUrl} description={content.description} theme={theme} />;
      
      case 'explanation':
      case 'fullwidthtext':
        return <FullWidthText heading={content.title} subheading={content.subtitle} bodyText={content.text} theme={theme} />;
      
      case 'definition':
        return <DefinitionSlide title={content.title} text={content.text} theme={theme} />;
      
      case 'chevron-steps':
      case 'steps':
      case 'list':
      case 'state-lifecycle':
        // Use ChevronStepsSlide for better visual display
        if (content.steps && Array.isArray(content.steps)) {
          // Parse steps - handle both object format {step: "1", text: "..."} and string format
          const parsedSteps = content.steps.map((step: any) => {
            // If step is already an object with step and text properties
            if (typeof step === 'object' && step.text) {
              // Extract the state name from text (e.g., "New - The thread is..." -> "New")
              const textMatch = step.text.match(/^([^-]+)\s*-\s*(.+)$/);
              if (textMatch) {
                return {
                  label: textMatch[1].trim(),
                  description: textMatch[2].trim()
                };
              }
              // Fallback to original format
              return {
                label: step.step,
                description: step.text
              };
            }
            // If step is a string
            if (typeof step === 'string') {
              // Check if step has "Step 1: Label - Description" format
              const stepMatch = step.match(/^Step\s+\d+:\s*([^-]+)\s*-\s*(.+)$/i);
              if (stepMatch) {
                return {
                  label: stepMatch[1].trim(),
                  description: stepMatch[2].trim()
                };
              }
              // Check if step has "01 - Label: Description" format
              const match = step.match(/^(\d+)\s*-\s*([^:]+):\s*(.+)$/);
              if (match) {
                return {
                  label: match[2].trim(),
                  description: match[3].trim()
                };
              }
              // Check if step has "01 - Label" format (no description)
              const simpleMatch = step.match(/^(\d+)\s*-\s*(.+)$/);
              if (simpleMatch) {
                return simpleMatch[2].trim();
              }
              // Check if step has "Label: Description" format (no number)
              const labelMatch = step.match(/^([^:]+):\s*(.+)$/);
              if (labelMatch) {
                return {
                  label: labelMatch[1].trim(),
                  description: labelMatch[2].trim()
                };
              }
              return step;
            }
            return step;
          });
          return <ChevronStepsSlide title={content.title} subtitle={content.subtitle} steps={parsedSteps} theme={theme} />;
        }
        return <ProcessFlow title={content.title} steps={content.steps} theme={theme} />;
      
      case 'split-hero':
        return <SplitHeroSlide title={content.title} text={content.text} theme={theme} />;
      
      case 'insight':
        return <InsightSlide title={content.title} text={content.text} theme={theme} />;
      
      case 'section-divider':
        return <SectionDividerSlide title={content.title || content.subtitle} theme={theme} />;
      
      case 'grid':
        return <GridSlide title={content.title} items={content.items} theme={theme} />;
      
      case 'two-column':
        return <TwoColumnSlide left={content.left} right={content.right} theme={theme} />;
      
      case 'callout':
        return <CalloutSlide title={content.title} text={content.text} theme={theme} />;
      
      case 'interactivefeatures':
        return <InteractiveFeatures title={content.title} features={content.features} theme={theme} />;
      
      case 'processflow':
        return <ProcessFlow title={content.title} steps={content.steps} theme={theme} />;
      
      case 'beforeafter':
        return <BeforeAfter title={content.title} beforeLabel={content.beforeLabel} afterLabel={content.afterLabel} beforeImage={content.beforeImage} afterImage={content.afterImage} description={content.description} theme={theme} />;
      
      case 'teamshowcase':
        return <TeamShowcase title={content.title} members={content.members} columns={content.columns} theme={theme} />;
      
      case 'threecolumnlayout':
        return <ThreeColumnLayout title={content.title} columns={content.columns} theme={theme} />;
      
      case 'ctaformslide':
        return <CTAFormSlide title={content.title} description={content.description} buttonText={content.buttonText} fields={content.fields} theme={theme} />;
      
      case 'testimonialslide':
        return <TestimonialSlide title={content.title} testimonials={content.testimonials} theme={theme} />;
      
      default:
        return (
          <div className="w-full h-screen flex items-center justify-center bg-gray-100">
            <p className="text-xl text-gray-600">Unknown slide type: {slide.type}</p>
          </div>
        );
    }
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen overflow-hidden'} bg-gray-50 flex flex-col`}>
      {/* Top Navigation Bar */}
      {!isFullscreen && (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Thumbnails */}
        {!isFullscreen && (
          <div className="w-44 bg-white border-r border-gray-200 overflow-y-auto" style={{scrollbarWidth: 'thin', scrollbarColor: '#9ca3af #f3f4f6'}}>
            <div className="p-3 space-y-3">
              {slides.map((slide, index) => {
                const slideContent = slide.content as any;
                const slideType = slide.type.toLowerCase();
                const isVisual = slideType === 'visual' && slideContent.imageUrl;
                
                return (
                  <button
                    key={slide.id || index}
                    onClick={() => goToSlide(index)}
                    className={`w-full aspect-[4/3] rounded-lg border-2 transition-all overflow-hidden relative group ${
                      currentSlideIndex === index
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="absolute inset-0 bg-white flex items-center justify-center p-1">
                      {isVisual ? (
                        <img 
                          src={slideContent.imageUrl} 
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-2">
                          <span className="text-[10px] font-semibold text-gray-700 text-center line-clamp-3">
                            {slideContent.title || `Slide ${index + 1}`}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Active indicator */}
                    <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                      currentSlideIndex === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-white'
                    }`}>
                      {index + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Slide Display */}
        <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden h-full">
          {/* Current Slide */}
          <div className="w-full h-full max-w-7xl max-h-[95vh] bg-white rounded-lg shadow-xl overflow-hidden relative flex items-center justify-center">
            {renderSlide(currentSlide, selectedTheme)}

            {/* Navigation Arrows on Slide */}
            {currentSlideIndex > 0 && !isFullscreen && (
              <button
                onClick={goToPreviousSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-all z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {currentSlideIndex < slides.length - 1 && !isFullscreen && (
              <button
                onClick={goToNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-all z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>

          {/* Slide Counter - Bottom Right */}
          <div className="absolute bottom-12 right-12 bg-gray-800/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            {currentSlideIndex + 1} / {slides.length}
          </div>
        </div>

        {/* Fullscreen Exit Button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-6 right-6 bg-gray-800/80 hover:bg-gray-800 text-white p-3 rounded-full transition-all shadow-lg z-20"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PresentationViewer;
