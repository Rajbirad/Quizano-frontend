import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User } from 'lucide-react';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "How AI-Powered Flashcards Are Revolutionizing Learning",
      excerpt: "Discover how artificial intelligence is transforming traditional study methods and making learning more efficient than ever before.",
      author: "Sarah Johnson",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "AI Learning",
      image: "/images/blog-image-1.png"
    },
    {
      id: 2,
      title: "The Science Behind Spaced Repetition",
      excerpt: "Understanding the cognitive science that makes spaced repetition one of the most effective learning techniques for long-term retention.",
      author: "Dr. Michael Chen",
      date: "2024-01-12",
      readTime: "7 min read",
      category: "Learning Science",
      image: "/images/blog-image-2.png"
    },
    {
      id: 3,
      title: "Study Strategies for Visual Learners",
      excerpt: "Effective techniques and tools for students who learn best through visual elements, diagrams, and interactive content.",
      author: "Emma Rodriguez",
      date: "2024-01-10",
      readTime: "4 min read",
      category: "Study Tips",
      image: "/images/smart-notes.png"
    },
    {
      id: 4,
      title: "Creating Effective Quiz Questions with AI",
      excerpt: "Learn how to leverage AI tools to generate high-quality quiz questions that test real understanding, not just memorization.",
      author: "David Kim",
      date: "2024-01-08",
      readTime: "6 min read",
      category: "AI Tools",
      image: "/images/quiz-generator.png"
    },
    {
      id: 5,
      title: "The Future of Digital Education",
      excerpt: "Exploring emerging trends in educational technology and how they're shaping the future of learning and teaching.",
      author: "Prof. Lisa Wang",
      date: "2024-01-05",
      readTime: "8 min read",
      category: "EdTech",
      image: "/images/classroom.png"
    },
    {
      id: 6,
      title: "Maximizing Learning with Video Summaries",
      excerpt: "How to effectively use AI-generated video summaries to enhance your understanding and retention of complex topics.",
      author: "Alex Thompson",
      date: "2024-01-03",
      readTime: "5 min read",
      category: "Study Tips",
      image: "/images/video-summaries.png"
    }
  ];

  const categories = ["All", "AI Learning", "Study Tips", "Learning Science", "AI Tools", "EdTech"];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Quizano Blog
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Insights, tips, and resources to help you master the art of learning with AI-powered tools
            </p>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="hover:scale-105 transition-transform"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/blog-image-1.png';
                    }}
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-muted-foreground text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="hover:scale-105 transition-transform">
              Load More Articles
            </Button>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-slate-900 text-white py-16 mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Get the latest insights on AI-powered learning, study techniques, and educational technology delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-slate-900"
              />
              <Button className="bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
