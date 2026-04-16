
import React from 'react';
import { Button } from '@/components/ui/button';
import { Laptop } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RevolutionizeStudy: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/signup');
  };
  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Revolutionize Your Study Habits
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Traditional study methods are inefficient. Our platform leverages cutting-edge AI and cognitive science to help you learn faster and remember longer.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span>Generate high-quality flashcards in seconds</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span>Review exactly when you need to, not too early or too late</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span>Track your progress with detailed analytics</span>
              </li>
            </ul>
            <Button 
              className="mt-8"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>
          
          <div className="aspect-video rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm shadow-lg border">
            <div className="p-6 h-full flex items-center justify-center">
              <Laptop className="h-full w-auto max-h-[200px] text-primary opacity-50" />
              {/* You can replace this with an actual mockup of the platform */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
