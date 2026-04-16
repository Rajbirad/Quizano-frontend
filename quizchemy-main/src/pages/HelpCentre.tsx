import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Mail,
  ChevronDown,
  ChevronRight,
  Zap,
  FileText,
  Users,
  Settings,
  CreditCard,
  Shield
} from 'lucide-react';

const HelpCentre = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<string[]>(['getting-started']);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Zap,
      description: 'Learn the basics of using Quizano',
      articles: [
        {
          title: 'How to create your first flashcard set',
          content: 'Learn how to create flashcards using our AI-powered generator or manual creator.'
        },
        {
          title: 'Understanding the dashboard',
          content: 'Get familiar with your dashboard and all its features.'
        },
        {
          title: 'Setting up your profile',
          content: 'Customize your profile and learning preferences.'
        }
      ]
    },
    {
      id: 'flashcards',
      title: 'Flashcards & Study Tools',
      icon: FileText,
      description: 'Master flashcard creation and study features',
      articles: [
        {
          title: 'AI Flashcard Generation',
          content: 'Upload documents, images, or text to automatically generate flashcards.'
        },
        {
          title: 'Study modes and settings',
          content: 'Explore different study modes including spaced repetition and quiz mode.'
        },
        {
          title: 'Managing your flashcard decks',
          content: 'Organize, edit, and share your flashcard collections.'
        },
        {
          title: 'Import and export options',
          content: 'Import from other platforms or export your flashcards.'
        }
      ]
    },
    {
      id: 'ai-tools',
      title: 'AI Tools',
      icon: Video,
      description: 'Leverage our AI-powered learning tools',
      articles: [
        {
          title: 'Video Summarizer',
          content: 'Upload videos or YouTube links to get AI-generated summaries.'
        },
        {
          title: 'Document Analysis',
          content: 'Extract key insights from PDFs, Word docs, and other files.'
        },
        {
          title: 'Audio Transcription',
          content: 'Convert audio recordings to text for easy studying.'
        },
        {
          title: 'Image Text Extraction',
          content: 'Extract text from images and screenshots.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: Settings,
      description: 'Manage your account and preferences',
      articles: [
        {
          title: 'Account settings',
          content: 'Update your profile, password, and notification preferences.'
        },
        {
          title: 'Privacy and data',
          content: 'Understand how we handle your data and privacy settings.'
        },
        {
          title: 'Notification preferences',
          content: 'Control what notifications you receive and how.'
        }
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Subscriptions',
      icon: CreditCard,
      description: 'Manage your subscription and billing',
      articles: [
        {
          title: 'Subscription plans',
          content: 'Learn about our different plans and their features.'
        },
        {
          title: 'Billing and payments',
          content: 'Manage your payment methods and billing history.'
        },
        {
          title: 'Upgrading or downgrading',
          content: 'Change your subscription plan at any time.'
        },
        {
          title: 'Refunds and cancellations',
          content: 'Understand our refund policy and how to cancel.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: Shield,
      description: 'Solutions to common problems',
      articles: [
        {
          title: 'Login and authentication issues',
          content: 'Resolve problems with signing in or account access.'
        },
        {
          title: 'File upload problems',
          content: 'Troubleshoot issues with uploading documents or media.'
        },
        {
          title: 'Performance and loading issues',
          content: 'Fix slow loading times or app performance problems.'
        },
        {
          title: 'Browser compatibility',
          content: 'Ensure optimal experience across different browsers.'
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || searchQuery === '');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Help Centre</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to your questions and learn how to make the most of Quizano
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help from our support team
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground">
                Watch step-by-step guides
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with other users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Help Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            const isOpen = openSections.includes(category.id);
            
            return (
              <Card key={category.id}>
                <Collapsible open={isOpen} onOpenChange={() => toggleSection(category.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-6 w-6 text-primary" />
                          <div className="text-left">
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{category.articles.length}</Badge>
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {category.articles.map((article, index) => (
                          <div key={index} className="p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors cursor-pointer">
                            <h4 className="font-medium mb-2">{article.title}</h4>
                            <p className="text-sm text-muted-foreground">{article.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Still need help?
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Email: support@quizano.com</p>
              <p>Response time: Usually within 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpCentre;