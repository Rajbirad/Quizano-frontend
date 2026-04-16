import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronSteps } from './ChevronSteps';

// Universal theme color mapper for all slide templates
const getThemeColors = (theme: string, type: 'title' | 'section' | 'bullet' | 'twoColImg' | 'twoColText' | 'imageGrid' | 'comparison' | 'quote' | 'iconList' | 'summary' | 'timeline' | 'stats' | 'media' | 'fullWidth' = 'bullet') => {
  const themes: Record<string, Record<string, any>> = {
    modern: { 
      accent: 'text-blue-600', bg: 'bg-slate-50', textDark: 'text-slate-900',
      gradientBg: 'from-blue-600 to-purple-600', primaryText: 'text-white',
      cardBg: 'bg-white', border: 'border-slate-200'
    },
    classic: { 
      accent: 'text-slate-900', bg: 'bg-white', textDark: 'text-slate-900',
      gradientBg: 'from-slate-800 to-slate-900', primaryText: 'text-white',
      cardBg: 'bg-slate-50', border: 'border-slate-300'
    },
    gradient: { 
      accent: 'text-purple-600', bg: 'bg-purple-50', textDark: 'text-slate-900',
      gradientBg: 'from-pink-500 via-purple-500 to-indigo-500', primaryText: 'text-white',
      cardBg: 'bg-white', border: 'border-purple-200'
    },
    dark: { 
      accent: 'text-white', bg: 'bg-slate-900', textDark: 'text-white',
      gradientBg: 'bg-slate-950', primaryText: 'text-white',
      cardBg: 'bg-slate-800', border: 'border-slate-700'
    },
    colorful: { 
      accent: 'text-pink-600', bg: 'bg-yellow-50', textDark: 'text-slate-900',
      gradientBg: 'from-yellow-400 via-red-500 to-pink-500', primaryText: 'text-white',
      cardBg: 'bg-white', border: 'border-yellow-200'
    },
    light: { 
      accent: 'text-slate-900', bg: 'bg-white', textDark: 'text-slate-900',
      gradientBg: 'bg-gradient-to-br from-white to-gray-100', primaryText: 'text-slate-900',
      cardBg: 'bg-gray-100', border: 'border-gray-300'
    },
    deepblue: { 
      accent: 'text-blue-400', bg: 'bg-blue-950', textDark: 'text-white',
      gradientBg: 'from-blue-950 to-blue-900', primaryText: 'text-white',
      cardBg: 'bg-blue-900', border: 'border-blue-700'
    },
    crimson: { 
      accent: 'text-red-400', bg: 'bg-red-950', textDark: 'text-white',
      gradientBg: 'from-red-950 to-red-900', primaryText: 'text-white',
      cardBg: 'bg-red-900', border: 'border-red-700'
    },
    teal: { 
      accent: 'text-teal-400', bg: 'bg-slate-900', textDark: 'text-white',
      gradientBg: 'from-slate-900 via-teal-900 to-cyan-900', primaryText: 'text-white',
      cardBg: 'bg-teal-800', border: 'border-teal-600'
    },
  };
  
  return themes[theme] || themes.modern;
};

