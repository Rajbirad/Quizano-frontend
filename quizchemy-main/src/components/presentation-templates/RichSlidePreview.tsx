import React from 'react';
import { ChevronSteps } from './ChevronSteps';
import { Image as ImageIcon } from 'lucide-react';

interface RichSlidePreviewProps {
  theme: 'modern' | 'classic' | 'gradient' | 'dark' | 'colorful' | 'light' | 'deepblue' | 'crimson' | 'teal' | 'cosmic' | 'sage' | 'neon' | 'midnight' | 'ocean' | 'coral';
}

// Get theme-specific colors
const getThemeColors = (theme: string) => {
  const themes: Record<string, {
    bg: string;
    heading: string;
    subheading: string;
    text: string;
    cardBg: string;
    cardBorder: string;
    button: string;
    buttonOutline: string;
    accent: string;
    step: string;
  }> = {
    modern: {
      bg: 'bg-white',
      heading: 'text-blue-600',
      subheading: 'text-purple-600',
      text: 'text-gray-700',
      cardBg: 'bg-purple-50',
      cardBorder: 'border-purple-200',
      button: 'bg-blue-600 text-white hover:bg-blue-700',
      buttonOutline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      accent: 'bg-blue-100',
      step: 'bg-blue-600 text-white',
    },
    classic: {
      bg: 'bg-white',
      heading: 'text-slate-900',
      subheading: 'text-slate-700',
      text: 'text-gray-700',
      cardBg: 'bg-slate-100',
      cardBorder: 'border-slate-300',
      button: 'bg-slate-900 text-white hover:bg-slate-800',
      buttonOutline: 'border-2 border-slate-900 text-slate-900 hover:bg-slate-50',
      accent: 'bg-slate-200',
      step: 'bg-slate-900 text-white',
    },
    minimal: {
      bg: 'bg-white',
      heading: 'text-slate-900',
      subheading: 'text-slate-600',
      text: 'text-gray-700',
      cardBg: 'bg-gray-50',
      cardBorder: 'border-gray-200',
      button: 'bg-blue-600 text-white hover:bg-blue-700',
      buttonOutline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      accent: 'bg-gray-100',
      step: 'bg-gray-600 text-white',
    },
    gradient: {
      bg: 'bg-gradient-to-br from-pink-50 to-indigo-50',
      heading: 'text-purple-600',
      subheading: 'text-pink-600',
      text: 'text-gray-700',
      cardBg: 'bg-purple-50',
      cardBorder: 'border-purple-200',
      button: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90',
      buttonOutline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50',
      accent: 'bg-purple-100',
      step: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white',
    },
    dark: {
      bg: 'bg-slate-900',
      heading: 'text-white',
      subheading: 'text-blue-400',
      text: 'text-gray-300',
      cardBg: 'bg-slate-800',
      cardBorder: 'border-slate-700',
      button: 'bg-blue-600 text-white hover:bg-blue-700',
      buttonOutline: 'border-2 border-blue-400 text-blue-400 hover:bg-blue-950',
      accent: 'bg-slate-700',
      step: 'bg-blue-600 text-white',
    },
    colorful: {
      bg: 'bg-gradient-to-br from-yellow-50 to-red-50',
      heading: 'text-yellow-600',
      subheading: 'text-red-600',
      text: 'text-gray-700',
      cardBg: 'bg-yellow-50',
      cardBorder: 'border-yellow-200',
      button: 'bg-gradient-to-r from-yellow-600 to-red-600 text-white hover:opacity-90',
      buttonOutline: 'border-2 border-red-600 text-red-600 hover:bg-red-50',
      accent: 'bg-red-100',
      step: 'bg-gradient-to-r from-yellow-600 to-red-600 text-white',
    },
    light: {
      bg: 'bg-white',
      heading: 'text-gray-800',
      subheading: 'text-gray-600',
      text: 'text-gray-700',
      cardBg: 'bg-gray-100',
      cardBorder: 'border-gray-300',
      button: 'bg-gray-800 text-white hover:bg-gray-900',
      buttonOutline: 'border-2 border-gray-800 text-gray-800 hover:bg-gray-100',
      accent: 'bg-gray-200',
      step: 'bg-gray-800 text-white',
    },
    deepblue: {
      bg: 'bg-gradient-to-br from-blue-950 to-blue-900',
      heading: 'text-white',
      subheading: 'text-blue-200',
      text: 'text-blue-100',
      cardBg: 'bg-blue-900',
      cardBorder: 'border-blue-700',
      button: 'bg-blue-600 text-white hover:bg-blue-700',
      buttonOutline: 'border-2 border-blue-400 text-blue-400 hover:bg-blue-900',
      accent: 'bg-blue-800',
      step: 'bg-blue-600 text-white',
    },
    crimson: {
      bg: 'bg-gradient-to-br from-slate-900 via-red-900 to-orange-900',
      heading: 'text-white',
      subheading: 'text-red-300',
      text: 'text-red-100',
      cardBg: 'bg-red-900/50',
      cardBorder: 'border-red-600',
      button: 'bg-red-600 text-white hover:bg-red-700',
      buttonOutline: 'border-2 border-orange-400 text-orange-300 hover:bg-red-900',
      accent: 'bg-red-800/40',
      step: 'bg-red-600 text-white',
    },
    teal: {
      bg: 'bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900',
      heading: 'text-white',
      subheading: 'text-cyan-300',
      text: 'text-cyan-100',
      cardBg: 'bg-teal-800/50',
      cardBorder: 'border-teal-600',
      button: 'bg-teal-500 text-white hover:bg-teal-600',
      buttonOutline: 'border-2 border-cyan-400 text-cyan-300 hover:bg-teal-900',
      accent: 'bg-teal-700/40',
      step: 'bg-teal-500 text-white',
    },
    cosmic: {
      bg: 'bg-gradient-to-br from-[#1a1f3a] via-[#2d1b4e] to-[#1a1f3a]',
      heading: 'text-[#FFFFFF]',
      subheading: 'text-[#B8C0CC]',
      text: 'text-[#B8C0CC]',
      cardBg: 'bg-[#1e293b]/80',
      cardBorder: 'border-[#3B82F6]/30',
      button: 'bg-[#3B82F6] text-white hover:bg-[#60A5FA]',
      buttonOutline: 'border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#1e293b]',
      accent: 'bg-[#1e293b]/60',
      step: 'bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white border-[#60A5FA]',
    },
    sage: {
      bg: 'bg-gradient-to-br from-[#e8f5e8] to-[#d4e5d4]',
      heading: 'text-[#2d4739]',
      subheading: 'text-[#4a7c59]',
      text: 'text-[#3a5a47]',
      cardBg: 'bg-white/90',
      cardBorder: 'border-[#4a7c59]/30',
      button: 'bg-[#4a7c59] text-white hover:bg-[#3a5a47]',
      buttonOutline: 'border-2 border-[#4a7c59] text-[#4a7c59] hover:bg-[#e8f5e8]',
      accent: 'bg-[#c8dfc8]/50',
      step: 'bg-[#4a7c59] text-white border-[#4a7c59]',
    },
    neon: {
      bg: 'bg-gradient-to-br from-black to-[#1a1a2e]',
      heading: 'bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent',
      subheading: 'bg-gradient-to-r from-[#a78bfa] to-[#22d3ee] bg-clip-text text-transparent',
      text: 'text-slate-300',
      cardBg: 'bg-[#1a1a2e]/80',
      cardBorder: 'border-purple-500/30',
      button: 'bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white hover:opacity-90',
      buttonOutline: 'border-2 border-purple-500 text-purple-400 hover:bg-purple-950',
      accent: 'bg-[#1a1a2e]/60',
      step: 'bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white border-purple-500',
    },
    midnight: {
      bg: 'bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]',
      heading: 'text-white',
      subheading: 'text-purple-300',
      text: 'text-slate-300',
      cardBg: 'bg-[#2d1b4e]/60',
      cardBorder: 'border-purple-500/30',
      button: 'bg-[#ec4899] text-white hover:bg-[#db2777]',
      buttonOutline: 'border-2 border-[#ec4899] text-[#ec4899] hover:bg-[#2d1b4e]',
      accent: 'bg-[#2d1b4e]/50',
      step: 'bg-[#ec4899] text-white border-[#ec4899]',
    },
    ocean: {
      bg: 'bg-gradient-to-br from-white to-[#f5f5f5]',
      heading: 'text-[#2c5f8d]',
      subheading: 'text-[#4a90c8]',
      text: 'text-[#4a5568]',
      cardBg: 'bg-[#f5f0e8]',
      cardBorder: 'border-[#2c5f8d]/20',
      button: 'bg-[#2c5f8d] text-white hover:bg-[#1e3a5f]',
      buttonOutline: 'border-2 border-[#2c5f8d] text-[#2c5f8d] hover:bg-[#f5f0e8]',
      accent: 'bg-[#5b8db8]/20',
      step: 'bg-[#2c5f8d] text-white border-[#2c5f8d]',
    },
    coral: {
      bg: 'bg-gradient-to-br from-[#ff9a8b] via-[#ff8577] to-[#ff6a88]',
      heading: 'text-[#4a3028]',
      subheading: 'text-[#7d4a3c]',
      text: 'text-[#5a3a32]',
      cardBg: 'bg-white/90',
      cardBorder: 'border-white/50',
      button: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
      buttonOutline: 'border-2 border-[#ef4444] text-[#ef4444] hover:bg-white/30',
      accent: 'bg-white/40',
      step: 'bg-[#ef4444] text-white border-[#ef4444]',
    },
  };

  return themes[theme] || themes.modern;
};

