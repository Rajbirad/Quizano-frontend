
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Zap, Target, ArrowRight, CheckCircle } from 'lucide-react';

const AiFlashcardGeneratorPreview = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Our AI analyzes your content and identifies the most important concepts to study"
    },
    {
      icon: Target,
      title: "Smart Question Generation",
      description: "Automatically creates relevant questions and answers from your materials"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Generate hundreds of flashcards in seconds, not hours"
    }
  ];

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">AI Flash Card Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Harness the power of artificial intelligence to create smarter, more effective flashcards. Our AI analyzes your content and generates the most relevant study materials automatically.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Features Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Advanced AI Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Content Understanding</h4>
                    <p className="text-muted-foreground">AI comprehends context and creates meaningful connections</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Difficulty Optimization</h4>
                    <p className="text-muted-foreground">Automatically adjusts question difficulty for optimal learning</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Multiple Question Types</h4>
                    <p className="text-muted-foreground">Creates various formats: fill-in-blank, multiple choice, and more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Learning Insights</h4>
                    <p className="text-muted-foreground">Provides study recommendations based on your content</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="gradient-button text-lg px-8 py-6"
            onClick={() => navigate('/auth')}
          >
            Experience AI-Powered Learning
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-muted-foreground mt-4">Join thousands of students already using AI to study smarter</p>
        </div>
      </div>
    </Layout>
  );
};

export default AiFlashcardGeneratorPreview;
