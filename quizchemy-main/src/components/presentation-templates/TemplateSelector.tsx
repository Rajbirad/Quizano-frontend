import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Layout,
  Zap,
  BarChart3,
  Clock,
  Grid3x3,
  BookOpen,
  TrendingUp,
  Quote,
  Layers,
  Image,
} from 'lucide-react';

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  useCase: string;
}

const templates: TemplateOption[] = [
  {
    id: 'title',
    name: 'Title Slide',
    description: 'Professional opening slide with title and subtitle',
    icon: <Zap className="w-6 h-6" />,
    category: 'Opening',
    useCase: 'Start your presentation with impact',
  },
  {
    id: 'section',
    name: 'Section Header',
    description: 'Divide presentation into clear sections',
    icon: <Layout className="w-6 h-6" />,
    category: 'Structure',
    useCase: 'Break up content logically',
  },
  {
    id: 'bullets',
    name: 'Bullets',
    description: 'Key points with optional accompanying image',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'Content',
    useCase: 'List important information',
  },
  {
    id: 'two-col-img-left',
    name: 'Image Left + Text',
    description: 'Image on left side, text content on right',
    icon: <Image className="w-6 h-6" />,
    category: 'Layout',
    useCase: 'Showcase visuals with explanation',
  },
  {
    id: 'two-col-text-left',
    name: 'Text Left + Image',
    description: 'Text content on left, image on right',
    icon: <Layers className="w-6 h-6" />,
    category: 'Layout',
    useCase: 'Lead with message, support with visuals',
  },
  {
    id: 'image-grid',
    name: 'Image Gallery',
    description: 'Grid of images with captions',
    icon: <Grid3x3 className="w-6 h-6" />,
    category: 'Media',
    useCase: 'Display multiple images',
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Side-by-side comparison of two options',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Analysis',
    useCase: 'Compare pros and cons',
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Inspirational or powerful quote slide',
    icon: <Quote className="w-6 h-6" />,
    category: 'Emphasis',
    useCase: 'Highlight important messages',
  },
  {
    id: 'icon-list',
    name: 'Features',
    description: 'Icons with titles and descriptions',
    icon: <Zap className="w-6 h-6" />,
    category: 'Content',
    useCase: 'Showcase features or benefits',
  },
  {
    id: 'stats',
    name: 'Statistics',
    description: 'Display key metrics and numbers',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'Data',
    useCase: 'Show important metrics',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological sequence of events',
    icon: <Clock className="w-6 h-6" />,
    category: 'Narrative',
    useCase: 'Tell your story over time',
  },
  {
    id: 'agenda',
    name: 'Agenda',
    description: 'Overview of topics to be covered',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'Structure',
    useCase: 'Outline what you will cover',
  },
  {
    id: 'summary',
    name: 'Summary',
    description: 'Closing slide with call-to-action',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Closing',
    useCase: 'End with impact and next steps',
  },
  {
    id: 'full-text',
    name: 'Full-Width Text',
    description: 'Emphasis on text content with minimal design',
    icon: <Layers className="w-6 h-6" />,
    category: 'Content',
    useCase: 'Highlight thought leadership',
  },
];

export const TemplateSelector: React.FC<{
  onSelect?: (templateId: string) => void;
  selectedId?: string;
}> = ({ onSelect, selectedId }) => {
  const categories = Array.from(new Set(templates.map((t) => t.category)));

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Overview Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Presentation Templates</h1>
        <p className="text-lg text-slate-600">
          Choose from 14+ professional slide templates inspired by Gamma and Beautiful.ai. Each template is fully
          customizable with 6 different themes.
        </p>
      </div>

      {/* Templates Grid - Grouped by Category */}
      {categories.map((category) => {
        const categoryTemplates = templates.filter((t) => t.category === category);

        return (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect?.(template.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-lg ${
                    selectedId === template.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`p-3 rounded-lg ${
                        selectedId === template.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{template.name}</h3>
                      <span className="text-xs text-slate-500">{template.category}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                  <p className="text-xs text-blue-600 font-medium">💡 {template.useCase}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Templates You Might Be Missing Section */}
      <div className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg border-2 border-purple-200">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Alternative Layouts (Like Gamma & Beautiful.ai)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Additional Pro Templates */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">✨ Interactive Elements</h4>
            <p className="text-slate-600 text-sm mb-3">
              Add interactive components like sliders, toggles, and animated counters (coming soon)
            </p>
            <div className="text-xs text-slate-500">Perfect for: Interactive demos, live presentations</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">🎬 Before & After</h4>
            <p className="text-slate-600 text-sm mb-3">
              Side-by-side slider showing before and after transformations
            </p>
            <div className="text-xs text-slate-500">Perfect for: Product changes, improvements, case studies</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">🗺️ Flowchart/Process</h4>
            <p className="text-slate-600 text-sm mb-3">
              Visual representation of steps, workflows, or hierarchies
            </p>
            <div className="text-xs text-slate-500">Perfect for: Procedures, decision trees, organizational structure</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">📊 Advanced Charts</h4>
            <p className="text-slate-600 text-sm mb-3">
              Interactive charts, graphs, and data visualizations with animations
            </p>
            <div className="text-xs text-slate-500">Perfect for: Financial data, analytics, reports</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">👥 Team/Testimonials</h4>
            <p className="text-slate-600 text-sm mb-3">
              Display team members or customer testimonials in grid or carousel
            </p>
            <div className="text-xs text-slate-500">Perfect for: Team introductions, social proof, testimonials</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">🎯 Call-to-Action Variations</h4>
            <p className="text-slate-600 text-sm mb-3">
              Multiple CTA layouts: contact form, signup, download, schedule demo
            </p>
            <div className="text-xs text-slate-500">Perfect for: Lead generation, conversions, engagement</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-slate-700">
          <strong>Pro Tip:</strong> Combine templates creatively! Use different themes for different sections to create
          visual hierarchy and maintain audience engagement throughout your presentation.
        </div>
      </div>

      {/* Best Practices */}
      <div className="mt-12 bg-slate-50 p-8 rounded-lg">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Best Practices</h3>
        <ul className="space-y-3 text-slate-700">
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">1.</span>
            <span>
              <strong>Use 3-5 templates max</strong> - Consistency helps with flow. Pick 2-3 main templates and rotate
              for variety.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">2.</span>
            <span>
              <strong>Start with Title → Bullets → Comparison → Summary</strong> - This is the classic presentation
              flow used by professionals.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">3.</span>
            <span>
              <strong>One theme throughout</strong> - Stick with one theme for professional appearance. Switch themes
              only for major section breaks.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">4.</span>
            <span>
              <strong>Less is more</strong> - Don't overcomplicate. Clean layouts outperform busy ones 10:1 in audience
              retention.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">5.</span>
            <span>
              <strong>Image quality matters</strong> - Use high-quality images. Poor quality looks unprofessional and
              damages credibility.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TemplateSelector;
