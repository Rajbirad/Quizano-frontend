
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight } from 'lucide-react';

const AiToolsPreview = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: () => <img src="/icons/AITools.svg" alt="" className="w-10 h-10" />,
      title: "AI Chat with Files",
      description: "Upload documents and chat with AI to get insights, summaries, and answers from your files"
    },
    {
      icon: () => <img src="/icons/video.svg" alt="" className="w-10 h-10" />,
      title: "Video Summarizer",
      description: "Extract key points and create summaries from video content, lectures, and tutorials"
    },
    {
      icon: () => <img src="/icons/note.svg" alt="" className="w-10 h-10" />,
      title: "Audio Transcription",
      description: "Convert audio recordings, lectures, and meetings into searchable text"
    },
    {
      icon: () => <img src="/icons/ImageUpload.svg" alt="" className="w-10 h-10" />,
      title: "Image Summarizer",
      description: "Extract and digitize text from images, screenshots, and handwritten notes"
    },
    {
      icon: () => <img src="/icons/Homework.svg" alt="" className="w-10 h-10" />,
      title: "Q&A Generator",
      description: "Generate questions and answers from your content."
    }
  ];

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">AI Tools Suite</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Supercharge your productivity with our comprehensive AI tools. From content analysis to media processing, we've got everything you need to work smarter.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                {typeof tool.icon === 'function' ? tool.icon() : <tool.icon className="h-10 w-10 text-primary mb-2" />}
                <CardTitle className="text-lg">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{tool.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Why Choose Our AI Tools?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <img src="/icons/AITools.svg" alt="" className="w-full h-full" />
                </div>
                <h4 className="font-semibold mb-2">Advanced AI</h4>
                <p className="text-muted-foreground">Powered by cutting-edge AI models for accurate and intelligent processing</p>
              </div>
              <div>
                <div className="h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <img src="/icons/ProductivityHub.svg" alt="" className="w-full h-full" />
                </div>
                <h4 className="font-semibold mb-2">Fast Processing</h4>
                <p className="text-muted-foreground">Get results in seconds, not minutes. Optimized for speed and efficiency</p>
              </div>
              <div>
                <div className="h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <img src="/icons/Subject.svg" alt="" className="w-full h-full" />
                </div>
                <h4 className="font-semibold mb-2">Multiple Formats</h4>
                <p className="text-muted-foreground">Support for various file types including documents, images, audio, and video</p>
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
            Access All AI Tools
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-muted-foreground mt-4">Sign up to unlock the full power of AI for your workflow</p>
        </div>
      </div>
    </Layout>
  );
};

export default AiToolsPreview;
