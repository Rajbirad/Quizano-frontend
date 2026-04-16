import { cn } from "@/lib/utils";

export interface StepItem {
  label: string;
  description: string;
}

export interface ComparisonItem {
  label: string;
  left: string;
  right: string;
}

export interface SlideImage {
  url: string;
  prompt: string;
}

export type BulletStyle = "bullet" | "numbered" | "checkmark" | "arrow" | "star";

export interface ColumnItem {
  heading: string;
  body: string;
}

export interface SectionItem {
  heading: string;
  body: string;
}

export interface Callout {
  title: string;
  body: string;
}

export interface GridItem {
  title: string;
  description: string;
}

export interface CardItem {
  icon: string;
  title: string;
  description: string;
}

export interface HorizontalStep {
  number: string;
  title: string;
  description: string;
}

export interface NumberedCard {
  number: number;
  title: string;
  description: string;
}

export interface PositionOverride {
  xPct: number;
  yPct: number;
}

export type LayoutOverrides = Record<string, PositionOverride>;

export interface Slide {
  id: string;
  type: "title" | "content" | "bullets" | "steps" | "comparison" | "columns" | "sections" | "grid" | "cards" | "horizontal-steps" | "numbered-cards";
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  bulletStyle?: BulletStyle;
  steps?: StepItem[];
  comparison?: {
    leftTitle: string;
    rightTitle: string;
    items: ComparisonItem[];
  };
  columns?: ColumnItem[];
  sections?: SectionItem[];
  grid?: GridItem[];
  cards?: CardItem[];
  horizontalSteps?: HorizontalStep[];
  numberedCards?: NumberedCard[];
  callout?: Callout;
  image?: SlideImage;
  layoutOverrides?: LayoutOverrides;
}

interface SlideCardProps {
  slide: Slide;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

export function SlideCard({ slide, isActive, onClick, index }: SlideCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-32 h-18 flex-shrink-0 rounded-md border-2 p-2 text-left transition-all overflow-hidden",
        isActive 
          ? "border-primary ring-2 ring-primary/20" 
          : "border-border hover-elevate"
      )}
      data-testid={`slide-thumb-${slide.id}`}
    >
      <div className="w-full h-full bg-card rounded-sm overflow-hidden relative">
        <div className="absolute inset-0 p-1.5 flex flex-col">
          <p className="text-[6px] font-semibold truncate leading-tight">{slide.title}</p>
          {slide.type === "bullets" && slide.bullets && (
            <div className="mt-0.5 space-y-0.5">
              {slide.bullets.slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-start gap-0.5">
                  <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground mt-[2px] flex-shrink-0" />
                  <span className="text-[4px] text-muted-foreground truncate leading-tight">{b}</span>
                </div>
              ))}
            </div>
          )}
          {slide.type === "content" && slide.content && (
            <p className="text-[4px] text-muted-foreground mt-0.5 line-clamp-3 leading-tight">{slide.content}</p>
          )}
          {slide.type === "title" && slide.subtitle && (
            <p className="text-[4px] text-muted-foreground mt-0.5 truncate">{slide.subtitle}</p>
          )}
          {slide.type === "steps" && slide.steps && (
            <div className="mt-0.5 space-y-0">
              {slide.steps.slice(0, 3).map((step, i) => (
                <div key={i} className="flex items-center gap-0.5">
                  <svg viewBox="0 0 50 60" className="w-3 h-3.5 flex-shrink-0">
                    <path d="M0 0 L35 0 L50 30 L35 60 L0 60 L15 30 Z" className="fill-primary/30" />
                    <text x="25" y="32" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="bold" className="fill-primary">{i + 1}</text>
                  </svg>
                  <span className="text-[4px] text-muted-foreground truncate leading-tight font-medium">{step.label}</span>
                </div>
              ))}
            </div>
          )}
          {slide.type === "comparison" && slide.comparison && (
            <div className="mt-0.5 flex gap-0.5">
              <div className="flex-1 text-[3px] text-muted-foreground truncate">{slide.comparison.leftTitle}</div>
              <div className="flex-1 text-[3px] text-muted-foreground truncate">{slide.comparison.rightTitle}</div>
            </div>
          )}
          {slide.type === "columns" && slide.columns && (
            <div className="mt-0.5 flex gap-0.5">
              {slide.columns.slice(0, 3).map((col, i) => (
                <div key={i} className="flex-1">
                  <span className="text-[3px] text-muted-foreground font-bold truncate block">{col.heading}</span>
                </div>
              ))}
            </div>
          )}
          {slide.type === "sections" && slide.sections && (
            <div className="mt-0.5 space-y-0.5">
              {slide.sections.slice(0, 2).map((section, i) => (
                <span key={i} className="text-[3px] text-muted-foreground font-bold truncate block">{section.heading}</span>
              ))}
            </div>
          )}
          {slide.type === "grid" && slide.grid && (
            <div className="mt-0.5 grid grid-cols-2 gap-0.5">
              {slide.grid.slice(0, 4).map((item, i) => (
                <span key={i} className="text-[3px] text-muted-foreground truncate">{item.title}</span>
              ))}
            </div>
          )}
          {slide.type === "horizontal-steps" && slide.horizontalSteps && (
            <div className="mt-0.5 flex gap-0.5">
              {slide.horizontalSteps.slice(0, 3).map((step, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-[4px] text-muted-foreground font-bold block">{step.number}</span>
                  <span className="text-[3px] text-muted-foreground truncate block">{step.title}</span>
                </div>
              ))}
            </div>
          )}
          {slide.type === "numbered-cards" && slide.numberedCards && (
            <div className="mt-0.5 grid grid-cols-2 gap-0.5">
              {slide.numberedCards.slice(0, 4).map((card, i) => (
                <div key={i} className="flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-primary/30 flex items-center justify-center text-[4px] font-bold text-primary">{card.number}</span>
                  <span className="text-[3px] text-muted-foreground truncate flex-1">{card.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="absolute bottom-0.5 right-1">
          <span className="text-[5px] text-muted-foreground font-mono">{index + 1}</span>
        </div>
      </div>
    </button>
  );
}
