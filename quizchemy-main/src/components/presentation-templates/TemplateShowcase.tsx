import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from './SlideTemplates';

interface Template {
  id: string;
  name: string;
  category: 'hero' | 'content' | 'comparison' | 'layout' | 'media' | 'closing';
  component: React.ReactNode;
  description: string;
}

export const TemplateShowcase: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<'modern' | 'classic' | 'minimal' | 'gradient' | 'dark' | 'colorful'>('modern');
  const [currentSlide, setCurrentSlide] = useState(0);

  const templates: Template[] = [
    {
      id: 'title',
      name: 'Title Slide',
      category: 'hero',
      description: 'Hero slide to start your presentation',
      component: (
        <TitleSlide
          title="Your Presentation Title"
          subtitle="With an inspiring subtitle"
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'section',
      name: 'Section Header',
      category: 'hero',
      description: 'Section divider with number',
      component: (
        <SectionHeader
          title="Main Topic"
          description="Break your presentation into logical sections"
          number={1}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'bullets',
      name: 'Bullets Slide',
      category: 'content',
      description: 'Key points with optional image',
      component: (
        <BulletsSlide
          title="Key Points"
          bullets={[
            'First important point to consider',
            'Second benefit or feature',
            'Third reason why this matters',
            'Fourth takeaway for audience',
          ]}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'two-col-img-left',
      name: 'Two-Column (Image Left)',
      category: 'layout',
      description: 'Image on left, text on right',
      component: (
        <TwoColumnImageLeft
          image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
          title="Visual Impact"
          content={[
            'Strong imagery helps communicate your message',
            'Paired with concise text for clarity',
            'Perfect for storytelling and impact',
          ]}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'two-col-text-left',
      name: 'Two-Column (Text Left)',
      category: 'layout',
      description: 'Text on left, image on right',
      component: (
        <TwoColumnTextLeft
          title="Focus on Message"
          content={[
            'Lead with your most important message',
            'Support with relevant imagery',
            'Creates balanced visual composition',
          ]}
          image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'image-grid',
      name: 'Image Grid',
      category: 'media',
      description: 'Gallery of images with captions',
      component: (
        <ImageGrid
          title="Image Gallery"
          images={[
            { src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', caption: 'Innovation' },
            { src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', caption: 'Growth' },
            { src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', caption: 'Impact' },
          ]}
          columns={3}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'comparison',
      name: 'Comparison Slide',
      category: 'comparison',
      description: 'Side-by-side comparison of two options',
      component: (
        <ComparisonSlide
          title="Compare & Contrast"
          leftLabel="Option A"
          rightLabel="Option B"
          leftItems={['Feature 1', 'Feature 2', 'Feature 3']}
          rightItems={['Benefit 1', 'Benefit 2', 'Benefit 3']}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'quote',
      name: 'Quote Slide',
      category: 'closing',
      description: 'Inspirational or powerful quote',
      component: (
        <QuoteSlide
          quote="The only way to do great work is to love what you do"
          author="Steve Jobs"
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'icon-list',
      name: 'Content + Icon List',
      category: 'content',
      description: 'Features with icons and descriptions',
      component: (
        <ContentIconList
          title="Key Features"
          items={[
            { icon: '🚀', title: 'Fast', description: 'Lightning quick performance' },
            { icon: '🎨', title: 'Beautiful', description: 'Stunning design out of box' },
            { icon: '🔧', title: 'Flexible', description: 'Customize everything easily' },
            { icon: '📱', title: 'Responsive', description: 'Works on all devices' },
          ]}
          columns={2}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'summary',
      name: 'Summary Slide',
      category: 'closing',
      description: 'Closing slide with call-to-action',
      component: (
        <SummarySlide
          title="Key Takeaways"
          summary={['Point 1: Core idea', 'Point 2: Important concept', 'Point 3: Main benefit']}
          cta={{ text: 'Ready to get started?', subtext: 'Join thousands using QuizChemy' }}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'timeline',
      name: 'Timeline Slide',
      category: 'content',
      description: 'Chronological event timeline',
      component: (
        <TimelineSlide
          title="Our Journey"
          events={[
            { year: '2022', title: 'Launch', description: 'Product launch to market' },
            { year: '2023', title: 'Growth', description: '100K+ users joined' },
            { year: '2024', title: 'Expansion', description: 'New features released' },
          ]}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'stats',
      name: 'Stats Slide',
      category: 'content',
      description: 'Key metrics and statistics',
      component: (
        <StatsSlide
          title="By The Numbers"
          stats={[
            { number: '50', label: 'Customers', suffix: '+' },
            { number: '99.9', label: 'Uptime', suffix: '%' },
            { number: '24/7', label: 'Support' },
            { number: '10x', label: 'Growth' },
          ]}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'agenda',
      name: 'Agenda Slide',
      category: 'content',
      description: 'Overview of topics to cover',
      component: (
        <AgendaSlide
          title="Today's Agenda"
          items={[
            { number: '01', title: 'Introduction', description: 'Welcome and overview' },
            { number: '02', title: 'Main Content', description: 'Deep dive into key topics' },
            { number: '03', title: 'Conclusion', description: 'Wrap up and Q&A' },
          ]}
          theme={selectedTheme}
        />
      ),
    },
    {
      id: 'full-text',
      name: 'Full-Width Text',
      category: 'content',
      description: 'Emphasis on text content',
      component: (
        <FullWidthText
          heading="Make an Impact"
          subheading="With Powerful Words"
          bodyText="Use this layout when you want to emphasize text-heavy content with a clean, minimal design. Perfect for thought leadership or powerful messages."
          theme={selectedTheme}
        />
      ),
    },
  ];

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? templates.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === templates.length - 1 ? 0 : prev + 1));
  };

  const currentTemplate = templates[currentSlide];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Slide Preview */}
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <div className="w-full h-full">{currentTemplate.component}</div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft size={32} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight size={32} />
        </button>

        {/* Slide Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {currentSlide + 1} / {templates.length}
        </div>
      </div>

      {/* Controls Panel */}
      <div className="bg-slate-900 border-t border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Theme Selector */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Theme:</h3>
            <div className="flex gap-2 flex-wrap">
              {(['modern', 'classic', 'minimal', 'gradient', 'dark', 'colorful'] as const).map(
                (theme) => (
                  <Button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    variant={selectedTheme === theme ? 'default' : 'outline'}
                    className={selectedTheme === theme ? '' : 'text-white'}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Template Info */}
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <h2 className="text-white text-lg font-semibold mb-1">{currentTemplate.name}</h2>
            <p className="text-slate-400 text-sm mb-2">{currentTemplate.description}</p>
            <span className="inline-block bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded">
              {currentTemplate.category}
            </span>
          </div>

          {/* Template Grid */}
          <h3 className="text-white font-semibold mb-3">All Templates:</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 overflow-x-auto pb-2">
            {templates.map((template, idx) => (
              <button
                key={template.id}
                onClick={() => setCurrentSlide(idx)}
                className={`p-2 rounded text-xs text-center transition-all whitespace-nowrap ${
                  currentSlide === idx
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateShowcase;
