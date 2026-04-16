import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Sparkles, Plus, Trash2, GripVertical, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/presentation/ThemeToggle";
import { ThemeCard } from "@/components/presentation/ThemeCard";
import { Presentation } from "lucide-react";
import { presentationThemes, type ThemeId } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { generateOutline as apiGenerateOutline } from "@/lib/slides-api";

type ContentDensity = "minimal" | "concise" | "detailed" | "extensive";

interface OutlineItem {
  id: string;
  title: string;
  bullets: string[];
}

export default function Customize() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [contentDensity, setContentDensity] = useState<ContentDensity>("concise");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("modern");
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showThemesDialog, setShowThemesDialog] = useState(false);
  
  const storedData = typeof window !== 'undefined' ? sessionStorage.getItem('slideGeneratorData') : null;
  const parsedData = storedData ? JSON.parse(storedData) : null;

  useEffect(() => {
    if (!parsedData) {
      navigate("/");
      return;
    }
    
    if (parsedData.theme) {
      setSelectedTheme(parsedData.theme);
    }
    
    generateOutline();
  }, []);

  const generateOutline = async () => {
    if (!parsedData) return;
    
    setIsGenerating(true);
    try {
      const data = await apiGenerateOutline({
        content: parsedData.content,
        slideCount: parsedData.slideCount,
        language: parsedData.language,
      });

      setOutline(data.outline.map((item: { title: string; bullets: string[] }, i: number) => ({
        id: `slide-${i}`,
        title: item.title,
        bullets: item.bullets || [],
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate outline",
        variant: "destructive",
      });
      const defaultOutline = Array.from({ length: parsedData.slideCount }, (_, i) => ({
        id: `slide-${i}`,
        title: i === 0 ? "Introduction" : `Slide ${i + 1}`,
        bullets: [],
      }));
      setOutline(defaultOutline);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleGenerate = async () => {
    if (!parsedData) return;
    
    const updatedData = {
      ...parsedData,
      theme: selectedTheme,
      contentDensity,
      outline: outline.map(item => ({ title: item.title, bullets: item.bullets })),
    };
    
    sessionStorage.setItem('slideGeneratorData', JSON.stringify(updatedData));
    navigate("/generate");
  };

  const updateOutlineTitle = (id: string, title: string) => {
    setOutline(prev => prev.map(item => 
      item.id === id ? { ...item, title } : item
    ));
  };

  const updateOutlineBullet = (id: string, bulletIndex: number, text: string) => {
    setOutline(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newBullets = [...item.bullets];
      newBullets[bulletIndex] = text;
      return { ...item, bullets: newBullets };
    }));
  };

  const addSlide = () => {
    const newId = `slide-${Date.now()}`;
    setOutline(prev => [...prev, { id: newId, title: "New Slide", bullets: ["Add key point here"] }]);
  };

  const removeSlide = (id: string) => {
    if (outline.length <= 3) {
      toast({
        title: "Cannot remove",
        description: "Minimum 3 slides required",
        variant: "destructive",
      });
      return;
    }
    setOutline(prev => prev.filter(item => item.id !== id));
  };

  const densityOptions: { value: ContentDensity; label: string; lines: number; description: string }[] = [
    { value: "minimal", label: "Minimal", lines: 1, description: "Key points only" },
    { value: "concise", label: "Concise", lines: 2, description: "Brief explanations" },
    { value: "detailed", label: "Detailed", lines: 3, description: "Full context" },
    { value: "extensive", label: "Extensive", lines: 4, description: "In-depth content" },
  ];

  const themeKeys = Object.keys(presentationThemes) as ThemeId[];

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between gap-4 px-6 sticky top-0 bg-background z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
            <Presentation className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Customize Presentation</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">
          <div className="w-[60%]">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-semibold" data-testid="text-content-title">Text Content</span>
                </div>
                <Label className="text-sm text-muted-foreground mb-3 block">Amount of text per slide</Label>
                <div className="grid grid-cols-4 gap-3">
                  {densityOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      onClick={() => setContentDensity(option.value)}
                      className={`h-auto p-4 flex flex-col items-start gap-2 ${
                        contentDensity === option.value
                          ? "border-primary bg-primary/5 toggle-elevate toggle-elevated"
                          : ""
                      }`}
                      data-testid={`button-density-${option.value}`}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        {Array.from({ length: option.lines }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1.5 bg-muted-foreground/30 rounded-full"
                            style={{ width: i === option.lines - 1 ? '60%' : '100%' }}
                          />
                        ))}
                      </div>
                      <div className="mt-1">
                        <span className="text-sm font-medium block">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold" data-testid="text-visuals-title">Visuals</span>
                </div>
                <Label className="text-sm text-muted-foreground mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  {themeKeys.slice(0, 6).map((themeId) => (
                    <ThemeCard
                      key={themeId}
                      themeId={themeId}
                      isSelected={selectedTheme === themeId}
                      onSelect={() => setSelectedTheme(themeId)}
                    />
                  ))}
                </div>
                {themeKeys.length > 6 && (
                  <Button
                    variant="ghost"
                    className="mt-4 text-sm text-primary"
                    onClick={() => setShowThemesDialog(true)}
                    data-testid="button-view-more-themes"
                  >
                    View more themes ({themeKeys.length - 6} more)
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="w-px bg-border h-auto min-h-full" />

          <div className="w-[40%]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold" data-testid="text-outline-title">Outline</span>
              <span className="text-sm text-muted-foreground" data-testid="text-slide-count">{outline.length} slides</span>
            </div>
            
            {isGenerating ? (
              <div className="flex items-center justify-center py-12 border border-border rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Generating outline...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[680px] overflow-y-auto pr-2 border border-border rounded-lg p-3">
                {outline.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-border bg-card group"
                    data-testid={`outline-item-${index}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base font-semibold text-primary/70 w-5 flex-shrink-0">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={item.title}
                          onChange={(e) => updateOutlineTitle(item.id, e.target.value)}
                          className="border-0 bg-transparent p-0 h-auto text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
                          data-testid={`outline-input-${index}`}
                        />
                        {item.bullets && item.bullets.length > 0 && (
                          <ul className="mt-1 space-y-0.5 pl-0">
                            {item.bullets.map((bullet, bulletIndex) => (
                              <li
                                key={bulletIndex}
                                className="flex items-start gap-1.5 text-xs text-muted-foreground"
                                data-testid={`outline-bullet-${index}-${bulletIndex}`}
                              >
                                <span className="text-primary/60 mt-0.5">•</span>
                                <Input
                                  value={bullet}
                                  onChange={(e) => updateOutlineBullet(item.id, bulletIndex, e.target.value)}
                                  className="border-0 bg-transparent p-0 h-auto text-xs focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                                  data-testid={`outline-bullet-input-${index}-${bulletIndex}`}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlide(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-6 w-6"
                        data-testid={`button-remove-slide-${index}`}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addSlide}
                  className="w-full border-dashed"
                  data-testid="button-add-slide"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            onClick={handleGenerate}
            disabled={isGenerating || outline.length === 0}
            data-testid="button-generate-slides"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Slides
          </Button>
        </div>
      </main>

      <Dialog open={showThemesDialog} onOpenChange={setShowThemesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Themes</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {themeKeys.map((themeId) => (
              <ThemeCard
                key={themeId}
                themeId={themeId}
                isSelected={selectedTheme === themeId}
                onSelect={() => {
                  setSelectedTheme(themeId);
                  setShowThemesDialog(false);
                }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
