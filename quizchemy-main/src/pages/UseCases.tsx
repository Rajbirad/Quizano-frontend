import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  Users, 
  Trophy,
  Target,
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const UseCases = () => {
  const useCases = [
    {
      icon: GraduationCap,
      title: "Students & Academics",
      description: "From high school to PhD level, streamline your study process and boost academic performance.",
      image: "/lovable-uploads/04cb5454-40b4-428f-8e28-a83115ff83d8.png",
      features: [
        "Lecture note conversion to flashcards",
        "Exam preparation with AI quizzes",
        "Research paper summarization",
        "Progress tracking and analytics"
      ],
      stats: { users: "50K+", improvement: "85%" }
    },
    {
      icon: Briefcase,
      title: "Professional Development",
      description: "Stay ahead in your career with continuous learning and skill development tools.",
      image: "/lovable-uploads/529c4dc9-c48f-4491-8077-c01c1ed79467.png",
      features: [
        "Industry certification prep",
        "Training material creation",
        "Knowledge retention tracking",
        "Team collaboration tools"
      ],
      stats: { users: "25K+", improvement: "92%" }
    },
    {
      icon: Users,
      title: "Corporate Training",
      description: "Scale employee education with AI-powered content creation and assessment tools.",
      image: "/images/classroom.png",
      features: [
        "Automated training material generation",
        "Employee progress monitoring",
        "Compliance training quizzes",
        "Custom learning paths"
      ],
      stats: { users: "500+", improvement: "78%" }
    },
    {
      icon: BookOpen,
      title: "Language Learning",
      description: "Master new languages with personalized flashcards and adaptive learning techniques.",
      image: "/images/smart-notes.png",
      features: [
        "Vocabulary building flashcards",
        "Grammar practice quizzes",
        "Audio pronunciation guides",
        "Cultural context notes"
      ],
      stats: { users: "30K+", improvement: "95%" }
    },
    {
      icon: Trophy,
      title: "Competitive Exams",
      description: "Prepare for standardized tests and competitive exams with targeted practice materials.",
      image: "/images/quiz-generator.png",
      features: [
        "Subject-specific question banks",
        "Timed practice sessions",
        "Weakness identification",
        "Performance analytics"
      ],
      stats: { users: "40K+", improvement: "88%" }
    },
    {
      icon: Target,
      title: "Skill Certifications",
      description: "Earn industry certifications faster with focused study materials and practice tests.",
      image: "/images/progress-tracking.png",
      features: [
        "Certification-aligned content",
        "Mock exam simulations",
        "Study plan optimization",
        "Success rate tracking"
      ],
      stats: { users: "15K+", improvement: "90%" }
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student",
      content: "Quizano helped me reduce study time by 40% while improving my exam scores. The AI-generated flashcards are incredibly accurate.",
      avatar: "/lovable-uploads/ed5795cf-29b1-4855-86fb-d8df36c569dc.png"
    },
    {
      name: "Marcus Johnson",
      role: "Software Engineer",
      content: "Perfect for staying updated with new technologies. I use it to create quick study materials from documentation and tutorials.",
      avatar: "/lovable-uploads/04cb5454-40b4-428f-8e28-a83115ff83d8.png"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Corporate Trainer",
      content: "We've transformed our training programs using Quizano. Employee engagement and knowledge retention have significantly improved.",
      avatar: "/lovable-uploads/529c4dc9-c48f-4491-8077-c01c1ed79467.png"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Success Stories Across
              <span className="block text-primary-foreground/90">Every Learning Journey</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
              Discover how students, professionals, and organizations use Quizano to achieve their learning goals faster and more effectively.
            </p>
            <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
              Start Your Journey
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">150K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">89%</div>
              <div className="text-muted-foreground">Average Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50M+</div>
              <div className="text-muted-foreground">Flashcards Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Institutions</div>
            </div>
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Every Learner
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a student, professional, or organization, Quizano adapts to your unique learning needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {useCases.map((useCase, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                    <img 
                      src={useCase.image} 
                      alt={useCase.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/lovable-uploads/04cb5454-40b4-428f-8e28-a83115ff83d8.png';
                      }}
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <CardHeader className="p-0 mb-4">
                        <div className="flex items-center mb-2">
                          <useCase.icon className="h-6 w-6 text-primary mr-2" />
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {useCase.title}
                          </CardTitle>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {useCase.description}
                        </p>
                      </CardHeader>
                      
                      <div className="space-y-2 mb-4">
                        {useCase.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {useCase.stats.users} users
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {useCase.stats.improvement} improvement
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-muted-foreground">
                Real stories from learners who've transformed their education with Quizano
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full mr-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/lovable-uploads/ed5795cf-29b1-4855-86fb-d8df36c569dc.png';
                        }}
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join the Success Stories?
            </h2>
            <p className="text-slate-300 mb-8 text-lg max-w-2xl mx-auto">
              Start your free trial today and discover why over 150,000 learners trust Quizano for their educational journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UseCases;