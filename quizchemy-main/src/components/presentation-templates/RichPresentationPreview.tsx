import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TitleSlide,
  BulletsSlide,
  TwoColumnImageLeft,
  ImageGrid,
  StatsSlide,
  TimelineSlide,
  ContentIconList,
  SummarySlide,
} from './SlideTemplates';

interface RichPresentationPreviewProps {
  theme: 'modern' | 'classic' | 'minimal' | 'gradient' | 'dark' | 'colorful';
}

export const RichPresentationPreview: React.FC<RichPresentationPreviewProps> = ({ theme }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample presentation slides that would be generated from user's content
  const slides = [
    {
      id: 1,
      title: 'Title Slide',
      component: (
        <TitleSlide
          title="Your Document Summary"
          subtitle="AI-Generated Presentation with Beautiful Design"
          theme={theme}
        />
      ),
    },
    {
      id: 2,
      title: 'Key Topics',
      component: (
        <BulletsSlide
          title="Main Topics Covered"
          bullets={[
            'Deep understanding of core concepts',
            'Practical implementation strategies',
            'Real-world case studies and examples',
            'Best practices and recommendations',
          ]}
          theme={theme}
        />
      ),
    },
    {
      id: 3,
      title: 'Content Overview',
      component: (
        <TwoColumnImageLeft
          title="Content Structure"
          image="https://via.placeholder.com/600x400?text=Content+Overview"
          content={[
            'Your document is organized into key sections with visual support.',
            'Each section includes detailed explanations and real-world examples.',
            'The content is presented in an easy-to-follow format for maximum engagement.',
          ]}
          theme={theme}
        />
      ),
    },
    {
      id: 4,
      title: 'Key Statistics',
      component: (
        <StatsSlide
          title="Important Metrics"
          stats={[
            { number: '95%', label: 'Success Rate', suffix: '' },
            { number: '1M+', label: 'Users Impacted', suffix: '' },
            { number: '3x', label: 'Growth Factor', suffix: '' },
          ]}
          theme={theme}
        />
      ),
    },
    {
      id: 5,
      title: 'Implementation Timeline',
      component: (
        <TimelineSlide
          title="Project Phases"
          events={[
            {
              year: '📋 Phase 1',
              title: 'Planning & Research',
              description: 'Understanding requirements and defining scope',
            },
            {
              year: '🔨 Phase 2',
              title: 'Development',
              description: 'Building core features and functionality',
            },
            {
              year: '✅ Phase 3',
              title: 'Testing & Optimization',
              description: 'Quality assurance and performance tuning',
            },
            {
              year: '🚀 Phase 4',
              title: 'Launch & Deployment',
              description: 'Release to production with monitoring',
            },
          ]}
          theme={theme}
        />
      ),
    },
    {
      id: 6,
      title: 'Key Features',
      component: (
        <ContentIconList
          title="What We Deliver"
          items={[
            {
              icon: '🎯',
              title: 'Targeted Solutions',
              description: 'Customized to your specific needs',
            },
            {
              icon: '⚡',
              title: 'High Performance',
              description: 'Optimized for speed and efficiency',
            },
            {
              icon: '🔒',
              title: 'Enterprise Security',
              description: 'Industry-leading security standards',
            },
            {
              icon: '📈',
              title: 'Scalable Growth',
              description: 'Grows with your business needs',
            },
          ]}
          columns={2}
          theme={theme}
        />
      ),
    },
    {
      id: 7,
      title: 'Gallery',
      component: (
        <ImageGrid
          title="Visual Examples"
          images={[
            {
              src: 'https://via.placeholder.com/400x300?text=Example+1',
              caption: 'Real-world Application',
            },
            {
              src: 'https://via.placeholder.com/400x300?text=Example+2',
              caption: 'Implementation Example',
            },
            {
              src: 'https://via.placeholder.com/400x300?text=Example+3',
              caption: 'Case Study',
            },
          ]}
          columns={3}
          theme={theme}
        />
      ),
    },
    {
      id: 8,
      title: 'Summary',
      component: (
        <SummarySlide
          title="Key Takeaways"
          summary={[
            'Transform your ideas into beautiful presentations instantly',
            'AI-powered content extraction from documents',
            'Professional design applied automatically',
            'Ready to share and present immediately',
          ]}
          cta={{
            text: 'Ready to Present?',
            subtext: 'Your presentation is ready to download and share',
          }}
          theme={theme}
        />
      ),
    },
  ];

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Slide Display */}
      <div className="relative w-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
        {/* Slide Container */}
        <div className="relative w-full aspect-video bg-white">
          {slides[currentSlide].component}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Slide Info */}
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{slides[currentSlide].title}</p>
          <p className="text-xs text-muted-foreground">
            Slide {currentSlide + 1} of {slides.length}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-2">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 h-16 w-24 rounded-lg border-2 transition-all overflow-hidden ${
              currentSlide === index
                ? 'border-primary ring-2 ring-primary'
                : 'border-slate-200 hover:border-primary/50'
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-600">{index + 1}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="font-semibold text-blue-900 mb-2">✨ This is your final presentation</p>
        <p className="text-blue-800">
          When you upload your document, FastAPI extracts the content and organizes it into these beautiful slides. 
          Each slide type is automatically applied based on the content type, and your selected theme styling is applied to every slide.
        </p>
      </div>
    </div>
  );
};
