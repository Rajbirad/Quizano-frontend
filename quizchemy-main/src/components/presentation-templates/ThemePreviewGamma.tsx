import React, { useState } from 'react';
import { RichSlidePreview } from './RichSlidePreview';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  colors: string[];
  bgClass: string;
  useCase: string;
}

interface ThemePreviewGammaProps {
  themes: ThemeOption[];
  selectedTheme: string;
  onThemeSelect: (themeId: string) => void;
}

export const ThemePreviewGamma: React.FC<ThemePreviewGammaProps> = ({
  themes,
  selectedTheme,
  onThemeSelect,
}) => {
  const selected = themes.find((t) => t.id === selectedTheme);
  const displayedThemes = themes.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Side - Theme Selection */}
      <div className="lg:col-span-1 flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">All Themes</h3>
          <p className="text-sm text-muted-foreground">View and select from all themes</p>
        </div>

        {/* Theme Search - Optional */}
        <div className="mb-6 hidden">
          <input
            type="search"
            placeholder="Search for a theme"
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Theme Grid */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-4">
          {displayedThemes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => onThemeSelect(theme.id)}
              className={`cursor-pointer transition-all rounded-lg overflow-hidden border-2 ${
                selectedTheme === theme.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'border-slate-200 hover:border-primary/50'
              }`}
            >
              {/* Theme Thumbnail */}
              <div
                className={`w-full h-24 bg-gradient-to-br ${theme.bgClass} flex flex-col items-center justify-center text-white p-3 relative`}
              >
                <p className="text-xs font-bold text-center leading-tight">{theme.name}</p>

                {/* Color Swatches */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {theme.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Theme Info */}
              <div className="p-3 bg-white">
                <p className="text-xs font-semibold text-foreground line-clamp-1">{theme.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{theme.useCase}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {themes.length > 5 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-4"
              >
                View More
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>All Themes ({themes.length})</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => onThemeSelect(theme.id)}
                      className={`cursor-pointer transition-all rounded-lg overflow-hidden border-2 ${
                        selectedTheme === theme.id
                          ? 'ring-2 ring-primary border-primary'
                          : 'border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      {/* Theme Thumbnail */}
                      <div
                        className={`w-full h-24 bg-gradient-to-br ${theme.bgClass} flex flex-col items-center justify-center text-white p-3 relative`}
                      >
                        <p className="text-xs font-bold text-center leading-tight">{theme.name}</p>

                        {/* Color Swatches */}
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          {theme.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-3 h-3 rounded-full border border-white/40"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Theme Info */}
                      <div className="p-3 bg-white">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{theme.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{theme.useCase}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Right Side - Large Preview */}
      {selected && (
        <div className="lg:col-span-2 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">{selected.name} Theme Preview</h3>
            <p className="text-sm text-muted-foreground">{selected.description}</p>
          </div>

          {/* Rich Single Slide Preview */}
          <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden shadow-2xl border border-slate-300">
            <RichSlidePreview
              theme={selectedTheme as any}
            />
          </div>
        </div>
      )}
    </div>
  );
};
