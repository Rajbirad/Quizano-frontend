
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Brain, FileQuestion, Target, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const QuizGeneratorPreview = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Smart Question Creation",
      description: "AI analyzes your content and creates relevant quiz questions automatically"
    },
    {
      icon: Clock,
      title: "Timed Assessments",
      description: "Create time-bound quizzes to simulate real exam conditions"
    },
    {
      icon: Brain,
      title: "Adaptive Difficulty",
      description: "Questions adapt to your knowledge level for optimal learning"
    }
  ];

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileQuestion className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">AI Quiz Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create comprehensive quizzes from any content with AI. Test your knowledge, prepare for exams, and track your learning progress with intelligent assessments.
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
            <CardTitle className="text-2xl">Perfect for Every Learning Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Multiple Choice</h4>
                    <p className="text-muted-foreground">Traditional format perfect for quick assessments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Fill in the Blanks</h4>
                    <p className="text-muted-foreground">Test recall and understanding of key concepts</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">True/False</h4>
                    <p className="text-muted-foreground">Quick knowledge checks for concept verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Short Answer</h4>
                    <p className="text-muted-foreground">In-depth questions for comprehensive understanding</p>
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
            Start Creating Quizzes Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-muted-foreground mt-4">Transform your study materials into engaging quizzes instantly</p>
        </div>
      </div>
    </Layout>
  );
};

export default QuizGeneratorPreview;
