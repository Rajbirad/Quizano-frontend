import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BillingTab = 'annually' | 'monthly';

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [billing, setBilling] = useState<BillingTab>('annually');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isAnnual = billing === 'annually';

  const handleGetStarted = () => {
    onClose();
    navigate('/auth');
  };

  const tabs: { key: BillingTab; label: string }[] = [
    { key: 'annually', label: 'Annually (Save 30%)' },
    { key: 'monthly', label: 'Monthly' },
  ];

  const plans = [
    {
      name: 'Free',
      subtitle: 'For getting started',
      monthlyPrice: 0,
      annualMonthly: 0,
      annualTotal: 0,
      originalMonthly: null,
      originalAnnual: null,
      saveBadge: null,
      cta: 'Get Started Free',
      ctaStyle: 'outline' as const,
      featured: false,
      featuredLabel: null,
      tagline: null,
      features: [
        { bold: '5 AI generations/month for:', items: ['AI Diagrams, MindMaps, Notes', 'AI Presentations, Infographics', 'AI Podcast, Grammar Checker'] },
        { bold: '250 Productivity credits/month', items: [] },
        { bold: '500 AI Humanizer words/month', items: [] },
        { bold: 'Manual flashcards', items: ['Unlimited'] },
      ],
    },
    {
      name: 'Pro',
      subtitle: 'For regular learners',
      monthlyPrice: 15,
      annualMonthly: 10,
      annualTotal: 120,
      originalMonthly: 15,
      originalAnnual: 180,
      saveBadge: isAnnual ? 'Save 33%' : null,
      cta: 'Buy Pro',
      ctaStyle: 'filled' as const,
      featured: true,
      featuredLabel: null,
      tagline: isAnnual ? 'Just $0.33 a day' : null,
      features: [
        { bold: 'Unlimited AI generations for:', items: ['AI Diagrams, MindMaps, Notes', 'AI Presentations, Infographics', 'AI Podcast, Grammar Checker'] },
        { bold: '1000 Productivity credits/month', items: [] },
        { bold: '10,000 AI Humanizer words/month', items: [] },
        { bold: 'Unlimited AI Flashcards & Quizzes', items: [] },
      ],
    },
    {
      name: 'Ultra',
      subtitle: 'For power users & teams',
      monthlyPrice: 29,
      annualMonthly: 20,
      annualTotal: 240,
      originalMonthly: 29,
      originalAnnual: 348,
      saveBadge: isAnnual ? 'Save 31%' : null,
      cta: 'Buy Ultra',
      ctaStyle: 'outline' as const,
      featured: false,
      featuredLabel: null,
      tagline: null,
      features: [
        { bold: 'Unlimited AI generations for:', items: ['AI Diagrams, MindMaps, Notes', 'AI Presentations, Infographics', 'AI Podcast, Grammar Checker'] },
        { bold: '1,000 Productivity credits/month', items: [] },
        { bold: '100,000 AI Humanizer words/month', items: [] },
        { bold: 'Priority AI processing', items: ['Advanced AI models'] },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-[#EEF2FF] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Billing tabs */}
        <div className="flex justify-center pt-6 pb-4 px-6">
          <div className="flex items-center gap-1 border border-gray-300 bg-white rounded-full p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setBilling(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  billing === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 px-6 pb-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl overflow-hidden ${
                plan.featured
                  ? 'bg-white shadow-xl z-10 md:-mx-0 md:scale-[1.02] border-2 border-blue-100'
                  : 'bg-white/70 shadow-sm'
              }`}
            >
              {/* Featured accent bar */}
              {plan.featured && (
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-t-2xl" />
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Save badge */}
                {plan.saveBadge && (
                  <div className="self-end mb-1">
                    <span className="bg-amber-100 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {plan.saveBadge}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>

                {/* Pricing */}
                {plan.monthlyPrice === 0 ? (
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">$0</span>
                    <span className="text-sm text-gray-500 ml-1">/month</span>
                  </div>
                ) : (
                  <div className="mb-1">
                    <div className="flex items-baseline gap-3">
                      <div>
                        <span className="text-4xl font-bold text-gray-900">
                          ${isAnnual ? plan.annualMonthly : plan.monthlyPrice}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/month</span>
                      </div>
                      {isAnnual && (
                        <div className="text-sm text-gray-500">
                          ${plan.annualTotal}/year
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all mt-3 mb-5 ${
                    plan.ctaStyle === 'filled'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : 'border border-gray-300 text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-2 text-sm text-gray-700">
                  {plan.features.map((feat, i) => (
                    <li key={i}>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold underline">{feat.bold}</span>
                      </div>
                      {feat.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-2 pl-6 mt-1">
                          <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="text-center pb-5 text-sm text-gray-500">
          Need full details?{' '}
          <button
            onClick={() => { onClose(); window.open('/pricing', '_blank'); }}
            className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            View pricing page
          </button>
        </div>
      </div>
    </div>
  );
};