export const RichSlidePreview: React.FC<RichSlidePreviewProps> = ({ theme }) => {
  const colors = getThemeColors(theme);

  // Map theme colors to hex values for steps
  const themeColorMap: Record<string, string> = {
    modern: '#2563eb',
    classic: '#1e293b',
    gradient: '#db2777',
    dark: '#3b82f6',
    colorful: '#db2777',
    light: '#1f2937',
    deepblue: '#3b82f6',
    crimson: '#dc2626',
    teal: '#0d9488',
    cosmic: '#3B82F6',
    sage: '#4a7c59',
    neon: '#8b5cf6',
    midnight: '#ec4899',
    ocean: '#2c5f8d',
    coral: '#ef4444',
  };

  const stepColor = themeColorMap[theme] || '#2563eb';

  return (
    <div className={`w-full h-full ${colors.bg} p-16 flex flex-col`}>
      {/* Top Section: Heading + Subheading + Image */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        <div className="col-span-2">
          <h1 className={`text-5xl font-bold ${colors.heading} mb-2 leading-tight`}>
            This is a Heading
          </h1>
          <h2 className={`text-2xl font-semibold ${colors.subheading} mb-6`}>
            Key insights and important takeaways
          </h2>
          
          {/* Body Text */}
          <p className={`text-base ${colors.text} leading-relaxed`}>
            Your presentation will be beautifully formatted with professional layouts, strategic use of visuals, and compelling messaging that engages your audience.
          </p>
        </div>
        
        {/* Image Placeholder */}
        <div className="bg-slate-400 flex items-center justify-center col-span-1 border-2 border-slate-300 shadow-lg" style={{ aspectRatio: '4/5' }}>
          <img src="/icons/presentation-image.svg" alt="Presentation" className="w-24 h-24 opacity-70" />
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { title: 'Feature One', desc: 'Key benefit explained clearly', icon: '⚡' },
          { title: 'Feature Two', desc: 'Another important feature', icon: '🎯' },
          { title: 'Feature Three', desc: 'Additional value proposition', icon: '💡' },
        ].map((card, idx) => (
          <div key={idx} className={`${colors.cardBg} border-2 ${colors.cardBorder} p-5 rounded-lg`}>
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className={`font-bold ${colors.heading} mb-2 text-base`}>{card.title}</h3>
            <p className={`text-sm ${colors.text}`}>{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Steps Section */}
      <div className="mb-8">
        <h3 className={`text-xl font-bold ${colors.heading} mb-4`}>Process Steps</h3>
        <ChevronSteps
          steps={[
            { label: 'Step 1', color: stepColor },
            { label: 'Step 2', color: stepColor },
            { label: 'Step 3', color: stepColor },
          ]}
        />
      </div>

      {/* Three Column Section with Content and Bullet Points */}
      <div className="grid grid-cols-3 gap-6">
        {/* Column 1 - Key Features */}
        <div>
          <h3 className={`text-lg font-bold ${colors.heading} mb-3`}>Key Features</h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>Professional layouts</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>Custom branding</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>AI-powered content</p>
            </div>
          </div>
        </div>

        {/* Column 2 - Benefits */}
        <div>
          <h3 className={`text-lg font-bold ${colors.heading} mb-3`}>Benefits</h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>Save time and effort</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>Consistent design</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>Engaging visuals</p>
            </div>
          </div>
        </div>

        {/* Column 3 - Use Cases */}
        <div>
          <h3 className={`text-lg font-bold ${colors.heading} mb-3`}>Use Cases</h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>Business presentations</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>Educational content</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0 mt-1.5"></div>
              <p className={`text-sm ${colors.text}`}>Marketing materials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
