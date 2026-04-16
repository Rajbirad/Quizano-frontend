
import React from 'react';
import { Upload, Brain, FileCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/signup');
  };

  const steps = [
    {
      icon: <Upload className="h-8 w-8 text-primary" />,
      title: "Upload Your Content",
      description: "Drop a PDF, document, image, or video link."
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI Processes Your Material",
      description: "AI scans key concepts & extracts information."
    },
    {
      icon: <FileCheck className="h-8 w-8 text-primary" />,
      title: "Flashcards & Quizzes Generated",
      description: "Get interactive study materials instantly."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Study & Improve Faster!",
      description: "Use AI Tutor, quizzes, and tracking to master subjects."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our intelligent system simplifies the learning process in just a few steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center hover-lift">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-full w-full h-0.5 bg-primary/20 hidden lg:block" style={{ width: 'calc(100% - 4rem)' }}></div>
                )}
                <div className="absolute top-0 -left-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="animate-pulse-gentle"
          >
            Start Learning Now
          </Button>
        </div>
      </div>
    </section>
  );
};
