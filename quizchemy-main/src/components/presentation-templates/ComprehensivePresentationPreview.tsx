import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  TitleSlide,
  BulletsSlide,
  TwoColumnImageLeft,
  ImageGrid,
  ComparisonSlide,
  TimelineSlide,
  StatsSlide,
  ContentIconList,
} from './SlideTemplates';
import { Button } from '@/components/ui/button';

interface ComprehensivePresentationPreviewProps {
  theme: 'modern' | 'classic' | 'minimal' | 'gradient' | 'dark' | 'colorful';
}

export const ComprehensivePresentationPreview: React.FC<ComprehensivePresentationPreviewProps> = ({ theme }) => {
  const [expandedSlide, setExpandedSlide] = useState<number | null>(0);

  // Mock data that would come from FastAPI extraction
  const slideShowcase = [
    {
      id: 1,
      type: 'Title Slide',
      component: (
        <TitleSlide
          title="Your Presentation Title"
          subtitle="Subtitle goes here - Add your main topic"
          theme={theme}
        />
      ),
    },
    {
      id: 2,
      type: 'Key Points',
      component: (
        <BulletsSlide
          title="Key Benefits"
          bullets={[
            'Professional design that impresses audiences',
            'Easy to customize and update content',
            'AI-powered content generation',
            'Perfect for any presentation type',
          ]}
          theme={theme}
        />
      ),
    },
    {
      id: 3,
      type: 'Two Column Layout',
      component: (
        <TwoColumnImageLeft
          title="Feature Overview"
          image="https://via.placeholder.com/600x400?text=Feature+Image"
          content={["Text content describing your features and benefits goes here. This layout is perfect for combining text with visual elements."]}
          theme={theme}
        />
      ),
    },
    {
      id: 4,
      type: 'Image Gallery',
      component: (
        <ImageGrid
          title="Gallery Showcase"
          images={[
            { src: 'https://via.placeholder.com/400x300?text=Image+1', caption: 'Image 1' },
            { src: 'https://via.placeholder.com/400x300?text=Image+2', caption: 'Image 2' },
            { src: 'https://via.placeholder.com/400x300?text=Image+3', caption: 'Image 3' },
          ]}
          columns={3}
          theme={theme}
        />
      ),
    },
    {
      id: 5,
      type: 'Comparison',
      component: (
        <ComparisonSlide
          title="Comparison Analysis"
          leftLabel="Option A"
          rightLabel="Option B"
          leftItems={['✓ Fast', '✓ Affordable', '✓ High Quality']}
          rightItems={['✗ Slow', '✗ Expensive', '✓ High Quality']}
          theme={theme}
        />
      ),
    },
    {
      id: 6,
      type: 'Timeline',
      component: (
        <TimelineSlide
          title="Project Timeline"
          events={[
            { year: 'Phase 1', title: 'Research & Planning', description: 'Initial discovery and strategy' },
            { year: 'Phase 2', title: 'Design & Development', description: 'Building the solution' },
            { year: 'Phase 3', title: 'Testing & Launch', description: 'Quality assurance and deployment' },
          ]}
          theme={theme}
        />
      ),
    },
    {
      id: 7,
      type: 'Statistics',
      component: (
        <StatsSlide
          title="Key Metrics"
          stats={[
            { number: '10K+', label: 'Users', suffix: '' },
            { number: '250%', label: 'Growth', suffix: '' },
            { number: '98%', label: 'Satisfaction', suffix: '' },
          ]}
          theme={theme}
        />
      ),
    },
    {
      id: 8,
      type: 'Key Features',
      component: (
        <ContentIconList
          title="Our Features"
          items={[
            { icon: '🚀', title: 'Fast', description: 'Lightning quick performance' },
            { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
            { icon: '💰', title: 'Affordable', description: 'Cost-effective pricing' },
            { icon: '🌍', title: 'Global', description: 'Available worldwide' },
          ]}
          columns={2}
          theme={theme}
        />
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {/* Overview Info */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg p-4 mb-6 border border-primary/20">
        <p className="text-sm text-foreground font-medium">
          ✨ This preview shows how <strong>all types of slides</strong> will look with your selected theme
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Click on any slide to expand and see it in full size. When you generate your presentation, we'll apply this theme to all your content.
        </p>
      </div>

      {/* Slides Gallery */}
      <div className="space-y-3">
        {slideShowcase.map((slide, index) => (
          <div
            key={slide.id}
            className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 hover:border-primary/50 transition-colors"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedSlide(expandedSlide === index ? null : index)}
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-foreground">{slide.type}</h3>
              </div>
              {expandedSlide === index ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Preview */}
            {expandedSlide === index && (
              <div className="bg-white p-4 border-t border-slate-200">
                <div className="bg-slate-100 rounded-lg overflow-hidden shadow-md">
                  <div className="aspect-video">
                    {slide.component}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 This is a live preview of the <strong>{slide.type}</strong> slide. Your actual content will be inserted here automatically.
                </p>
              </div>
            )}

            {/* Compact Preview when Collapsed */}
            {expandedSlide !== index && (
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 border-t border-slate-200 max-h-32 overflow-hidden">
                <div className="aspect-video scale-[0.35] origin-top-left opacity-70 pointer-events-none">
                  {slide.component}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-900 mb-2">🎯 What happens next:</p>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>✅ <strong>You upload a file</strong> - PDF, Word, Text, etc.</li>
          <li>✅ <strong>FastAPI extracts content</strong> - Automatically pulls key information</li>
          <li>✅ <strong>AI maps content to slides</strong> - Organizes into appropriate slide types</li>
          <li>✅ <strong>Theme applied</strong> - All slides styled with your selected theme</li>
          <li>✅ <strong>Beautiful presentation ready</strong> - Download and present immediately</li>
        </ol>
      </div>

      {/* Key Features of This Theme */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <p className="text-sm font-semibold text-purple-900 mb-3">🎨 This Theme Includes:</p>
        <ul className="grid grid-cols-2 gap-2 text-xs text-purple-800">
          <li>✨ <strong>8 Slide Types</strong> - From titles to statistics</li>
          <li>📱 <strong>Responsive Design</strong> - Works on all devices</li>
          <li>🎯 <strong>Multiple Layouts</strong> - Bullets, columns, grids</li>
          <li>🖼️ <strong>Image Support</strong> - Gallery, featured images</li>
          <li>📊 <strong>Data Visualization</strong> - Comparisons, timelines, stats</li>
          <li>🎨 <strong>Consistent Styling</strong> - Theme applied everywhere</li>
        </ul>
      </div>
    </div>
  );
};
