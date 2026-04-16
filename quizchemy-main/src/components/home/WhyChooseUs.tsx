
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  FileQuestion, 
  Brain, 
  Users, 
  BarChart4, 
  Bot, 
  PencilRuler, 
  Video
} from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-white" />,
      title: "AI Flashcards",
      description: "Generate study materials instantly from any content",
      bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
      image: "/images/ai-flashcards.png"
    },
    {
      icon: <FileQuestion className="h-8 w-8 text-white" />,
      title: "Quiz Generator",
      description: "Create interactive quizzes to test your knowledge",
      bgColor: "bg-gradient-to-br from-amber-400 to-amber-600",
      image: "/images/quiz-generator.png"
    },
    {
      icon: <Brain className="h-8 w-8 text-white" />,
      title: "Smart Study Tools",
      description: "Use AI-powered tools to enhance your learning experience",
      bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
      image: "/images/smart-notes.png"
    },
    {
      icon: <Users className="h-8 w-8 text-white" />,
      title: "Classroom",
      description: "Collaborate and learn together in virtual classrooms",
      bgColor: "bg-gradient-to-br from-green-400 to-green-600",
      image: "/images/classroom.png"
    },
    {
      icon: <Video className="h-8 w-8 text-white" />,
      title: "Video Summaries",
      description: "Extract key points from educational videos",
      bgColor: "bg-gradient-to-br from-red-400 to-red-600",
      image: "/images/video-summaries.png"
    },
    {
      icon: <Bot className="h-8 w-8 text-white" />,
      title: "Document AI",
      description: "Chat with AI about your documents and files",
      bgColor: "bg-gradient-to-br from-cyan-400 to-cyan-600",
      image: "/images/document-ai.png"
    },
    {
      icon: <PencilRuler className="h-8 w-8 text-white" />,
      title: "Smart Notes",
      description: "Create structured notes and concept maps",
      bgColor: "bg-gradient-to-br from-pink-400 to-pink-600",
      image: "/images/smart-notes.png"
    },
    {
      icon: <BarChart4 className="h-8 w-8 text-white" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics",
      bgColor: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      image: "/images/progress-tracking.png"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our intelligent platform combines AI technology with proven learning techniques to help you master any subject
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`border-0 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${feature.bgColor}`}
            >
              <div className="p-5">
                <AspectRatio ratio={1/1} className="rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="object-contain w-full h-full p-2"
                  />
                </AspectRatio>
              </div>
              <CardContent className="p-6 text-white">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/90">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