// Template 1: Title Slide (Hero)
export const TitleSlide: React.FC<{
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  theme?: string;
}> = ({ title, subtitle, backgroundImage, theme = 'modern' }) => {
  const bgStyles = backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {};

  const themeColors: Record<string, { bg: string; accent: string; text: string }> = {
    modern: { bg: 'from-blue-600 to-purple-600', accent: 'text-white', text: 'text-white' },
    classic: { bg: 'from-slate-800 to-slate-900', accent: 'text-white', text: 'text-white' },
    gradient: { bg: 'from-pink-500 via-purple-500 to-indigo-500', accent: 'text-white', text: 'text-white' },
    dark: { bg: 'bg-slate-950', accent: 'text-white', text: 'text-white' },
    colorful: { bg: 'from-yellow-400 via-red-500 to-pink-500', accent: 'text-white', text: 'text-white' },
    light: { bg: 'bg-white', accent: 'text-slate-900', text: 'text-slate-900' },
    deepblue: { bg: 'from-blue-950 to-blue-900', accent: 'text-white', text: 'text-white' },
    crimson: { bg: 'from-red-950 to-red-900', accent: 'text-white', text: 'text-white' },
    teal: { bg: 'from-slate-900 via-teal-900 to-cyan-900', accent: 'text-white', text: 'text-white' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${colors.bg} relative overflow-hidden`}
      style={backgroundImage ? { backgroundSize: 'cover', backgroundPosition: 'center', ...bgStyles } : {}}
    >
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

      {/* Two-column layout */}
      <div className="relative z-10 h-full flex items-center px-16 gap-16">
        {/* Left section - Text content */}
        <div className="flex-1">
          <h1 className={`text-4xl md:text-6xl font-bold ${colors.text} mb-8 leading-tight`}>{title}</h1>
          {subtitle && <p className={`text-xl md:text-2xl ${colors.accent} opacity-90 leading-relaxed`}>{subtitle}</p>}
        </div>

        {/* Right section - Image placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg h-96 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center">
            {backgroundImage ? (
              <img 
                src={backgroundImage} 
                alt="Presentation visual" 
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-white/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className={`text-sm ${colors.text} opacity-60`}>Visual Content</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-75">
        <div className={`w-12 h-1 ${colors.accent} rounded-full`} />
        <p className={`text-xs ${colors.accent}`}>QuizChemy AI</p>
      </div>
    </div>
  );
};

// Template 2: Section Header
export const SectionHeader: React.FC<{
  title: string;
  description?: string;
  number?: number;
  theme?: string;
}> = ({ title, description, number, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string }> = {
    modern: { accent: 'from-blue-600 to-purple-600', bg: 'bg-slate-50' },
    classic: { accent: 'from-slate-800 to-slate-900', bg: 'bg-white' },
    gradient: { accent: 'from-pink-500 to-indigo-500', bg: 'bg-gradient-to-br from-pink-50 to-purple-50' },
    dark: { accent: 'from-slate-900 to-slate-950', bg: 'bg-slate-900' },
    colorful: { accent: 'from-yellow-400 to-pink-500', bg: 'bg-yellow-50' },
    light: { accent: 'from-slate-800 to-slate-900', bg: 'bg-white' },
    deepblue: { accent: 'from-blue-600 to-blue-500', bg: 'bg-blue-950' },
    crimson: { accent: 'from-red-600 to-red-500', bg: 'bg-red-950' },
    teal: { accent: 'from-teal-600 to-cyan-500', bg: 'bg-slate-900' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} relative`}>
      <div className="text-center px-8 max-w-3xl">
        {number && (
          <div className={`text-2xl font-semibold bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent mb-3`}>
            {String(number).padStart(2, '0')}
          </div>
        )}
        <h2 className="text-base md:text-2xl font-semibold text-slate-900 mb-5">{title}</h2>
        {description && <p className="text-base md:text-base text-slate-600 leading-relaxed">{description}</p>}
      </div>

      {/* Decorative line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.accent}`} />
    </div>
  );
};

// Template 3: Bullets Slide
export const BulletsSlide: React.FC<{
  title: string;
  bullets: string[];
  image?: string;
  theme?: string;
}> = ({ title, bullets, image, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; text: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-slate-50', text: 'text-slate-700' },
    classic: { accent: 'text-slate-900', bg: 'bg-white', text: 'text-slate-700' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', text: 'text-slate-700' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', text: 'text-slate-100' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', text: 'text-slate-700' },
    light: { accent: 'text-slate-900', bg: 'bg-white', text: 'text-slate-700' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', text: 'text-blue-100' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', text: 'text-red-100' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', text: 'text-cyan-100' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} px-12 py-12`}>
      <div className="flex gap-12 w-full max-w-6xl">
        {/* Content */}
        <div className="flex-1">
          <h2 className={`text-3xl font-semibold mb-10 ${colors.accent}`}>{title}</h2>
          <ul className="space-y-5">
            {bullets.map((bullet, idx) => {
              // Check if bullet contains ":" to separate term from description
              const colonIndex = bullet.indexOf(':');
              const hasTerm = colonIndex > 0 && colonIndex < 100; // Reasonable term length
              
              return (
                <li key={idx} className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full ${colors.accent.replace('text-', 'bg-')} mt-1.5 flex-shrink-0`} />
                  {hasTerm ? (
                    <span className={`text-lg ${colors.text} leading-relaxed`}>
                      <strong className={colors.accent}>{bullet.substring(0, colonIndex)}</strong>
                      {bullet.substring(colonIndex)}
                    </span>
                  ) : (
                    <span className={`text-lg ${colors.text} leading-relaxed`}>{bullet}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Image */}
        {image && (
          <div className="flex-1 flex items-center justify-center">
            <img src={image} alt="Slide visual" className="max-w-full h-auto rounded-lg shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

// Template 4: Two-Column (Image Left, Text Right)
export const TwoColumnImageLeft: React.FC<{
  image: string;
  title: string;
  content: string[];
  theme?: string;
}> = ({ image, title, content, theme = 'modern' }) => {
  const colors = getThemeColors(theme);

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} px-16 py-16`}>
      <div className="flex gap-16 w-full max-w-6xl items-center">
        <div className="flex-1">
          <img src={image} alt="Content" className="w-full h-auto rounded-lg shadow-xl" />
        </div>
        <div className="flex-1">
          <h2 className={`text-3xl font-semibold mb-8 ${colors.heading}`}>{title}</h2>
          <div className="space-y-4">
            {content.map((text, idx) => (
              <p key={idx} className={`text-base ${colors.text} leading-relaxed`}>
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Template 5: Two-Column (Text Left, Image Right)
export const TwoColumnTextLeft: React.FC<{
  title: string;
  content: string[];
  image: string;
  theme?: string;
}> = ({ title, content, image, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; text: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-white', text: 'text-slate-700' },
    classic: { accent: 'text-slate-900', bg: 'bg-slate-50', text: 'text-slate-700' },
    gradient: { accent: 'text-purple-600', bg: 'bg-white', text: 'text-slate-700' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', text: 'text-slate-100' },
    colorful: { accent: 'text-pink-600', bg: 'bg-white', text: 'text-slate-700' },
    light: { accent: 'text-slate-900', bg: 'bg-white', text: 'text-slate-700' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', text: 'text-blue-100' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', text: 'text-red-100' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', text: 'text-cyan-100' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} px-16 py-16`}>
      <div className="flex gap-16 w-full max-w-6xl items-center">
        <div className="flex-1">
          <h2 className={`text-3xl font-semibold mb-8 ${colors.accent}`}>{title}</h2>
          <div className="space-y-4">
            {content.map((text, idx) => (
              <p key={idx} className={`text-base ${colors.text} leading-relaxed`}>
                {text}
              </p>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <img src={image} alt="Content" className="w-full h-auto rounded-lg shadow-xl" />
        </div>
      </div>
    </div>
  );
};

// Template 6: Image Grid (Gallery)
export const ImageGrid: React.FC<{
  title: string;
  images: Array<{ src: string; caption?: string }>;
  columns?: 2 | 3 | 4;
  theme?: string;
}> = ({ title, images, columns = 3, theme = 'modern' }) => {
  const colors = getThemeColors(theme);
  const gridCols = `grid-cols-${columns}`;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-3xl font-semibold mb-16 ${colors.accent}`}>{title}</h2>
      <div className={`grid gap-8 w-full max-w-6xl ${gridCols}`}>
        {images.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <img
              src={item.src}
              alt={item.caption || `Image ${idx + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow-lg mb-4"
            />
            {item.caption && <p className={`text-sm ${colors.textDark} text-center`}>{item.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Template 7: Comparison Slide (A vs B)
export const ComparisonSlide: React.FC<{
  title: string;
  leftLabel: string;
  rightLabel: string;
  leftItems: string[];
  rightItems: string[];
  theme?: string;
}> = ({ title, leftLabel, rightLabel, leftItems, rightItems, theme = 'modern' }) => {
  const themeColors: Record<string, { 
    bg: string; 
    accent: string; 
    textDark: string;
    leftGradient: string;
    rightGradient: string;
  }> = {
    modern: { 
      bg: 'bg-slate-50', 
      accent: 'text-blue-600', 
      textDark: 'text-slate-900',
      leftGradient: 'from-blue-600 to-blue-700',
      rightGradient: 'from-purple-600 to-purple-700'
    },
    classic: { 
      bg: 'bg-white', 
      accent: 'text-slate-900', 
      textDark: 'text-slate-900',
      leftGradient: 'from-slate-700 to-slate-800',
      rightGradient: 'from-slate-600 to-slate-700'
    },
    gradient: { 
      bg: 'bg-purple-50', 
      accent: 'text-purple-600', 
      textDark: 'text-slate-900',
      leftGradient: 'from-pink-500 to-pink-600',
      rightGradient: 'from-indigo-500 to-indigo-600'
    },
    dark: { 
      bg: 'bg-slate-900', 
      accent: 'text-white', 
      textDark: 'text-white',
      leftGradient: 'from-slate-700 to-slate-800',
      rightGradient: 'from-slate-600 to-slate-700'
    },
    colorful: { 
      bg: 'bg-yellow-50', 
      accent: 'text-pink-600', 
      textDark: 'text-slate-900',
      leftGradient: 'from-yellow-500 to-orange-500',
      rightGradient: 'from-pink-500 to-rose-500'
    },
    light: { 
      bg: 'bg-white', 
      accent: 'text-slate-900', 
      textDark: 'text-slate-900',
      leftGradient: 'from-slate-600 to-slate-700',
      rightGradient: 'from-slate-500 to-slate-600'
    },
    deepblue: { 
      bg: 'bg-blue-950', 
      accent: 'text-blue-400', 
      textDark: 'text-white',
      leftGradient: 'from-blue-700 to-blue-800',
      rightGradient: 'from-blue-600 to-blue-700'
    },
    crimson: { 
      bg: 'bg-red-950', 
      accent: 'text-red-400', 
      textDark: 'text-white',
      leftGradient: 'from-red-700 to-red-800',
      rightGradient: 'from-orange-600 to-red-600'
    },
    teal: { 
      bg: 'bg-slate-900', 
      accent: 'text-teal-400', 
      textDark: 'text-white',
      leftGradient: 'from-teal-700 to-teal-800',
      rightGradient: 'from-cyan-600 to-teal-600'
    },
  };

  const colors = themeColors[theme] || themeColors.modern;
  const isDark = ['dark', 'deepblue', 'crimson', 'teal'].includes(theme);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-3xl font-semibold mb-12 ${colors.accent}`}>{title}</h2>

      <div className="flex gap-4 w-full max-w-6xl h-90">
        {/* Left Column */}
        <div className="flex-1 flex flex-col">
          <div className={`bg-gradient-to-br ${colors.leftGradient} text-white rounded-t-2xl px-8 py-6`}>
            <h3 className="text-2xl font-semibold">{leftLabel}</h3>
          </div>
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-b-2xl p-8 space-y-4 border-2 ${isDark ? 'border-slate-700' : 'border-slate-200'} flex-1 overflow-y-auto`}>
            {leftItems && leftItems.length > 0 ? leftItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span className={`${colors.textDark} text-base`}>{item}</span>
              </div>
            )) : (
              <p className={colors.textDark}>No items available</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col">
          <div className={`bg-gradient-to-br ${colors.rightGradient} text-white rounded-t-2xl px-8 py-6`}>
            <h3 className="text-2xl font-semibold">{rightLabel}</h3>
          </div>
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-b-2xl p-8 space-y-4 border-2 ${isDark ? 'border-slate-700' : 'border-slate-200'} flex-1 overflow-y-auto`}>
            {rightItems && rightItems.length > 0 ? rightItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span className={`${colors.textDark} text-base`}>{item}</span>
              </div>
            )) : (
              <p className={colors.textDark}>No items available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Template 8: Quote Slide
export const QuoteSlide: React.FC<{
  quote: string;
  author?: string;
  image?: string;
  theme?: string;
}> = ({ quote, author, image, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; text: string }> = {
    modern: { accent: 'from-blue-600 to-purple-600', bg: 'bg-gradient-to-br from-blue-50 to-purple-50', text: 'text-slate-900' },
    classic: { accent: 'from-slate-800 to-slate-900', bg: 'bg-white', text: 'text-slate-900' },
    gradient: { accent: 'from-pink-500 to-indigo-500', bg: 'bg-gradient-to-br from-pink-50 to-indigo-50', text: 'text-slate-900' },
    dark: { accent: 'from-blue-400 to-purple-400', bg: 'bg-slate-900', text: 'text-slate-100' },
    colorful: { accent: 'from-yellow-400 to-pink-500', bg: 'bg-gradient-to-br from-yellow-50 to-pink-50', text: 'text-slate-900' },
    light: { accent: 'from-slate-800 to-slate-900', bg: 'bg-white', text: 'text-slate-900' },
    deepblue: { accent: 'from-blue-600 to-blue-500', bg: 'bg-blue-950', text: 'text-blue-100' },
    crimson: { accent: 'from-red-600 to-red-500', bg: 'bg-red-950', text: 'text-red-100' },
    teal: { accent: 'from-teal-600 to-cyan-500', bg: 'bg-slate-900', text: 'text-cyan-100' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} relative px-16`}>
      <div className="flex gap-12 w-full max-w-6xl items-center">
        {image && (
          <div className="flex-1">
            <img src={image} alt="Quote author" className="w-full h-96 object-cover rounded-lg shadow-xl" />
          </div>
        )}

        <div className={image ? 'flex-1' : 'w-full'}>
          <div className="mb-8">
            <div className={`text-2xl font-black bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent mb-6`}>
              "
            </div>
            <p className={`text-base md:text-2xl font-semibold ${colors.text} leading-tight mb-6`}>{quote}</p>
          </div>

          {author && (
            <div className="flex items-center gap-4">
              <div className={`h-1 w-12 bg-gradient-to-r ${colors.accent} rounded`} />
              <p className={`text-lg font-semibold bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent`}>
                {author}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Template 9: Content + Icon List
export const ContentIconList: React.FC<{
  title: string;
  items: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
  columns?: 1 | 2 | 3;
  theme?: string;
}> = ({ title, items, columns = 2, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; iconBg: string; text: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-white', iconBg: 'bg-blue-100', text: 'text-slate-600' },
    classic: { accent: 'text-slate-900', bg: 'bg-slate-50', iconBg: 'bg-slate-200', text: 'text-slate-600' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-slate-600' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', iconBg: 'bg-slate-800', text: 'text-slate-400' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', iconBg: 'bg-pink-100', text: 'text-slate-600' },
    light: { accent: 'text-slate-900', bg: 'bg-white', iconBg: 'bg-slate-100', text: 'text-slate-600' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', iconBg: 'bg-blue-900', text: 'text-blue-200' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', iconBg: 'bg-red-900', text: 'text-red-200' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', iconBg: 'bg-teal-800', text: 'text-cyan-200' },
  };

  const colors = themeColors[theme] || themeColors.modern;
  const isDark = ['dark', 'deepblue', 'crimson', 'teal'].includes(theme);

  // Define different colors for each card
  const cardHeaderColors = [
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-indigo-500 to-indigo-600',
    'bg-gradient-to-r from-purple-500 to-purple-600',
    'bg-gradient-to-r from-pink-500 to-pink-600',
    'bg-gradient-to-r from-cyan-500 to-cyan-600',
    'bg-gradient-to-r from-teal-500 to-teal-600',
  ];

  // Check if this is a definition list (single column layout)
  const isDefinitionList = columns === 1;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${colors.bg} px-12 py-12`}>
      <h2 className={`text-3xl font-semibold mb-12 ${colors.accent}`}>{title}</h2>

      {isDefinitionList ? (
        // Horizontal layout for definition lists with arrow shape
        <div className="space-y-6 w-full max-w-6xl">
          {items.map((item, idx) => {
            const headerColor = cardHeaderColors[idx % cardHeaderColors.length];
            return (
              <div 
                key={idx} 
                className="flex items-stretch"
              >
                {/* Term box (colored, left side with arrow shape) */}
                <div 
                  className={`${headerColor} px-8 py-6 flex items-center justify-center min-w-[280px] shadow-lg relative z-10`}
                  style={{
                    clipPath: 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)',
                  }}
                >
                  <h3 className="text-xl font-semibold text-white text-center pr-6">{item.title}</h3>
                </div>
                
                {/* Definition box (white, right side) */}
                <div className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} px-10 py-6 border-2 flex items-center shadow-md -ml-6`}>
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-base leading-relaxed`}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Grid layout for card-grid
        <div className={`grid gap-8 w-full max-w-6xl grid-cols-${columns}`}>
          {items.map((item, idx) => {
            const headerColor = cardHeaderColors[idx % cardHeaderColors.length];
            return (
              <div 
                key={idx} 
                className={`overflow-hidden rounded-3xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} hover:shadow-xl transition-all duration-300 flex flex-col`}
              >
                {/* Colored header bar */}
                <div className={`${headerColor} px-6 py-4 rounded-t-2xl`}>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                </div>
                
                {/* Inner card with content - fixed height */}
                <div className="p-6 flex-1 flex items-center">
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-600' : 'border-slate-200'} w-full h-40 flex items-center justify-center`}>
                    <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-base leading-relaxed text-center`}>{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Template 10: Final Summary Slide
export const SummarySlide: React.FC<{
  title: string;
  summary: string[];
  cta?: { text: string; subtext?: string };
  theme?: string;
}> = ({ title, summary, cta, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string }> = {
    modern: { accent: 'from-blue-600 to-purple-600', bg: 'from-blue-600 to-purple-600' },
    classic: { accent: 'from-slate-800 to-slate-900', bg: 'from-slate-800 to-slate-900' },
    gradient: { accent: 'from-pink-500 to-indigo-500', bg: 'from-pink-500 to-indigo-500' },
    dark: { accent: 'from-slate-900 to-slate-950', bg: 'from-slate-900 to-slate-950' },
    colorful: { accent: 'from-yellow-400 to-pink-500', bg: 'from-yellow-400 to-pink-500' },
    light: { accent: 'from-slate-800 to-slate-900', bg: 'from-slate-100 to-gray-200' },
    deepblue: { accent: 'from-blue-600 to-blue-500', bg: 'from-blue-950 to-blue-900' },
    crimson: { accent: 'from-red-600 to-red-500', bg: 'from-red-950 to-red-900' },
    teal: { accent: 'from-teal-600 to-cyan-500', bg: 'from-slate-900 via-teal-900 to-cyan-900' },
  };

  const colors = themeColors[theme] || themeColors.modern;
  const isDark = !['light'].includes(theme);

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colors.bg} relative px-16`}>
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-4xl">
        <h2 className={`text-base md:text-2xl font-semibold mb-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h2>

        <div className="space-y-4 mb-12">
          {summary.map((point, idx) => (
            <div key={idx} className="flex items-start gap-4 text-left">
              <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-white' : 'bg-primary'} mt-2 flex-shrink-0`} />
              <p className={`text-base ${isDark ? 'text-white/90' : 'text-slate-700'} leading-relaxed`}>{point}</p>
            </div>
          ))}
        </div>

        {cta && (
          <div className={`p-8 rounded-lg ${isDark ? 'bg-white/10 border border-white/20' : 'bg-primary/10 border border-primary/20'} backdrop-blur-sm`}>
            <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-primary'}`}>{cta.text}</p>
            {cta.subtext && (
              <p className={`text-sm mt-2 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{cta.subtext}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Additional Templates

// Template 11: Timeline Slide
export const TimelineSlide: React.FC<{
  title: string;
  events: Array<{ year: string; title: string; description: string }>;
  theme?: string;
}> = ({ title, events, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; dot: string; text: string; descText: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-white', dot: 'bg-blue-600', text: 'text-slate-900', descText: 'text-slate-600' },
    classic: { accent: 'text-slate-900', bg: 'bg-slate-50', dot: 'bg-slate-900', text: 'text-slate-900', descText: 'text-slate-600' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-600', text: 'text-slate-900', descText: 'text-slate-600' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', dot: 'bg-white', text: 'text-slate-100', descText: 'text-slate-400' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', dot: 'bg-pink-600', text: 'text-slate-900', descText: 'text-slate-600' },
    light: { accent: 'text-slate-900', bg: 'bg-white', dot: 'bg-slate-900', text: 'text-slate-900', descText: 'text-slate-600' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', dot: 'bg-blue-400', text: 'text-blue-100', descText: 'text-blue-300' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', dot: 'bg-red-400', text: 'text-red-100', descText: 'text-red-300' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', dot: 'bg-teal-400', text: 'text-cyan-100', descText: 'text-cyan-300' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-3xl font-semibold mb-16 ${colors.accent}`}>{title}</h2>

      <div className="w-full max-w-4xl">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-8 mb-12 items-start">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 ${colors.dot} rounded-full border-4 border-white`} />
              {idx < events.length - 1 && <div className={`w-1 h-24 ${colors.dot} opacity-30 mt-2`} />}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <span className={`text-lg font-semibold ${colors.accent}`}>{event.year}</span>
              <h3 className={`text-2xl font-semibold ${colors.text} mt-1`}>{event.title}</h3>
              <p className={`${colors.descText} mt-2`}>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Template 12: Data/Stats Slide
export const StatsSlide: React.FC<{
  title: string;
  stats: Array<{ number: string; label: string; suffix?: string }>;
  theme?: string;
}> = ({ title, stats, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; numberColor: string; text: string; cardBg: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-white', numberColor: 'from-blue-600 to-purple-600', text: 'text-slate-600', cardBg: 'bg-slate-100' },
    classic: { accent: 'text-slate-900', bg: 'bg-slate-50', numberColor: 'from-slate-900 to-slate-800', text: 'text-slate-600', cardBg: 'bg-slate-200' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', numberColor: 'from-pink-500 to-indigo-500', text: 'text-slate-600', cardBg: 'bg-purple-100' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', numberColor: 'from-blue-400 to-purple-400', text: 'text-slate-400', cardBg: 'bg-slate-800' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', numberColor: 'from-yellow-400 to-pink-500', text: 'text-slate-600', cardBg: 'bg-yellow-100' },
    light: { accent: 'text-slate-900', bg: 'bg-white', numberColor: 'from-slate-900 to-slate-800', text: 'text-slate-600', cardBg: 'bg-slate-100' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', numberColor: 'from-blue-600 to-blue-500', text: 'text-blue-300', cardBg: 'bg-blue-900' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', numberColor: 'from-red-600 to-red-500', text: 'text-red-300', cardBg: 'bg-red-900' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', numberColor: 'from-teal-600 to-cyan-500', text: 'text-cyan-300', cardBg: 'bg-teal-800' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-3xl font-semibold mb-16 ${colors.accent}`}>{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl">
        {stats.map((stat, idx) => (
          <div key={idx} className={`text-center p-8 rounded-lg ${colors.cardBg} hover:opacity-80 transition-opacity`}>
            <div className={`text-2xl font-semibold bg-gradient-to-r ${colors.numberColor} bg-clip-text text-transparent`}>
              {stat.number}
              {stat.suffix}
            </div>
            <p className={`${colors.text} mt-4 font-medium`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Template 13: Video/Media Slide
export const MediaSlide: React.FC<{
  title: string;
  mediaUrl: string;
  description?: string;
  theme?: string;
}> = ({ title, mediaUrl, description, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; text: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-slate-50', text: 'text-slate-600' },
    classic: { accent: 'text-slate-900', bg: 'bg-white', text: 'text-slate-600' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', text: 'text-slate-600' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', text: 'text-slate-400' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', text: 'text-slate-600' },
    light: { accent: 'text-slate-900', bg: 'bg-white', text: 'text-slate-600' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', text: 'text-blue-300' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', text: 'text-red-300' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', text: 'text-cyan-300' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-3xl font-semibold mb-8 ${colors.accent}`}>{title}</h2>

      <div className="w-full max-w-5xl">
        <iframe
          width="100%"
          height="500"
          src={mediaUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg shadow-xl"
        />
        {description && <p className={`text-center mt-6 ${colors.text}`}>{description}</p>}
      </div>
    </div>
  );
};

// Template 14: Agenda Slide
export const AgendaSlide: React.FC<{
  title: string;
  items: Array<{ number?: string; title: string; description?: string }>;
  theme?: string;
}> = ({ title, items, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; itemBg: string; text: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-white', itemBg: 'bg-blue-50', text: 'text-slate-700' },
    classic: { accent: 'text-slate-900', bg: 'bg-slate-50', itemBg: 'bg-white', text: 'text-slate-700' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', itemBg: 'bg-purple-100', text: 'text-slate-700' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', itemBg: 'bg-slate-800', text: 'text-slate-200' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', itemBg: 'bg-pink-100', text: 'text-slate-700' },
    light: { accent: 'text-slate-900', bg: 'bg-white', itemBg: 'bg-slate-100', text: 'text-slate-700' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', itemBg: 'bg-blue-900', text: 'text-blue-100' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', itemBg: 'bg-red-900', text: 'text-red-100' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', itemBg: 'bg-teal-800', text: 'text-cyan-100' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-3xl font-semibold mb-16 ${colors.accent}`}>{title}</h2>

      <div className="w-full max-w-4xl space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className={`p-6 rounded-lg ${colors.itemBg} border-l-4 border-blue-600 flex items-center gap-6`}>
            {item.number && (
              <div className={`text-2xl font-semibold ${colors.accent} w-12`}>{item.number}</div>
            )}
            <div className="flex-1">
              <h3 className={`text-2xl font-semibold ${colors.text}`}>{item.title}</h3>
              {item.description && <p className={`${colors.text} opacity-80 mt-1`}>{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Template 15: Full-Width Text Slide
export const FullWidthText: React.FC<{
  heading: string;
  subheading?: string;
  bodyText: string;
  theme?: string;
}> = ({ heading, subheading, bodyText, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string }> = {
    modern: { accent: 'from-blue-600 to-purple-600', bg: 'bg-slate-50' },
    classic: { accent: 'from-slate-800 to-slate-900', bg: 'bg-white' },
    gradient: { accent: 'from-pink-500 to-indigo-500', bg: 'bg-gradient-to-br from-pink-50 to-indigo-50' },
    dark: { accent: 'from-slate-900 to-slate-950', bg: 'bg-slate-900' },
    colorful: { accent: 'from-yellow-400 to-pink-500', bg: 'bg-yellow-50' },
    light: { accent: 'from-slate-800 to-slate-900', bg: 'bg-white' },
    deepblue: { accent: 'from-blue-600 to-blue-500', bg: 'bg-blue-950' },
    crimson: { accent: 'from-red-600 to-red-500', bg: 'bg-red-950' },
    teal: { accent: 'from-teal-600 to-cyan-500', bg: 'bg-slate-900' },
  };

  const colors = themeColors[theme] || themeColors.modern;
  const isDark = ['dark', 'deepblue', 'crimson', 'teal'].includes(theme);

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} px-16`}>
      <div className="max-w-4xl">
        <h1 className={`text-base md:text-2xl font-semibold bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent mb-6`}>
          {heading}
        </h1>
        {subheading && (
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white/80' : 'text-slate-700'} mb-8`}>{subheading}</h2>
        )}
        <p className={`text-base leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{bodyText}</p>
      </div>
    </div>
  );
};

// Template 16: Vertical Numbered Steps Slide (Chevron badges with descriptions beside)
export const ChevronStepsSlide: React.FC<{
  title: string;
  subtitle?: string;
  steps: Array<string | { label: string; description?: string }>;
  theme?: string;
}> = ({ title, subtitle, steps, theme = 'modern' }) => {
  const themeColors: Record<string, {
    bg: string;
    title: string;
    subtitle: string;
    badgeBg: string;
    badgeText: string;
    labelText: string;
    descText: string;
  }> = {
    modern: {
      bg: 'bg-slate-50',
      title: 'text-blue-600',
      subtitle: 'text-slate-700',
      badgeBg: 'bg-gradient-to-br from-blue-700 to-blue-900',
      badgeText: 'text-white',
      labelText: 'text-slate-900',
      descText: 'text-slate-600',
    },
    classic: {
      bg: 'bg-white',
      title: 'text-slate-900',
      subtitle: 'text-slate-700',
      badgeBg: 'bg-gradient-to-br from-slate-700 to-slate-900',
      badgeText: 'text-white',
      labelText: 'text-slate-900',
      descText: 'text-slate-600',
    },
    gradient: {
      bg: 'bg-gradient-to-br from-pink-50 to-indigo-50',
      title: 'text-purple-600',
      subtitle: 'text-slate-700',
      badgeBg: 'bg-gradient-to-br from-purple-700 to-purple-900',
      badgeText: 'text-white',
      labelText: 'text-slate-900',
      descText: 'text-slate-600',
    },
    dark: {
      bg: 'bg-slate-900',
      title: 'text-white',
      subtitle: 'text-slate-300',
      badgeBg: 'bg-gradient-to-br from-slate-600 to-slate-800',
      badgeText: 'text-white',
      labelText: 'text-white',
      descText: 'text-slate-300',
    },
    colorful: {
      bg: 'bg-gradient-to-br from-yellow-50 to-red-50',
      title: 'text-yellow-600',
      subtitle: 'text-slate-700',
      badgeBg: 'bg-gradient-to-br from-pink-700 to-pink-900',
      badgeText: 'text-white',
      labelText: 'text-slate-900',
      descText: 'text-slate-600',
    },
    light: {
      bg: 'bg-white',
      title: 'text-slate-900',
      subtitle: 'text-slate-700',
      badgeBg: 'bg-gradient-to-br from-slate-600 to-slate-800',
      badgeText: 'text-white',
      labelText: 'text-slate-900',
      descText: 'text-slate-600',
    },
    deepblue: {
      bg: 'bg-gradient-to-br from-blue-950 to-blue-900',
      title: 'text-white',
      subtitle: 'text-blue-200',
      badgeBg: 'bg-gradient-to-br from-blue-700 to-blue-900',
      badgeText: 'text-white',
      labelText: 'text-white',
      descText: 'text-blue-200',
    },
    crimson: {
      bg: 'bg-gradient-to-br from-slate-900 via-red-900 to-orange-900',
      title: 'text-white',
      subtitle: 'text-red-300',
      badgeBg: 'bg-gradient-to-br from-red-700 to-red-900',
      badgeText: 'text-white',
      labelText: 'text-white',
      descText: 'text-red-200',
    },
    teal: {
      bg: 'bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900',
      title: 'text-white',
      subtitle: 'text-cyan-300',
      badgeBg: 'bg-gradient-to-br from-teal-700 to-teal-900',
      badgeText: 'text-white',
      labelText: 'text-white',
      descText: 'text-cyan-200',
    },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex flex-col justify-center ${colors.bg} px-12 py-10`}>
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className={`text-3xl font-semibold ${colors.title} mb-3`}>{title}</h1>
        {subtitle && (
          <h2 className={`text-base ${colors.subtitle}`}>{subtitle}</h2>
        )}
      </div>

      {/* Vertical Steps with Chevron Badges */}
      <div className="max-w-6xl mx-auto space-y-0">
        {steps.map((step, index) => {
          const label = typeof step === 'string' ? step : step.label;
          const description = typeof step === 'object' ? step.description : null;

          return (
            <div key={index} className="flex items-center gap-5">
              {/* Chevron Badge Container */}
              <div className="relative flex flex-col items-center flex-shrink-0" style={{ width: '75px' }}>
                {/* Chevron Badge - Just Number */}
                <div className={`${colors.badgeBg} relative flex items-center justify-center ${colors.badgeText} font-semibold text-base shadow-lg`}
                     style={{
                       width: '75px',
                       height: '55px',
                       clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%)',
                     }}>
                  {index + 1}
                </div>
                
                {/* Connecting Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className={`w-1 ${colors.badgeBg} opacity-40`} style={{ height: '24px' }}></div>
                )}
              </div>

              {/* Content - Label and Description Beside Badge */}
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${colors.labelText} mb-1`}>
                  {label}
                </h3>
                {description && (
                  <p className={`text-base ${colors.descText} leading-relaxed`}>
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Template 17: Definition Card Slide
export const DefinitionSlide: React.FC<{
  title: string;
  text: string;
  theme?: string;
}> = ({ title, text, theme = 'modern' }) => {
  const colors = getThemeColors(theme);
  const isDark = ['dark', 'deepblue', 'crimson', 'teal'].includes(theme);

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} px-16`}>
      <div className={`max-w-4xl ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl p-12 border-l-8 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}>
        <h2 className={`text-3xl font-semibold ${colors.accent} mb-6`}>{title}</h2>
        <p className={`text-base ${colors.textDark} leading-relaxed`}>{text}</p>
      </div>
    </div>
  );
};

// Template 18: Split Hero Balanced
export const SplitHeroSlide: React.FC<{
  title: string;
  text: string;
  theme?: string;
}> = ({ title, text, theme = 'modern' }) => {
  const themeColors: Record<string, { gradient: string; text: string }> = {
    modern: { gradient: 'from-blue-600 to-purple-600', text: 'text-white' },
    classic: { gradient: 'from-slate-800 to-slate-900', text: 'text-white' },
    gradient: { gradient: 'from-pink-500 via-purple-500 to-indigo-500', text: 'text-white' },
    dark: { gradient: 'from-slate-900 to-slate-950', text: 'text-white' },
    colorful: { gradient: 'from-yellow-400 via-red-500 to-pink-500', text: 'text-white' },
    light: { gradient: 'from-slate-100 to-gray-200', text: 'text-slate-900' },
    deepblue: { gradient: 'from-blue-950 to-blue-900', text: 'text-white' },
    crimson: { gradient: 'from-red-950 to-red-900', text: 'text-white' },
    teal: { gradient: 'from-slate-900 via-teal-900 to-cyan-900', text: 'text-white' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} relative overflow-hidden`}>
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      
      {/* Two-column layout */}
      <div className="relative z-10 h-full flex">
        {/* Left section - Text content */}
        <div className="flex-1 flex items-center px-16">
          <div>
            <h1 className={`text-4xl md:text-5xl font-bold ${colors.text} mb-6 leading-tight tracking-tight`}>{title}</h1>
            <p className={`text-lg md:text-xl ${colors.text} opacity-80 leading-relaxed font-light max-w-2xl`}>{text}</p>
          </div>
        </div>

        {/* Right section - Full Image placeholder */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-blue-600/30 via-purple-600/20 to-transparent"></div>
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/30 to-cyan-400/20 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className={`text-base ${colors.text} opacity-50 font-light`}>Visual Content Area</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template 19: Insight Bold
export const InsightSlide: React.FC<{
  title: string;
  text: string;
  theme?: string;
}> = ({ title, text, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string }> = {
    modern: { accent: 'from-blue-600 to-purple-600', bg: 'bg-gradient-to-br from-blue-50 to-purple-50' },
    classic: { accent: 'from-slate-800 to-slate-900', bg: 'bg-white' },
    gradient: { accent: 'from-pink-500 to-indigo-500', bg: 'bg-gradient-to-br from-pink-50 to-indigo-50' },
    dark: { accent: 'from-blue-400 to-purple-400', bg: 'bg-slate-900' },
    colorful: { accent: 'from-yellow-400 to-pink-500', bg: 'bg-gradient-to-br from-yellow-50 to-pink-50' },
    light: { accent: 'from-slate-800 to-slate-900', bg: 'bg-white' },
    deepblue: { accent: 'from-blue-600 to-blue-500', bg: 'bg-blue-950' },
    crimson: { accent: 'from-red-600 to-red-500', bg: 'bg-red-950' },
    teal: { accent: 'from-teal-600 to-cyan-500', bg: 'bg-slate-900' },
  };

  const colors = themeColors[theme] || themeColors.modern;
  const isDark = ['dark', 'deepblue', 'crimson', 'teal'].includes(theme);

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} px-16`}>
      <div className={`max-w-4xl text-center ${isDark ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl p-16 border-4 border-dashed`}
           style={{ borderColor: isDark ? 'rgba(147, 197, 253, 0.5)' : 'rgba(59, 130, 246, 0.5)' }}>
        <div className="mb-6">
          <span className={`inline-block text-sm font-semibold uppercase tracking-wider bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent`}>
            💡 {title}
          </span>
        </div>
        <p className={`text-base md:text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} leading-relaxed`}>
          {text}
        </p>
      </div>
    </div>
  );
};

// Template 20: Section Divider Minimal
export const SectionDividerSlide: React.FC<{
  title: string;
  theme?: string;
}> = ({ title, theme = 'modern' }) => {
  const themeColors: Record<string, { gradient: string; text: string }> = {
    modern: { gradient: 'from-blue-600 to-purple-600', text: 'text-white' },
    classic: { gradient: 'from-slate-800 to-slate-900', text: 'text-white' },
    gradient: { gradient: 'from-pink-500 via-purple-500 to-indigo-500', text: 'text-white' },
    dark: { gradient: 'from-slate-900 to-slate-950', text: 'text-white' },
    colorful: { gradient: 'from-yellow-400 via-red-500 to-pink-500', text: 'text-white' },
    light: { gradient: 'from-slate-100 to-gray-200', text: 'text-slate-900' },
    deepblue: { gradient: 'from-blue-950 to-blue-900', text: 'text-white' },
    crimson: { gradient: 'from-red-950 to-red-900', text: 'text-white' },
    teal: { gradient: 'from-slate-900 via-teal-900 to-cyan-900', text: 'text-white' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colors.gradient}`}>
      <h1 className={`text-base md:text-8xl font-semibold ${colors.text} text-center px-16`}>{title}</h1>
    </div>
  );
};

// Template 21: Grid 3-Column Layout
export const GridSlide: React.FC<{
  title: string;
  items: string[];
  theme?: string;
}> = ({ title, items, theme = 'modern' }) => {
  const colors = getThemeColors(theme);
  const isDark = ['dark', 'deepblue', 'crimson', 'teal'].includes(theme);

  return (
    <div className={`w-full h-full flex flex-col justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-3xl font-semibold ${colors.accent} mb-12 text-center`}>{title}</h2>
      
      <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
        {items.map((item, idx) => (
          <div key={idx} className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-8 shadow-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`text-2xl font-semibold ${colors.accent} mb-4`}>{String(idx + 1).padStart(2, '0')}</div>
            <p className={`${colors.textDark} leading-relaxed`}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Template 22: Two-Column Text-Image (Different from existing)
export const TwoColumnSlide: React.FC<{
  left: string;
  right: string;
  theme?: string;
}> = ({ left, right, theme = 'modern' }) => {
  const colors = getThemeColors(theme);

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} px-16`}>
      <div className="flex gap-16 max-w-6xl w-full">
        <div className="flex-1">
          <div className={`${colors.textDark} text-base leading-relaxed whitespace-pre-wrap`}>
            {left}
          </div>
        </div>
        <div className="flex-1">
          <div className={`${colors.textDark} text-base leading-relaxed whitespace-pre-wrap`}>
            {right}
          </div>
        </div>
      </div>
    </div>
  );
};

// Template 23: Callout Highlight
export const CalloutSlide: React.FC<{
  title: string;
  text: string;
  theme?: string;
}> = ({ title, text, theme = 'modern' }) => {
  const themeColors: Record<string, { gradient: string; bg: string }> = {
    modern: { gradient: 'from-blue-600 to-purple-600', bg: 'bg-slate-50' },
    classic: { gradient: 'from-slate-800 to-slate-900', bg: 'bg-white' },
    gradient: { gradient: 'from-pink-500 to-indigo-500', bg: 'bg-gradient-to-br from-pink-50 to-indigo-50' },
    dark: { gradient: 'from-blue-400 to-purple-400', bg: 'bg-slate-900' },
    colorful: { gradient: 'from-yellow-400 to-pink-500', bg: 'bg-gradient-to-br from-yellow-50 to-pink-50' },
    light: { gradient: 'from-slate-800 to-slate-900', bg: 'bg-white' },
    deepblue: { gradient: 'from-blue-600 to-blue-500', bg: 'bg-blue-950' },
    crimson: { gradient: 'from-red-600 to-red-500', bg: 'bg-red-950' },
    teal: { gradient: 'from-teal-600 to-cyan-500', bg: 'bg-slate-900' },
  };

  const colors = themeColors[theme] || themeColors.modern;
  const isDark = ['dark', 'deepblue', 'crimson', 'teal'].includes(theme);

  return (
    <div className={`w-full h-full flex items-center justify-center ${colors.bg} px-16 py-12`}>
      <div className="max-w-5xl relative">
        {/* "Did You Know?" Banner with lightbulb icon */}
        <div className="flex items-center mb-8">
          {/* Lightbulb icon */}
          <div className="relative">
            <div className="text-base">💡</div>
            {/* Light rays */}
            <div className="absolute -top-2 -left-2 text-red-500 text-base">✦</div>
            <div className="absolute -top-3 left-8 text-red-500 text-base">✦</div>
            <div className="absolute top-2 -left-4 text-red-500 text-base">✦</div>
          </div>
          
          {/* Banner */}
          <div className="relative ml-4">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 font-semibold text-base shadow-lg"
              style={{
                clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)',
                minWidth: '350px'
              }}
            >
              DID YOU KNOW?
            </div>
          </div>
        </div>

        {/* Fact Box */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-3xl p-10 shadow-xl border-2`}>
          {title && (
            <h3 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4 uppercase tracking-wide`}>
              {title}
            </h3>
          )}
          <p className={`text-base ${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

// Two-Column Code Slide (Gamma Style)
export const TwoColumnCodeSlide: React.FC<{
  title: string;
  columns: Array<{ subtitle: string; code: string; codeLanguage?: string }>;
  theme?: string;
}> = ({ title, columns, theme = 'modern' }) => {
  const isDark = ['dark', 'deepblue', 'crimson', 'teal'].includes(theme);

  const themeColors: Record<string, { bg: string; cardBg: string; titleAccent: string }> = {
    modern: { bg: 'bg-slate-50', cardBg: 'bg-blue-50', titleAccent: 'from-blue-600 to-purple-600' },
    classic: { bg: 'bg-white', cardBg: 'bg-slate-50', titleAccent: 'from-slate-800 to-slate-900' },
    gradient: { bg: 'bg-gradient-to-br from-pink-50 to-indigo-50', cardBg: 'bg-white', titleAccent: 'from-pink-500 to-indigo-500' },
    dark: { bg: 'bg-slate-900', cardBg: 'bg-slate-800', titleAccent: 'from-blue-400 to-purple-400' },
    colorful: { bg: 'bg-gradient-to-br from-yellow-50 to-pink-50', cardBg: 'bg-white', titleAccent: 'from-yellow-400 to-pink-500' },
    light: { bg: 'bg-white', cardBg: 'bg-slate-50', titleAccent: 'from-slate-800 to-slate-900' },
    deepblue: { bg: 'bg-blue-950', cardBg: 'bg-blue-900', titleAccent: 'from-blue-400 to-cyan-400' },
    crimson: { bg: 'bg-red-950', cardBg: 'bg-red-900', titleAccent: 'from-red-400 to-pink-400' },
    teal: { bg: 'bg-slate-900', cardBg: 'bg-slate-800', titleAccent: 'from-teal-400 to-cyan-400' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-full ${colors.bg} px-12 py-10 flex flex-col`}>
      {/* Title */}
      <h1 className={`text-2xl font-semibold bg-gradient-to-r ${colors.titleAccent} bg-clip-text text-transparent mb-6`}>
        {title}
      </h1>

      {/* Two Column Layout */}
      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        {columns.map((column, index) => {
          // Clean up escape sequences from the code
          const cleanCode = column.code
            .replace(/\\\\n/g, '\n')  // Handle double-escaped newlines
            .replace(/\\n/g, '\n')     // Handle single-escaped newlines
            .replace(/\\\\"/g, '"')    // Handle double-escaped quotes
            .replace(/\\"/g, '"')      // Handle single-escaped quotes
            .replace(/\\\\/g, '\\');   // Handle double-escaped backslashes
          
          return (
            <div key={index} className={`${colors.cardBg} rounded-2xl p-5 border-2 ${isDark ? 'border-slate-700' : 'border-slate-200'} flex flex-col min-h-0`}>
              {/* Subtitle */}
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-3 flex-shrink-0`}>
                {column.subtitle}
              </h3>
              
              {/* Code Block - Scrollable */}
              <div className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-100'} rounded-xl p-4 overflow-y-auto overflow-x-hidden min-h-0`}>
                <pre className={`text-base ${isDark ? 'text-green-400' : 'text-slate-800'} font-mono leading-relaxed whitespace-pre-wrap break-words`}>
                  <code>{cleanCode}</code>
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
