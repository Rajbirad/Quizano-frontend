
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-100 relative">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-20 pb-32">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Choose the plan that fits your learning needs
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 bg-white/95 backdrop-blur-sm rounded-lg p-1 max-w-xs mx-auto shadow-lg">
              <button
                onClick={() => setIsAnnual(false)}
                className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${!isAnnual ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${isAnnual ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Annually
              </button>
            </div>
            {isAnnual && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Save up to 31% annually
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content - Positioned to overlap header */}
        <div className="relative -mt-16 px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">Free (Starter)</h3>
                </div>
                <div className="text-3xl font-bold">$0<span className="text-sm text-muted-foreground font-normal">/month</span></div>
                <p className="text-muted-foreground mt-2">For getting started</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Flashcards</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • Manual flashcards ✅ (unlimited)<br/>
                      • 5 AI flashcards from text & file<br/>
                      • AI flashcards from video, image, YouTube ❌
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Quizzes</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • 5 AI quizzes from text, file, Similar Questions, Subject<br/>
                      • AI quizzes from video, image, YouTube ❌
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Productivity Hub</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • 25 credits/month
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">AI Humanizer</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • 500 words/month
                    </div>
                  </div>
                </li>
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </div>
            
            {/* Basic Plan */}
            <div className="bg-card rounded-xl p-8 shadow-md border border-primary relative transform scale-105 z-10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">Pro</h3>
                  {isAnnual && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      33% OFF
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold">
                  ${isAnnual ? '10' : '15'}
                  <span className="text-sm text-muted-foreground font-normal">
                    /month
                  </span>
                </div>
                {isAnnual && (
                  <div className="text-sm text-muted-foreground">
                    Billed annually ($120/year)
                  </div>
                )}
                {!isAnnual && (
                  <div className="text-sm text-muted-foreground">
                    Or $10/month billed annually
                  </div>
                )}
                <p className="text-muted-foreground mt-2">For regular learners</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Flashcards</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • Unlimited Manual Flashcards<br/>
                      • Unlimited AI Flashcards
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Quizzes</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • Unlimited AI Quizzes from all sources
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Productivity Hub</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • 250 credits/month
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">AI Humanizer</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • 10,000 words/month
                    </div>
                  </div>
                </li>
              </ul>
              
              <Button 
                className="w-full"
                onClick={handleGetStarted}
              >
                Choose Pro
              </Button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">Ultra</h3>
                  {isAnnual && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      31% OFF
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold">
                  ${isAnnual ? '20' : '29'}
                  <span className="text-sm text-muted-foreground font-normal">
                    /month
                  </span>
                </div>
                {isAnnual && (
                  <div className="text-sm text-muted-foreground">
                    Billed annually ($240/year)
                  </div>
                )}
                {!isAnnual && (
                  <div className="text-sm text-muted-foreground">
                    Or $20/month billed annually
                  </div>
                )}
                <p className="text-muted-foreground mt-2">For power users & teams</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Flashcards</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • Unlimited Manual Flashcards<br/>
                      • Unlimited AI Flashcards
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Quizzes</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • Unlimited AI Quizzes from all sources
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Productivity Hub</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • 1,000 credits/month
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">AI Humanizer</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • 100,000 words/month
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Advanced AI</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      • Priority AI processing<br/>
                      • Advanced AI models<br/>
                    </div>
                  </div>
                </li>
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGetStarted}
              >
                Choose Ultra
              </Button>
            </div>
          </div>
          
          <div className="mt-20 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div>
                <h3 className="text-lg font-medium mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">Yes, you can change your subscription plan at any time. Changes take effect at the start of your next billing cycle.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Is there a free trial for paid plans?</h3>
                <p className="text-muted-foreground">We offer a 14-day free trial for our Pro plan so you can experience all the premium features before committing.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">How does team billing work?</h3>
                <p className="text-muted-foreground">Team billing is based on the number of active users. Contact our sales team for custom pricing for larger organizations.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Do you offer educational discounts?</h3>
                <p className="text-muted-foreground">Yes, we offer special pricing for educational institutions. Please contact us with your school email for verification.</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;