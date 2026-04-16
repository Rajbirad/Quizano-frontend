import React, { useState } from 'react';
import { ChevronDown, Eye, Code2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TitleSlide,
  BulletsSlide,
  TwoColumnImageLeft,
  ComparisonSlide,
  StatsSlide,
  SummarySlide,
} from './SlideTemplates';

/**
 * EXPLANATION: How Templates Work in AISlidesPresentation
 * 
 * STEP 1: User inputs content (text, upload, or prompt)
 * STEP 2: User selects theme (modern, classic, minimal, etc)
 * STEP 3: AI generates presentation using selected theme + template
 * 
 * Each template can be rendered with ANY theme
 * Theme changes only the colors/styling, not the content structure
 */

interface TemplatePreview {
  id: string;
  name: string;
  description: string;
}

export const TemplatesAndThemesExplainer: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<'modern' | 'classic' | 'minimal' | 'gradient' | 'dark' | 'colorful'>('modern');
  const [selectedTemplate, setSelectedTemplate] = useState<'bullets' | 'comparison' | 'stats' | 'title'>('bullets');
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'explanation'>('preview');

  const themes = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Blue → Purple gradient. Clean, contemporary',
      colors: ['#2563eb', '#9333ea'],
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Dark gray/slate. Professional, timeless',
      colors: ['#1e293b', '#0f172a'],
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'White + primary accent. Clean & readable',
      colors: ['#ffffff', '#3b82f6'],
    },
    {
      id: 'gradient',
      name: 'Gradient',
      description: 'Pink → Indigo. Vibrant, energetic',
      colors: ['#ec4899', '#6366f1'],
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Slate/Black. Dramatic, high contrast',
      colors: ['#0f172a', '#1e293b'],
    },
    {
      id: 'colorful',
      name: 'Colorful',
      description: 'Yellow → Pink. Playful, approachable',
      colors: ['#facc15', '#ec4899'],
    },
  ];

  const templateExamples: Record<string, TemplatePreview> = {
    title: {
      id: 'title',
      name: 'Title Slide',
      description: 'Opening slide with hero text and theme colors',
    },
    bullets: {
      id: 'bullets',
      name: 'Bullets Slide',
      description: 'Key points with theme-colored bullets',
    },
    comparison: {
      id: 'comparison',
      name: 'Comparison Slide',
      description: 'A vs B with theme-colored headers',
    },
    stats: {
      id: 'stats',
      name: 'Stats Slide',
      description: 'Metrics with theme-colored numbers',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            🎨 Templates + Themes: How It Works
          </h1>
          <p className="text-lg text-slate-600">
            Every template works with every theme. The theme only changes colors and styling, not content structure.
          </p>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Theme Selector */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Select Theme
              </h3>

              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id as any)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Color preview dots */}
                      <div className="flex gap-1">
                        {theme.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm text-slate-900">{theme.name}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selector */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ChevronDown className="w-5 h-5 text-blue-600" />
                Select Template
              </h3>

              <div className="space-y-2">
                {Object.values(templateExamples).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id as any)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-medium text-sm text-slate-900">{template.name}</span>
                    <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-sm text-slate-700">
                <strong>💡 Pro Tip:</strong> Change the theme while keeping the template same. You'll see only colors change, not content layout.
              </p>
            </div>
          </div>

          {/* Right Content: Preview + Code + Explanation */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-300">
              {['preview', 'code', 'explanation'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'preview' && <Eye className="inline w-4 h-4 mr-2" />}
                  {tab === 'code' && <Code2 className="inline w-4 h-4 mr-2" />}
                  {tab === 'preview' ? 'Preview' : tab === 'code' ? 'Code' : 'How It Works'}
                </button>
              ))}
            </div>

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
                <div className="aspect-video bg-slate-900 relative">
                  {selectedTemplate === 'bullets' && (
                    <BulletsSlide
                      title="Key Benefits"
                      bullets={[
                        'First important benefit',
                        'Second advantage here',
                        'Third reason to choose',
                        'Fourth compelling point',
                      ]}
                      theme={selectedTheme}
                    />
                  )}

                  {selectedTemplate === 'comparison' && (
                    <ComparisonSlide
                      title="Compare Options"
                      leftLabel="Old Approach"
                      rightLabel="Our Solution"
                      leftItems={['Slow', 'Expensive', 'Manual', 'Error-prone']}
                      rightItems={['Fast', 'Affordable', 'Automated', 'Reliable']}
                      theme={selectedTheme}
                    />
                  )}

                  {selectedTemplate === 'stats' && (
                    <StatsSlide
                      title="By The Numbers"
                      stats={[
                        { number: '100K', label: 'Users', suffix: '+' },
                        { number: '99.9', label: 'Uptime', suffix: '%' },
                        { number: '10x', label: 'Growth' },
                        { number: '24/7', label: 'Support' },
                      ]}
                      theme={selectedTheme}
                    />
                  )}

                  {selectedTemplate === 'title' && (
                    <TitleSlide
                      title="Amazing Presentation"
                      subtitle="With professional design"
                      theme={selectedTheme}
                    />
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    <strong>Theme:</strong> {selectedTheme} | <strong>Template:</strong>{' '}
                    {templateExamples[selectedTemplate].name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    👆 Change theme above to see colors update instantly. Change template to see layout change.
                  </p>
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && (
              <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 p-6">
                <pre className="text-sm text-slate-100 font-mono overflow-x-auto">
{`// How to use in your component

import { ${templateExamples[selectedTemplate].name.split(' ')[0]}Slide } from '@/components/presentation-templates';

export const MyPresentation = () => {
  const selectedTheme = '${selectedTheme}';
  
  return (
    <div>
      {/* Same component, different theme = different colors */}
      <${templateExamples[selectedTemplate].name.split(' ')[0]}Slide
        title="Your Content Here"
        // ... other props based on template
        theme={selectedTheme}  {/* ← Theme changes only colors */}
      />
    </div>
  );
};

// Flow:
// 1. User selects theme in UI
// 2. Component re-renders with theme prop
// 3. Only colors change, layout stays same
// 4. Creates consistent, themed presentation`}
                </pre>
              </div>
            )}

            {/* Explanation Tab */}
            {activeTab === 'explanation' && (
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white p-6 rounded-lg border-l-4 border-blue-600 shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">User Inputs Content</h4>
                      <p className="text-slate-600 text-sm">
                        User enters text, uploads file, or provides prompt in AISlidesGenerator. This content is stored in
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs">presentationData</code>
                      </p>
                      <div className="mt-3 bg-slate-50 p-3 rounded text-xs font-mono text-slate-700">
                        presentationData = {'{'}
                        <br />
                        &nbsp;&nbsp;inputType: 'text' | 'upload' | 'prompt',
                        <br />
                        &nbsp;&nbsp;content: 'user text here...',
                        <br />
                        &nbsp;&nbsp;file: File | undefined
                        <br />
                        {'}'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6 rounded-lg border-l-4 border-purple-600 shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">User Selects Theme & Template</h4>
                      <p className="text-slate-600 text-sm">
                        In AISlidesPresentation, user chooses:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        <li>✅ <strong>Theme:</strong> modern, classic, minimal, gradient, dark, colorful</li>
                        <li>✅ <strong>Template Style:</strong> bullets, comparison, stats, etc (optional - AI can choose)</li>
                        <li>✅ <strong>Image Source:</strong> auto, AI images, stock images, etc</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6 rounded-lg border-l-4 border-green-600 shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">AI Generates Presentation</h4>
                      <p className="text-slate-600 text-sm">
                        AI processes the content and generates slides:
                      </p>
                      <div className="mt-3 bg-slate-50 p-3 rounded text-xs font-mono text-slate-700">
                        Slide 1: TitleSlide with theme="modern"
                        <br />
                        Slide 2: BulletsSlide with theme="modern"
                        <br />
                        Slide 3: ComparisonSlide with theme="modern"
                        <br />
                        Slide 4: SummarySlide with theme="modern"
                        <br />
                        <br />
                        {/* Same theme for ALL slides = cohesive look */}
                      </div>
                      <p className="text-slate-600 text-sm mt-2">
                        ✅ <strong>Same theme for all slides</strong> = Professional, cohesive presentation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Insight */}
                <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg">
                  <h4 className="font-bold text-amber-900 mb-2">🔑 Key Insight: Templates vs Themes</h4>
                  <div className="space-y-2 text-sm text-amber-800">
                    <p>
                      <strong>Template:</strong> Determines the <u>LAYOUT</u> (grid, columns, sections, structure)
                    </p>
                    <p>
                      <strong>Theme:</strong> Determines the <u>COLORS</u> (background, text, accents, gradients)
                    </p>
                    <p className="mt-3">
                      <strong>Example:</strong> Using BulletsSlide with theme="modern" vs theme="dark" = same layout, different colors
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Theme Color Details */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Theme Color System</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {themes.map((theme) => (
              <div key={theme.id} className="text-center">
                {/* Color swatches */}
                <div className="flex gap-2 mb-4">
                  {theme.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-20 rounded-lg shadow-md border border-slate-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Theme name */}
                <h3 className="font-bold text-slate-900">{theme.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{theme.description}</p>

                {/* Usage hint */}
                <code className="text-xs bg-slate-100 px-2 py-1 rounded inline-block mt-2 text-slate-700">
                  theme="{theme.id}"
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Workflow Diagram */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Complete Workflow</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 border-2 border-blue-600 rounded-lg p-4 flex-1">
                <p className="font-bold text-blue-900">User Input</p>
                <p className="text-sm text-blue-800">Text, file, or prompt</p>
              </div>
              <div className="text-2xl text-slate-400">→</div>
              <div className="bg-purple-100 border-2 border-purple-600 rounded-lg p-4 flex-1">
                <p className="font-bold text-purple-900">Select Theme</p>
                <p className="text-sm text-purple-800">6 professional themes</p>
              </div>
              <div className="text-2xl text-slate-400">→</div>
              <div className="bg-green-100 border-2 border-green-600 rounded-lg p-4 flex-1">
                <p className="font-bold text-green-900">AI Generates</p>
                <p className="text-sm text-green-800">23 template options</p>
              </div>
              <div className="text-2xl text-slate-400">→</div>
              <div className="bg-amber-100 border-2 border-amber-600 rounded-lg p-4 flex-1">
                <p className="font-bold text-amber-900">View Presentation</p>
                <p className="text-sm text-amber-800">Full-screen preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesAndThemesExplainer;
