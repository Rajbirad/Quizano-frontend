import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Zap, 
  Target, 
  BarChart3, 
  Users, 
  Clock,
  Sparkles,
  FileText,
  Video,
  Mic,
  Image,
  PenTool
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Flashcards",
      description: "Generate intelligent flashcards from any content using advanced AI algorithms that understand context and learning patterns.",
      badge: "Most Popular",
      image: "/images/ai-flashcards.png"
    },
    {
      icon: Target,
      title: "Smart Quiz Generator",
      description: "Create comprehensive quizzes instantly from documents, videos, or text with adaptive difficulty levels.",
      badge: "New",
      image: "/images/quiz-generator.png"
    },
    {
      icon: Video,
      title: "Video Summarization",
      description: "Extract key insights and create study materials from educational videos and lectures automatically.",
      badge: "AI Powered",
      image: "/images/video-summaries.png"
    },
    {
      icon: FileText,
      title: "Smart Notes",
      description: "Transform documents into organized, structured notes with AI-powered analysis and summarization.",
      badge: "Enhanced",
      image: "/images/smart-notes.png"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and personalized insights to optimize study time.",
      badge: "Analytics",
      image: "/images/progress-tracking.png"
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Share flashcards, create study groups, and learn together with advanced collaboration tools.",
      badge: "Social",
      image: "/images/classroom.png"
    },
    {
      icon: Mic,
      title: "Audio Transcription",
      description: "Convert lectures and audio content into searchable text and study materials with high accuracy.",
      badge: "AI Powered",
      image: "/images/smart-notes.png"
    },
    {
      icon: Image,
      title: "Image Summarizer",
      description: "Extract and digitize text from images, handwritten notes, and documents for easy studying.",
      badge: "OCR",
      image: "/images/document-ai.png"
    },
    {
      icon: PenTool,
      title: "Custom Study Plans",
      description: "Get personalized study recommendations based on your learning style and progress patterns.",
      badge: "Personalized",
      image: "/images/progress-tracking.png"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "10x Faster Learning",
      description: "Reduce study time while improving retention with AI-optimized content."
    },
    {
      icon: Clock,
      title: "24/7 AI Tutor",
      description: "Get instant help and explanations whenever you need them."
    },
    {
      icon: Sparkles,
      title: "Adaptive Learning",
      description: "Content that adjusts to your pace and learning preferences."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Powerful Features for
              <span className="block text-primary-foreground/90">Smarter Learning</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
              Discover how our AI-powered platform transforms the way you study, create content, and track your progress.
            </p>
            <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
              Get Started Free
            </Button>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive suite of AI-powered tools covers every aspect of your learning journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg overflow-hidden relative">
                  {feature.badge && (
                    <Badge className="absolute top-3 right-3 z-10" variant="secondary">
                      {feature.badge}
                    </Badge>
                  )}
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/lovable-uploads/04cb5454-40b4-428f-8e28-a83115ff83d8.png';
                    }}
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center mb-2">
                    <feature.icon className="h-6 w-6 text-primary mr-2" />
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-slate-300 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of students and professionals who are already using Quizano to accelerate their learning journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Features;