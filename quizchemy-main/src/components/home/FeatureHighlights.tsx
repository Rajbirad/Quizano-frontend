
import React from 'react';
import { Brain, Book, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const FeatureHighlights: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Features That Make Learning Fun</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the tools that will transform your study experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Flashcards</h3>
            <p className="text-muted-foreground">
              Generate perfect study materials from any text with our AI assistant
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Repetition</h3>
            <p className="text-muted-foreground">
              Our algorithm ensures you review cards at the optimal moment for memory retention
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Tutor</h3>
            <p className="text-muted-foreground">
              Get personalized explanations and answers to your questions 24/7
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Watch your knowledge grow with detailed analytics and insights
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/pricing')}
            className="mt-4"
          >
            View Pricing Plans
          </Button>
        </div>
      </div>
    </section>
  );
};
