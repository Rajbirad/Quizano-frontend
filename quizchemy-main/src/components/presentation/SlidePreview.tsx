import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, Check, X, Shield, Zap, Users, Clock, Target, Settings, TrendingUp, Lock, CheckCircle, Star, Sparkles, Heart, Globe, Lightbulb, Award, Rocket, Database, Code, Server, Layers, Activity, Move, Trash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Slide, LayoutOverrides, PositionOverride } from "./SlideCard";
import { presentationThemes, type ThemeId } from "@/shared/schema";
import { DndContext, useDraggable, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface SlidePreviewProps {
  slide: Slide;
  currentIndex: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  onGenerateImage?: () => void;
  isGeneratingImage?: boolean;
  theme?: ThemeId;
  onSlideUpdate?: (updatedSlide: Slide) => void;
}

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}

function EditableText({ value, onSave, className = "", style = {}, multiline = false, placeholder = "Click to edit" }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const editRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    const currentValue = editRef.current?.innerText || editValue;
    if (currentValue.trim() !== value) {
      onSave(currentValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="outline-none cursor-text w-full inline-block"
        style={{ 
          ...style, 
          whiteSpace: multiline ? 'pre-wrap' : 'normal', 
          WebkitTextFillColor: style.color,
          wordBreak: 'break-word',
          caretColor: 'white'
        }}
      >
        {editValue || placeholder}
      </div>
    );
  }

  return (
    <span
      className={`${className} cursor-text px-2 py-1 -mx-2 -my-1 transition-all relative group inline-block`}
      style={style}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || placeholder}
      <span className="absolute inset-0 border border-dashed border-indigo-500/0 group-hover:border-indigo-500 rounded pointer-events-none transition-colors" />
      <span className="absolute -top-0.5 -left-0.5 w-2 h-2 border border-indigo-500 bg-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 border border-indigo-500 bg-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <span className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border border-indigo-500 bg-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-indigo-500 bg-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </span>
  );
}

interface DraggableElementProps {
  id: string;
  children: React.ReactNode;
  position?: PositionOverride;
  className?: string;
}

