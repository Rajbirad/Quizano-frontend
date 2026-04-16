import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Template 16: Interactive Toggle/Feature Comparison
export const InteractiveFeatures: React.FC<{
  title: string;
  features: Array<{
    name: string;
    description: string;
    details: string[];
    icon?: React.ReactNode;
  }>;
  theme?: string;
}> = ({ title, features, theme = 'modern' }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const themeColors: Record<string, { accent: string; bg: string; text: string; cardBg: string; descText: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-slate-50', text: 'text-slate-900', cardBg: 'bg-white', descText: 'text-slate-600' },
    classic: { accent: 'text-slate-900', bg: 'bg-white', text: 'text-slate-900', cardBg: 'bg-slate-100', descText: 'text-slate-600' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', text: 'text-slate-900', cardBg: 'bg-white', descText: 'text-slate-600' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', text: 'text-slate-100', cardBg: 'bg-slate-800', descText: 'text-slate-400' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', text: 'text-slate-900', cardBg: 'bg-white', descText: 'text-slate-600' },
    light: { accent: 'text-slate-900', bg: 'bg-white', text: 'text-slate-900', cardBg: 'bg-slate-100', descText: 'text-slate-600' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', text: 'text-blue-100', cardBg: 'bg-blue-900', descText: 'text-blue-300' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', text: 'text-red-100', cardBg: 'bg-red-900', descText: 'text-red-300' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', text: 'text-cyan-100', cardBg: 'bg-teal-800', descText: 'text-cyan-300' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-screen flex items-center justify-center ${colors.bg} px-16 py-16`}>
      <div className="w-full max-w-5xl">
        <h2 className={`text-5xl font-bold mb-16 ${colors.accent}`}>{title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Selector */}
          <div className="space-y-2">
            {features.map((feature, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  activeFeature === idx
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white border-2 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{feature.icon}</span>
                  <span className="font-bold">{feature.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Details Display */}
          <div className="md:col-span-2">
            <div className={`${colors.cardBg} rounded-lg p-8 border-2 border-slate-200 h-full`}>
              <h3 className={`text-3xl font-bold ${colors.text} mb-3`}>{features[activeFeature].name}</h3>
              <p className={`text-lg ${colors.descText} mb-6`}>{features[activeFeature].description}</p>

              <ul className="space-y-3">
                {features[activeFeature].details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className={colors.text}>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template 17: Process/Flowchart
export const ProcessFlow: React.FC<{
  title: string;
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  theme?: string;
}> = ({ title, steps, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; line: string; text: string; descText: string; cardBg: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-white', line: 'bg-blue-600', text: 'text-slate-900', descText: 'text-slate-600', cardBg: 'bg-white' },
    classic: { accent: 'text-slate-900', bg: 'bg-slate-50', line: 'bg-slate-900', text: 'text-slate-900', descText: 'text-slate-600', cardBg: 'bg-white' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', line: 'bg-purple-600', text: 'text-slate-900', descText: 'text-slate-600', cardBg: 'bg-white' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', line: 'bg-white', text: 'text-slate-100', descText: 'text-slate-400', cardBg: 'bg-slate-800' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', line: 'bg-pink-600', text: 'text-slate-900', descText: 'text-slate-600', cardBg: 'bg-white' },
    light: { accent: 'text-slate-900', bg: 'bg-white', line: 'bg-slate-900', text: 'text-slate-900', descText: 'text-slate-600', cardBg: 'bg-slate-50' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', line: 'bg-blue-400', text: 'text-blue-100', descText: 'text-blue-300', cardBg: 'bg-blue-900' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', line: 'bg-red-400', text: 'text-red-100', descText: 'text-red-300', cardBg: 'bg-red-900' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', line: 'bg-teal-400', text: 'text-cyan-100', descText: 'text-cyan-300', cardBg: 'bg-teal-800' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-5xl font-bold mb-20 ${colors.accent}`}>{title}</h2>

      <div className="w-full max-w-6xl">
        <div className="flex items-stretch gap-4 justify-between">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 flex flex-col">
              {/* Step Box */}
              <div className="flex flex-col items-center mb-8">
                <div className={`w-20 h-20 ${colors.line} rounded-full flex items-center justify-center text-white font-bold text-2xl`}>
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <div className={`${colors.cardBg} rounded-lg p-6 border-2 border-slate-200 flex-1`}>
                <h3 className={`text-xl font-bold ${colors.accent} mb-3`}>{step.title}</h3>
                <p className={`${colors.descText} text-sm`}>{step.description}</p>
              </div>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <div className={`h-12 w-1 ${colors.line} mx-auto my-4 opacity-50`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Template 18: Before & After Comparison (Static - animated version would need more)
export const BeforeAfter: React.FC<{
  title: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImage: string;
  afterImage: string;
  description?: string;
  theme?: string;
}> = ({ title, beforeLabel, afterLabel, beforeImage, afterImage, description, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-white' },
    classic: { accent: 'text-slate-900', bg: 'bg-slate-50' },
    minimal: { accent: 'text-primary', bg: 'bg-white' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50' },
    dark: { accent: 'text-white', bg: 'bg-slate-900' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-5xl font-bold mb-4 ${colors.accent}`}>{title}</h2>
      {description && <p className="text-xl text-slate-600 mb-12">{description}</p>}

      <div className="flex gap-8 w-full max-w-6xl">
        {/* Before */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className={`text-2xl font-bold ${colors.accent} text-center`}>{beforeLabel}</h3>
          </div>
          <img src={beforeImage} alt={beforeLabel} className="w-full rounded-lg shadow-lg" />
        </div>

        {/* After */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className={`text-2xl font-bold ${colors.accent} text-center`}>{afterLabel}</h3>
          </div>
          <img src={afterImage} alt={afterLabel} className="w-full rounded-lg shadow-lg" />
        </div>
      </div>
    </div>
  );
};

// Template 19: Team/Testimonials Showcase
export const TeamShowcase: React.FC<{
  title: string;
  members: Array<{
    name: string;
    title?: string;
    image: string;
    bio?: string;
  }>;
  columns?: 2 | 3 | 4;
  theme?: string;
}> = ({ title, members, columns = 3, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; cardBg: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-slate-50', cardBg: 'bg-white' },
    classic: { accent: 'text-slate-900', bg: 'bg-white', cardBg: 'bg-slate-50' },
    minimal: { accent: 'text-primary', bg: 'bg-white', cardBg: 'bg-primary/5' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', cardBg: 'bg-white' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', cardBg: 'bg-slate-800' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', cardBg: 'bg-white' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full min-h-screen flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-5xl font-bold mb-16 ${colors.accent}`}>{title}</h2>

      <div className={`grid gap-8 w-full max-w-6xl grid-cols-${columns}`}>
        {members.map((member, idx) => (
          <div key={idx} className={`${colors.cardBg} rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow`}>
            <img src={member.image} alt={member.name} className="w-full h-64 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
              {member.title && <p className={`${colors.accent} font-medium mb-2`}>{member.title}</p>}
              {member.bio && <p className="text-slate-600 text-sm">{member.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Template 20: Dynamic Three-Column Layout
export const ThreeColumnLayout: React.FC<{
  title: string;
  columns: Array<{
    heading: string;
    items: string[];
    icon?: React.ReactNode;
  }>;
  theme?: string;
}> = ({ title, columns, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; colBg: string; text: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-white', colBg: 'bg-blue-50', text: 'text-slate-700' },
    classic: { accent: 'text-slate-900', bg: 'bg-slate-50', colBg: 'bg-white', text: 'text-slate-700' },
    minimal: { accent: 'text-primary', bg: 'bg-white', colBg: 'bg-primary/5', text: 'text-slate-700' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50', colBg: 'bg-white', text: 'text-slate-700' },
    dark: { accent: 'text-white', bg: 'bg-slate-900', colBg: 'bg-slate-800', text: 'text-slate-200' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50', colBg: 'bg-pink-50', text: 'text-slate-700' },
    light: { accent: 'text-slate-900', bg: 'bg-white', colBg: 'bg-slate-50', text: 'text-slate-700' },
    deepblue: { accent: 'text-blue-400', bg: 'bg-blue-950', colBg: 'bg-blue-900', text: 'text-blue-100' },
    crimson: { accent: 'text-red-400', bg: 'bg-red-950', colBg: 'bg-red-900', text: 'text-red-100' },
    teal: { accent: 'text-teal-400', bg: 'bg-slate-900', colBg: 'bg-teal-800', text: 'text-cyan-100' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-5xl font-bold mb-16 ${colors.accent}`}>{title}</h2>

      <div className="grid grid-cols-3 gap-8 w-full max-w-6xl">
        {columns.map((col, idx) => (
          <div key={idx} className={`${colors.colBg} rounded-lg p-8 border-l-4 border-blue-600`}>
            {col.icon && <div className="text-4xl mb-4">{col.icon}</div>}
            <h3 className={`text-2xl font-bold ${colors.accent} mb-6`}>{col.heading}</h3>
            <ul className="space-y-3">
              {col.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-xl">✓</span>
                  <span className={colors.text}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// Template 21: Call-to-Action Form Slide
export const CTAFormSlide: React.FC<{
  title: string;
  description: string;
  buttonText?: string;
  fields?: string[];
  theme?: string;
}> = ({ title, description, buttonText = 'Get Started', fields = ['Email', 'Company', 'Message'], theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string; bg: string; btnBg: string }> = {
    modern: { accent: 'from-blue-600 to-purple-600', bg: 'bg-gradient-to-br from-blue-50 to-purple-50', btnBg: 'bg-blue-600 hover:bg-blue-700' },
    classic: { accent: 'from-slate-800 to-slate-900', bg: 'bg-gradient-to-br from-white to-slate-50', btnBg: 'bg-slate-900 hover:bg-slate-950' },
    minimal: { accent: 'from-primary to-primary', bg: 'bg-white', btnBg: 'bg-primary hover:bg-primary/90' },
    gradient: { accent: 'from-pink-500 to-indigo-500', bg: 'bg-gradient-to-br from-pink-50 to-indigo-50', btnBg: 'bg-gradient-to-r from-pink-500 to-indigo-500 hover:opacity-90' },
    dark: { accent: 'from-slate-900 to-slate-950', bg: 'bg-gradient-to-br from-slate-900 to-slate-950', btnBg: 'bg-white hover:bg-slate-100 text-slate-900' },
    colorful: { accent: 'from-yellow-400 to-pink-500', bg: 'bg-gradient-to-br from-yellow-50 to-pink-50', btnBg: 'bg-gradient-to-r from-yellow-400 to-pink-500 hover:opacity-90' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-screen flex items-center justify-center bg-gradient-to-br ${colors.bg} px-16`}>
      <div className="max-w-2xl w-full">
        <h2 className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent mb-4 text-center`}>
          {title}
        </h2>
        <p className="text-xl text-slate-600 mb-12 text-center">{description}</p>

        <form className="bg-white rounded-lg p-8 shadow-2xl">
          <div className="space-y-4 mb-8">
            {fields.map((field, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={field}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            ))}
          </div>
          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition-all ${colors.btnBg}`}
          >
            {buttonText}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">No spam, unsubscribe anytime</p>
      </div>
    </div>
  );
};

// Template 22: Testimonial/Social Proof Carousel
export const TestimonialSlide: React.FC<{
  title: string;
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
    image?: string;
  }>;
  theme?: string;
}> = ({ title, testimonials, theme = 'modern' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const themeColors: Record<string, { accent: string; bg: string }> = {
    modern: { accent: 'text-blue-600', bg: 'bg-slate-50' },
    classic: { accent: 'text-slate-900', bg: 'bg-white' },
    minimal: { accent: 'text-primary', bg: 'bg-white' },
    gradient: { accent: 'text-purple-600', bg: 'bg-purple-50' },
    dark: { accent: 'text-white', bg: 'bg-slate-900' },
    colorful: { accent: 'text-pink-600', bg: 'bg-yellow-50' },
  };

  const colors = themeColors[theme] || themeColors.modern;
  const current = testimonials[activeIndex];

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${colors.bg} px-16 py-16`}>
      <h2 className={`text-5xl font-bold mb-16 ${colors.accent}`}>{title}</h2>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg p-12 shadow-xl mb-8">
          <div className="text-4xl text-yellow-400 mb-4">"</div>
          <p className="text-2xl text-slate-900 mb-8 leading-relaxed">{current.quote}</p>

          <div className="flex items-center gap-4">
            {current.image && (
              <img src={current.image} alt={current.author} className="w-16 h-16 rounded-full object-cover" />
            )}
            <div>
              <p className={`font-bold text-lg ${colors.accent}`}>{current.author}</p>
              <p className="text-slate-600 text-sm">{current.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                activeIndex === idx ? 'bg-blue-600 w-8' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Template 23: Split-Screen Multi-Column
export const SplitScreenMultiColumn: React.FC<{
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    bgColor?: string;
    textColor?: string;
  }>;
  theme?: string;
}> = ({ title, sections, theme = 'modern' }) => {
  const themeColors: Record<string, { accent: string }> = {
    modern: { accent: 'text-blue-600' },
    classic: { accent: 'text-slate-900' },
    minimal: { accent: 'text-primary' },
    gradient: { accent: 'text-purple-600' },
    dark: { accent: 'text-white' },
    colorful: { accent: 'text-pink-600' },
  };

  const colors = themeColors[theme] || themeColors.modern;

  return (
    <div className={`w-full h-screen`}>
      <div className="h-full flex flex-col">
        <div className="bg-white px-16 py-8">
          <h2 className={`text-4xl font-bold ${colors.accent}`}>{title}</h2>
        </div>

        <div className="flex-1 flex">
          {sections.map((section, idx) => (
            <div key={idx} className={`flex-1 flex items-center justify-center px-12 py-16 ${section.bgColor || 'bg-slate-50'}`}>
              <div>
                <h3 className={`text-3xl font-bold mb-4 ${section.textColor || 'text-slate-900'}`}>
                  {section.heading}
                </h3>
                <p className={`text-lg leading-relaxed ${section.textColor || 'text-slate-700'}`}>
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
