
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/signup');
  };
  
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background/50 to-primary/5">
      <div className="max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Learning Smarter Today!
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join thousands of students who have already improved their study efficiency and test scores.
            Get started today and experience the power of AI-enhanced learning!
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary/90 transition-colors px-8 py-6 text-lg shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Get Started for Free
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required • Free basic plan available
          </p>
        </div>
        
        <div className="mt-16 flex justify-center">
          <img
            src="https://via.placeholder.com/200x200?text=AI+Mascot"
            alt="Friendly AI study assistant"
            className="h-32 animate-float"
          />
        </div>
      </div>
    </section>
  );
};