function DraggableElement({ id, children, position, className = "" }: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? 'grabbing' : 'grab',
    position: position ? 'absolute' : 'relative',
    left: position ? `${position.xPct}%` : undefined,
    top: position ? `${position.yPct}%` : undefined,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} group/drag touch-none`}
      data-draggable-id={id}
      {...attributes}
      {...listeners}
    >
      <div className="relative">
        {children}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag:opacity-100 transition-opacity">
          <Move className="h-4 w-4 text-white/60" />
        </div>
      </div>
    </div>
  );
}

export function SlidePreview({ 
  slide, 
  currentIndex, 
  totalSlides, 
  onPrevious, 
  onNext, 
  onGenerateImage, 
  isGeneratingImage, 
  theme = "modern",
  onSlideUpdate 
}: SlidePreviewProps) {
  const selectedTheme = presentationThemes[theme];
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (!leftPaneRef.current) return;
    
    const pane = leftPaneRef.current;
    const paneRect = pane.getBoundingClientRect();
    
    const elementNode = document.querySelector(`[data-draggable-id="${active.id}"]`) as HTMLElement | null;
    
    if (elementNode) {
      const elementRect = elementNode.getBoundingClientRect();
      const xPct = ((elementRect.left - paneRect.left) / paneRect.width) * 100;
      const yPct = ((elementRect.top - paneRect.top) / paneRect.height) * 100;
      dragStartPosRef.current = { x: xPct, y: yPct };
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    if (!leftPaneRef.current || !onSlideUpdate || !dragStartPosRef.current) return;

    const pane = leftPaneRef.current;
    const rect = pane.getBoundingClientRect();

    const elementId = active.id as string;
    const startPos = dragStartPosRef.current;

    const deltaXPct = (delta.x / rect.width) * 100;
    const deltaYPct = (delta.y / rect.height) * 100;

    const newXPct = Math.max(0, Math.min(85, startPos.x + deltaXPct));
    const newYPct = Math.max(0, Math.min(85, startPos.y + deltaYPct));

    const newOverrides: LayoutOverrides = {
      ...slide.layoutOverrides,
      [elementId]: { xPct: newXPct, yPct: newYPct },
    };

    onSlideUpdate({ ...slide, layoutOverrides: newOverrides });
    dragStartPosRef.current = null;
  }, [slide, onSlideUpdate]);

  const getPosition = (elementId: string): PositionOverride | undefined => {
    return slide.layoutOverrides?.[elementId];
  };

  const updateSlide = (updates: Partial<Slide>) => {
    if (onSlideUpdate) {
      onSlideUpdate({ ...slide, ...updates });
    }
  };

  const updateBullet = (index: number, value: string) => {
    if (slide.bullets && onSlideUpdate) {
      const newBullets = [...slide.bullets];
      newBullets[index] = value;
      onSlideUpdate({ ...slide, bullets: newBullets });
    }
  };

  const updateStep = (index: number, field: "label" | "description", value: string) => {
    if (slide.steps && onSlideUpdate) {
      const newSteps = [...slide.steps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      onSlideUpdate({ ...slide, steps: newSteps });
    }
  };

  const updateComparison = (field: "leftTitle" | "rightTitle", value: string) => {
    if (slide.comparison && onSlideUpdate) {
      onSlideUpdate({ 
        ...slide, 
        comparison: { ...slide.comparison, [field]: value } 
      });
    }
  };

  const updateComparisonItem = (index: number, field: "label" | "left" | "right", value: string) => {
    if (slide.comparison && onSlideUpdate) {
      const newItems = [...slide.comparison.items];
      newItems[index] = { ...newItems[index], [field]: value };
      onSlideUpdate({ 
        ...slide, 
        comparison: { ...slide.comparison, items: newItems } 
      });
    }
  };

  const updateColumn = (index: number, field: "heading" | "body", value: string) => {
    if (slide.columns && onSlideUpdate) {
      const newColumns = [...slide.columns];
      newColumns[index] = { ...newColumns[index], [field]: value };
      onSlideUpdate({ ...slide, columns: newColumns });
    }
  };

  const updateSection = (index: number, field: "heading" | "body", value: string) => {
    if (slide.sections && onSlideUpdate) {
      const newSections = [...slide.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      onSlideUpdate({ ...slide, sections: newSections });
    }
  };

  const updateGridItem = (index: number, field: "title" | "description", value: string) => {
    if (slide.grid && onSlideUpdate) {
      const newGrid = [...slide.grid];
      newGrid[index] = { ...newGrid[index], [field]: value };
      onSlideUpdate({ ...slide, grid: newGrid });
    }
  };

  const updateCallout = (field: "title" | "body", value: string) => {
    if (slide.callout && onSlideUpdate) {
      onSlideUpdate({ 
        ...slide, 
        callout: { ...slide.callout, [field]: value } 
      });
    }
  };

  const updateCardItem = (index: number, field: "icon" | "title" | "description", value: string) => {
    if (slide.cards && onSlideUpdate) {
      const newCards = [...slide.cards];
      newCards[index] = { ...newCards[index], [field]: value };
      onSlideUpdate({ ...slide, cards: newCards });
    }
  };

  const updateHorizontalStep = (index: number, field: "number" | "title" | "description", value: string) => {
    if (slide.horizontalSteps && onSlideUpdate) {
      const newSteps = [...slide.horizontalSteps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      onSlideUpdate({ ...slide, horizontalSteps: newSteps });
    }
  };

  const updateNumberedCard = (index: number, field: "title" | "description", value: string) => {
    if (slide.numberedCards && onSlideUpdate) {
      const newCards = [...slide.numberedCards];
      newCards[index] = { ...newCards[index], [field]: value };
      onSlideUpdate({ ...slide, numberedCards: newCards });
    }
  };

  const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    Shield, Zap, Users, Clock, Target, Settings, TrendingUp, Lock, CheckCircle, Star,
    Sparkles, Heart, Globe, Lightbulb, Award, Rocket, Database, Code, Server, Layers, Activity
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Sparkles;
  };
  
  return (
    <div className="space-y-4">
      <p className="text-xs text-center text-muted-foreground">
        Drag elements to reposition, click text to edit
      </p>
      
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            data-testid="button-previous-slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div 
            className="aspect-video rounded-lg overflow-hidden relative flex-1"
            style={{ background: selectedTheme.gradient }}
            data-testid="slide-preview-main"
          >
          <div className="absolute inset-0 flex">
            <div ref={leftPaneRef} className="w-1/2 p-6 flex flex-col h-full overflow-hidden relative">
            {slide.type === "title" && (
              <div className="flex-1 flex flex-col justify-center">
                <DraggableElement id="title" position={getPosition("title")}>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    <EditableText
                      value={slide.title}
                      onSave={(v) => updateSlide({ title: v })}
                      style={{ color: selectedTheme.titleColor }}
                    />
                  </h1>
                </DraggableElement>
                {slide.subtitle !== undefined && (
                  <DraggableElement id="subtitle" position={getPosition("subtitle")}>
                    <div className="text-lg md:text-xl leading-relaxed">
                      <EditableText
                        value={slide.subtitle || ""}
                        onSave={(v) => updateSlide({ subtitle: v })}
                        style={{ color: selectedTheme.textSecondary }}
                        placeholder="Add subtitle..."
                      />
                    </div>
                  </DraggableElement>
                )}
              </div>
            )}
          
          {slide.type === "content" && (
            <div className="flex flex-col h-full relative px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              <div className="flex-1 flex items-center">
                <DraggableElement id="content" position={getPosition("content")}>
                  <div className="text-lg md:text-xl leading-relaxed">
                    <EditableText
                      value={slide.content || ""}
                      onSave={(v) => updateSlide({ content: v })}
                      style={{ color: selectedTheme.text }}
                      multiline
                      placeholder="Add content..."
                    />
                  </div>
                </DraggableElement>
              </div>
            </div>
          )}
          
          {slide.type === "bullets" && (
            <div className="flex flex-col h-full relative px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              <div className="flex-1 flex items-center">
                <DraggableElement id="bullets" position={getPosition("bullets")}>
                  <ul className="space-y-4 w-full">
                  {slide.bullets?.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {slide.bulletStyle === "numbered" ? (
                        <span 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: selectedTheme.buttonBg, color: selectedTheme.buttonText }}
                        >
                          {i + 1}
                        </span>
                      ) : slide.bulletStyle === "checkmark" ? (
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke={selectedTheme.buttonBg} strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : slide.bulletStyle === "arrow" ? (
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill={selectedTheme.buttonBg}>
                          <path d="M5 12h14M12 5l7 7-7 7" stroke={selectedTheme.buttonBg} strokeWidth="2" fill="none" />
                        </svg>
                      ) : slide.bulletStyle === "star" ? (
                        <span 
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: selectedTheme.buttonBg }}
                        />
                      ) : (
                        <span 
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: selectedTheme.buttonBg }}
                        />
                      )}
                      <span className="text-lg md:text-xl leading-relaxed flex-1">
                        <EditableText
                          value={bullet}
                          onSave={(v) => updateBullet(i, v)}
                          style={{ color: selectedTheme.text }}
                        />
                      </span>
                    </li>
                  ))}
                  </ul>
                </DraggableElement>
              </div>
            </div>
          )}

          {slide.type === "steps" && (
            <div className="flex flex-col h-full relative px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              <div className="flex-1 flex items-center">
                <DraggableElement id="steps" position={getPosition("steps")}>
                  <div className="space-y-4 w-full">
                  {slide.steps?.map((step, i) => (
                    <div key={i} className="flex items-stretch">
                      <div className="flex flex-col items-center mr-3 relative">
                        <svg 
                          viewBox="0 0 100 80" 
                          className="w-16 h-14"
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                        >
                          <path 
                            d="M 0 0 L 70 0 L 100 40 L 70 80 L 0 80 L 30 40 Z" 
                            fill="none"
                            stroke={selectedTheme.buttonBg}
                            strokeWidth="4"
                            strokeLinejoin="miter"
                          />
                          <text 
                            x="50" 
                            y="43" 
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            fill={selectedTheme.buttonBg}
                            fontSize="26"
                            fontWeight="bold"
                          >
                            {i + 1}
                          </text>
                        </svg>
                      </div>
                      <div className="flex-1 py-1">
                        <h3 className="font-bold text-lg md:text-xl">
                          <EditableText
                            value={step.label}
                            onSave={(v) => updateStep(i, "label", v)}
                            style={{ color: selectedTheme.titleColor }}
                          />
                        </h3>
                        <div className="text-base md:text-lg leading-relaxed">
                          <EditableText
                            value={step.description}
                            onSave={(v) => updateStep(i, "description", v)}
                            style={{ color: selectedTheme.text }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </DraggableElement>
              </div>
            </div>
          )}

          {slide.type === "comparison" && slide.comparison && (
            <div className="flex flex-col h-full relative">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-3xl md:text-4xl font-semibold mb-14">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <h3 
                  className="font-semibold text-sm pb-1"
                  style={{ borderBottom: `1px solid ${selectedTheme.textSecondary}` }}
                >
                  <EditableText
                    value={slide.comparison.leftTitle}
                    onSave={(v) => updateComparison("leftTitle", v)}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h3>
                <h3 
                  className="font-semibold text-base pb-1"
                  style={{ borderBottom: `1px solid ${selectedTheme.textSecondary}` }}
                >
                  <EditableText
                    value={slide.comparison.rightTitle}
                    onSave={(v) => updateComparison("rightTitle", v)}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h3>
              </div>
              <div className="space-y-3 flex-1">
                {slide.comparison.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4 relative">
                    <div 
                      className="rounded-md p-3 h-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <span className="text-base font-semibold block mb-1">
                        <EditableText
                          value={item.label}
                          onSave={(v) => updateComparisonItem(i, "label", v)}
                          style={{ color: selectedTheme.labelColor || selectedTheme.accent }}
                        />
                      </span>
                      <span className="text-base">
                        <EditableText
                          value={item.left}
                          onSave={(v) => updateComparisonItem(i, "left", v)}
                          style={{ color: selectedTheme.text }}
                        />
                      </span>
                    </div>
                    <div 
                      className="absolute left-1/2 top-0 bottom-0 w-px"
                      style={{ backgroundColor: selectedTheme.textSecondary, opacity: 0.3 }}
                    />
                    <div 
                      className="rounded-md p-3 h-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <span className="text-base font-semibold block mb-1" style={{ color: selectedTheme.labelColor || selectedTheme.accent }}>
                        {item.label}
                      </span>
                      <span className="text-base">
                        <EditableText
                          value={item.right}
                          onSave={(v) => updateComparisonItem(i, "right", v)}
                          style={{ color: selectedTheme.text }}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide.type === "columns" && slide.columns && (
            <div className="flex flex-col h-full px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              <div className="flex-1 flex items-center">
                <div className="flex gap-4 w-full">
                  {slide.columns.map((col, i) => (
                    <div key={i} className="flex-1">
                      <h3 className="font-bold text-lg uppercase mb-3">
                        <EditableText
                          value={col.heading}
                          onSave={(v) => updateColumn(i, "heading", v)}
                          style={{ color: selectedTheme.titleColor }}
                        />
                      </h3>
                      <p className="text-base leading-relaxed">
                        <EditableText
                          value={col.body}
                          onSave={(v) => updateColumn(i, "body", v)}
                          style={{ color: selectedTheme.text }}
                          multiline
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {slide.type === "sections" && slide.sections && (
            <div className="flex flex-col h-full px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              <div className="flex-1 flex items-center">
                <div className="space-y-3 w-full">
                  {slide.sections.map((section, i) => (
                    <div key={i}>
                      <h3 className="font-bold text-lg uppercase mb-3">
                        <EditableText
                          value={section.heading}
                          onSave={(v) => updateSection(i, "heading", v)}
                          style={{ color: selectedTheme.titleColor }}
                        />
                      </h3>
                      <p className="text-base leading-relaxed">
                        <EditableText
                          value={section.body}
                          onSave={(v) => updateSection(i, "body", v)}
                          style={{ color: selectedTheme.text }}
                          multiline
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {slide.callout && (
                <div 
                  className="mt-auto p-3 rounded-md border-l-4"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: '#dc2626'
                  }}
                >
                  <span className="text-sm font-bold uppercase block mb-1">
                    <EditableText
                      value={slide.callout.title}
                      onSave={(v) => updateCallout("title", v)}
                      style={{ color: '#ef4444' }}
                    />
                  </span>
                  <span className="text-sm leading-relaxed">
                    <EditableText
                      value={slide.callout.body}
                      onSave={(v) => updateCallout("body", v)}
                      style={{ color: selectedTheme.text }}
                      multiline
                    />
                  </span>
                </div>
              )}
            </div>
          )}

          {slide.type === "grid" && slide.grid && (
            <div className="flex flex-col h-full px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              <div className="flex-1 flex items-center">
                <div className="grid grid-cols-2 gap-x-4 gap-y-12 w-full">
                  {slide.grid.map((item, i) => (
                    <div key={i}>
                      <h3 className="font-bold text-lg uppercase mb-3">
                        <EditableText
                          value={item.title}
                          onSave={(v) => updateGridItem(i, "title", v)}
                          style={{ color: selectedTheme.titleColor }}
                        />
                      </h3>
                      <p className="text-base leading-relaxed">
                        <EditableText
                          value={item.description}
                          onSave={(v) => updateGridItem(i, "description", v)}
                          style={{ color: selectedTheme.text }}
                          multiline
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {slide.callout && (
                <div 
                  className="mt-auto p-3 rounded-md border-l-4"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: '#dc2626'
                  }}
                >
                  <span className="text-sm font-bold uppercase block mb-1">
                    <EditableText
                      value={slide.callout.title}
                      onSave={(v) => updateCallout("title", v)}
                      style={{ color: '#ef4444' }}
                    />
                  </span>
                  <span className="text-sm leading-relaxed">
                    <EditableText
                      value={slide.callout.body}
                      onSave={(v) => updateCallout("body", v)}
                      style={{ color: selectedTheme.text }}
                      multiline
                    />
                  </span>
                </div>
              )}
            </div>
          )}

          {slide.type === "cards" && slide.cards && (
            <div className="flex flex-col h-full px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-xl md:text-2xl font-semibold mb-3">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              <div className="flex-1 flex items-center overflow-hidden">
                <div className="grid grid-cols-2 gap-2 w-full">
                {slide.cards.map((card, i) => {
                  const IconComponent = getIcon(card.icon);
                  const isLastOdd = slide.cards!.length % 2 === 1 && i === slide.cards!.length - 1;
                  return (
                    <div 
                      key={i}
                      className={`rounded-lg p-2 flex flex-col ${isLastOdd ? 'col-span-2 max-w-[50%] justify-self-center' : ''}`}
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        border: `1px solid ${selectedTheme.textSecondary}`
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mb-1 shrink-0"
                        style={{ 
                          backgroundColor: `${selectedTheme.primary}40`,
                          border: `2px solid ${selectedTheme.primary}`
                        }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: selectedTheme.titleColor }} />
                      </div>
                      <h3 className="font-bold text-base mb-2">
                        <EditableText
                          value={card.title}
                          onSave={(v) => updateCardItem(i, "title", v)}
                          style={{ color: selectedTheme.text }}
                        />
                      </h3>
                      <p className="text-sm leading-snug">
                        <EditableText
                          value={card.description}
                          onSave={(v) => updateCardItem(i, "description", v)}
                          style={{ color: selectedTheme.textSecondary }}
                          multiline
                        />
                      </p>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          )}

          {slide.type === "horizontal-steps" && slide.horizontalSteps && (
            <div className="flex flex-col h-full px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-12">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              {slide.subtitle && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: selectedTheme.textSecondary }}>
                  <EditableText
                    value={slide.subtitle}
                    onSave={(v) => updateSlide({ subtitle: v })}
                    style={{ color: selectedTheme.textSecondary }}
                  />
                </p>
              )}
              <div className="flex-1 flex items-start">
                <div className="flex w-full">
                  {slide.horizontalSteps.map((step, i) => (
                    <div 
                      key={i} 
                      className="flex-1 px-2"
                      style={{ 
                        borderLeft: i > 0 ? `1px solid ${selectedTheme.textSecondary}` : 'none'
                      }}
                    >
                      <span 
                        className="text-sm font-medium block mb-1"
                        style={{ color: selectedTheme.textSecondary }}
                      >
                        <EditableText
                          value={step.number}
                          onSave={(v) => updateHorizontalStep(i, "number", v)}
                          style={{ color: selectedTheme.textSecondary }}
                        />
                      </span>
                      <h3 className="font-bold text-lg mb-3">
                        <EditableText
                          value={step.title}
                          onSave={(v) => updateHorizontalStep(i, "title", v)}
                          style={{ color: selectedTheme.text }}
                        />
                      </h3>
                      <p className="text-base leading-relaxed">
                        <EditableText
                          value={step.description}
                          onSave={(v) => updateHorizontalStep(i, "description", v)}
                          style={{ color: selectedTheme.textSecondary }}
                          multiline
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {slide.callout && (
                <div 
                  className="mt-auto p-3 rounded-md flex items-start gap-2 border-l-4"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: '#dc2626'
                  }}
                >
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
                  <div>
                    <span className="text-sm font-bold block mb-1">
                      <EditableText
                        value={slide.callout.title}
                        onSave={(v) => updateCallout("title", v)}
                        style={{ color: '#ef4444' }}
                      />
                    </span>
                    <span className="text-sm leading-relaxed">
                      <EditableText
                        value={slide.callout.body}
                        onSave={(v) => updateCallout("body", v)}
                        style={{ color: selectedTheme.text }}
                        multiline
                      />
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {slide.type === "numbered-cards" && slide.numberedCards && (
            <div className="flex flex-col h-full px-6 pt-8">
              <DraggableElement id="title" position={getPosition("title")}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  <EditableText
                    value={slide.title}
                    onSave={(v) => updateSlide({ title: v })}
                    style={{ color: selectedTheme.titleColor }}
                  />
                </h2>
              </DraggableElement>
              {slide.subtitle && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: selectedTheme.textSecondary }}>
                  <EditableText
                    value={slide.subtitle}
                    onSave={(v) => updateSlide({ subtitle: v })}
                    style={{ color: selectedTheme.textSecondary }}
                  />
                </p>
              )}
              <div className="flex-1 flex items-center">
                <div className="grid grid-cols-2 gap-2 w-full">
                  {slide.numberedCards.map((card, i) => (
                    <div 
                      key={i}
                      className="rounded-lg p-3 relative"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <div 
                        className="absolute -top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
                        style={{ 
                          backgroundColor: selectedTheme.primary,
                          color: '#FFFFFF'
                        }}
                      >
                        {card.number}
                      </div>
                      <div className="pt-3">
                        <h3 className="font-bold text-lg mb-3">
                          <EditableText
                            value={card.title}
                            onSave={(v) => updateNumberedCard(i, "title", v)}
                            style={{ color: selectedTheme.text }}
                          />
                        </h3>
                        <p className="text-base leading-relaxed">
                          <EditableText
                            value={card.description}
                            onSave={(v) => updateNumberedCard(i, "description", v)}
                            style={{ color: selectedTheme.textSecondary }}
                            multiline
                          />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          </div>
          
          <div className="w-1/2 p-4 flex items-center justify-center">
            {slide.image?.url ? (
              <div className="relative w-[85%] h-[85%] flex items-center justify-center group overflow-hidden rounded-lg">
                <img 
                  src={slide.image.url} 
                  alt={slide.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                {onGenerateImage && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button 
                      variant="secondary" 
                      size="icon"
                      className="h-7 w-7 shadow-lg"
                      onClick={onGenerateImage}
                      disabled={isGeneratingImage}
                      data-testid="button-regenerate-image"
                    >
                      {isGeneratingImage ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="h-7 w-7 shadow-lg"
                      onClick={() => slide.image && onSlideUpdate && onSlideUpdate({ ...slide, image: undefined })}
                      data-testid="button-delete-image"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="w-[85%] h-[85%] rounded-lg flex flex-col items-center justify-center gap-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <ImageIcon className="h-12 w-12" style={{ color: selectedTheme.textSecondary }} />
                {onGenerateImage && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={onGenerateImage}
                    disabled={isGeneratingImage}
                    data-testid="button-generate-slide-image"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ImageIcon className="h-4 w-4 mr-2" />
                    )}
                    Generate Image
                  </Button>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={currentIndex === totalSlides - 1}
          data-testid="button-next-slide"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      </DndContext>
      
      <div className="flex items-center justify-center gap-4">
        <span className="text-sm text-muted-foreground" data-testid="text-slide-counter">
          Slide {currentIndex + 1} of {totalSlides}
        </span>
      </div>
    </div>
  );
}
