
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { PenTool, FileUp, Text, Image, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

const FlashcardGeneratorPreview = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileUp,
      title: "Upload Files",
      description: "Upload PDFs, documents, or text files to automatically generate flashcards"
    },
    {
      icon: Text,
      title: "Enter Text",
      description: "Paste or type your content directly to create personalized flashcards"
    },
    {
      icon: Image,
      title: "Add Media",
      description: "Include images, videos, or YouTube links for rich multimedia flashcards"
    }
  ];

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PenTool className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Flash Card Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your study materials into interactive flashcards in seconds. Upload files, enter text, or add media to create personalized learning experiences.
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

        {/* Benefits Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Why Use Our Flash Card Generator?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Save Time</h4>
                    <p className="text-muted-foreground">Automatically generate cards from your existing study materials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Multiple Formats</h4>
                    <p className="text-muted-foreground">Support for text, PDFs, images, videos, and more</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Smart Organization</h4>
                    <p className="text-muted-foreground">Automatically organize cards by topics and difficulty</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Interactive Learning</h4>
                    <p className="text-muted-foreground">Engage with multimedia content for better retention</p>
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
            Get Started - Create Your First Flashcards
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-muted-foreground mt-4">Sign up now to start creating personalized flashcards</p>
        </div>
      </div>
    </Layout>
  );
};

export default FlashcardGeneratorPreview;
