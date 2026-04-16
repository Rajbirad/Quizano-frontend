import { Check, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { presentationThemes, type ThemeId } from "@/shared/schema";

interface ThemeCardProps {
  themeId: ThemeId;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemeCard({ themeId, isSelected, onSelect }: ThemeCardProps) {
  const theme = presentationThemes[themeId];
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative rounded-lg overflow-hidden transition-all text-left w-full",
        "border-2",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover-elevate"
      )}
      data-testid={`theme-card-${themeId}`}
    >
      <div 
        className="aspect-[16/10] p-4 flex flex-col relative"
        style={{ background: theme.gradient }}
      >
        <span 
          className="text-[10px] font-medium mb-3 opacity-80"
          style={{ color: theme.text }}
        >
          Your Logo
        </span>
        
        <h3 
          className="text-sm font-bold mb-1"
          style={{ color: theme.text }}
        >
          Presentation Title
        </h3>
        
        <p 
          className="text-[10px] mb-3"
          style={{ color: theme.textSecondary }}
        >
          This is body text showing how content appears
        </p>
        
        <div className="flex gap-2">
          <span 
            className="text-[9px] px-2 py-1 rounded"
            style={{ 
              backgroundColor: theme.buttonBg, 
              color: theme.buttonText 
            }}
          >
            Button
          </span>
          <span 
            className="text-[9px] px-2 py-1 rounded border"
            style={{ 
              borderColor: theme.buttonBg,
              color: theme.text
            }}
          >
            Link
          </span>
        </div>
        
        <div 
          className="absolute bottom-3 right-3 w-8 h-8 rounded flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <ImageIcon className="w-4 h-4" style={{ color: theme.text }} />
        </div>
        
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
      
      <div className="bg-card p-3 border-t border-border">
        <span className="text-sm font-medium block mb-2">{theme.name}</span>
        <div className="flex gap-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: theme.primary }}
          />
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: theme.secondary }}
          />
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: theme.accent }}
          />
        </div>
      </div>
    </button>
  );
}
