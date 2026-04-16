// Dummy presentation data to showcase all slide templates
export const dummyPresentationData = {
  title: "QuizChemy AI Slides Demo",
  theme: "modern",
  slides: [
    {
      id: 1,
      type: "TitleSlide",
      content: {
        title: "AI-Powered Presentation",
        subtitle: "Transform Your Documents into Beautiful Slides",
        backgroundImage: "",
      },
    },
    {
      id: 2,
      type: "AgendaSlide",
      content: {
        title: "Agenda",
        items: [
          "Introduction to AI Slides",
          "Key Features and Benefits",
          "How It Works",
          "Real-World Examples",
          "Getting Started",
        ],
      },
    },
    {
      id: 3,
      type: "SectionHeader",
      content: {
        title: "Key Features",
        description: "Discover what makes our platform unique",
        number: 1,
      },
    },
    {
      id: 4,
      type: "BulletsSlide",
      content: {
        title: "Why Choose AI Slides?",
        bullets: [
          "Automatic content extraction from documents",
          "23+ professional slide templates",
          "6 stunning themes to choose from",
          "Intelligent content organization",
          "Export to PowerPoint or PDF",
        ],
      },
    },
    {
      id: 5,
      type: "TwoColumnImageLeft",
      content: {
        title: "Smart Document Processing",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        content: [
          "Our AI analyzes your documents and intelligently extracts key information.",
          "Text, images, data, and structure are automatically recognized and organized.",
          "The content is then mapped to the most appropriate slide layouts for maximum impact.",
        ],
      },
    },
    {
      id: 6,
      type: "TwoColumnTextLeft",
      content: {
        title: "Beautiful Design, Instantly",
        content: [
          "Choose from 6 professionally designed themes.",
          "Each theme includes unique color schemes and typography.",
          "All slides are responsive and look great on any device.",
          "Customize further with your own branding if needed.",
        ],
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
      },
    },
    {
      id: 7,
      type: "ComparisonSlide",
      content: {
        title: "Traditional vs AI-Powered",
        leftLabel: "Traditional Approach",
        rightLabel: "AI-Powered Approach",
        leftItems: [
          "Manual slide creation",
          "Hours of formatting work",
          "Inconsistent design",
          "Tedious content organization",
          "Limited template options",
        ],
        rightItems: [
          "Automatic slide generation",
          "Minutes to completion",
          "Professional consistency",
          "Smart content mapping",
          "23+ slide templates",
        ],
      },
    },
    {
      id: 8,
      type: "StatsSlide",
      content: {
        title: "Platform Impact",
        stats: [
          { number: "10K+", label: "Presentations Created" },
          { number: "95%", label: "Time Saved" },
          { number: "4.9", label: "User Rating", suffix: "/5" },
          { number: "23", label: "Slide Templates" },
        ],
      },
    },
    {
      id: 9,
      type: "QuoteSlide",
      content: {
        quote: "This tool transformed how we create presentations. What used to take hours now takes minutes.",
        author: "Sarah Johnson, Marketing Director",
      },
    },
    {
      id: 10,
      type: "TimelineSlide",
      content: {
        title: "How It Works",
        events: [
          {
            year: "Step 1",
            title: "Upload Document",
            description: "Share your PDF, Word file, or text document",
          },
          {
            year: "Step 2",
            title: "Select Theme",
            description: "Choose from 6 professional design themes",
          },
          {
            year: "Step 3",
            title: "AI Processing",
            description: "Our AI extracts and organizes your content",
          },
          {
            year: "Step 4",
            title: "Review & Export",
            description: "Download your presentation in PPTX or PDF",
          },
        ],
      },
    },
    {
      id: 11,
      type: "ContentIconList",
      content: {
        title: "Key Capabilities",
        items: [
          {
            icon: "📄",
            title: "Document Support",
            description: "PDF, Word, Text, and Markdown files",
          },
          {
            icon: "🎨",
            title: "Theme Variety",
            description: "6 professional themes with unique styles",
          },
          {
            icon: "🤖",
            title: "AI-Powered",
            description: "Smart content extraction and organization",
          },
          {
            icon: "📊",
            title: "Multiple Layouts",
            description: "23+ slide templates for every need",
          },
        ],
        columns: 2,
      },
    },
    {
      id: 12,
      type: "ImageGrid",
      content: {
        title: "Example Use Cases",
        images: [
          {
            src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
            caption: "Business Reports",
          },
          {
            src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
            caption: "Research Papers",
          },
          {
            src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
            caption: "Team Presentations",
          },
        ],
        columns: 3,
      },
    },
    {
      id: 13,
      type: "ProcessFlow",
      content: {
        title: "Content Flow",
        steps: [
          {
            number: 1,
            title: "Extract",
            description: "Pull content from document",
          },
          {
            number: 2,
            title: "Analyze",
            description: "AI categorizes information",
          },
          {
            number: 3,
            title: "Map",
            description: "Match to slide templates",
          },
          {
            number: 4,
            title: "Generate",
            description: "Create beautiful slides",
          },
        ],
      },
    },
    {
      id: 14,
      type: "ThreeColumnLayout",
      content: {
        title: "Platform Features",
        columns: [
          {
            heading: "Smart",
            items: [
              "AI-powered content analysis",
              "Automatic content organization",
              "Intelligent slide structure",
            ],
            icon: "🧠",
          },
          {
            heading: "Fast",
            items: [
              "Generate in under 2 minutes",
              "One-click theme application",
              "Instant preview updates",
            ],
            icon: "⚡",
          },
          {
            heading: "Beautiful",
            items: [
              "Professional designs",
              "Modern color schemes",
              "Polished layouts",
            ],
            icon: "✨",
          },
        ],
      },
    },
    {
      id: 15,
      type: "MediaSlide",
      content: {
        title: "Video Tutorial",
        mediaType: "video",
        mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        caption: "Watch how easy it is to create stunning presentations",
      },
    },
    {
      id: 16,
      type: "FullWidthText",
      content: {
        text: "Our mission is to make professional presentation creation accessible to everyone, regardless of design skills or time constraints.",
      },
    },
    {
      id: 17,
      type: "BeforeAfter",
      content: {
        title: "Transformation Example",
        beforeImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=400&fit=crop",
        afterImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=400&fit=crop",
        beforeLabel: "Before: Raw Document",
        afterLabel: "After: Beautiful Slides",
      },
    },
    {
      id: 18,
      type: "TeamShowcase",
      content: {
        title: "Trusted By Teams Worldwide",
        members: [
          {
            name: "Alex Chen",
            role: "Product Manager",
            image: "https://i.pravatar.cc/150?img=33",
            bio: "Saves 10+ hours weekly",
          },
          {
            name: "Maria Garcia",
            role: "Sales Director",
            image: "https://i.pravatar.cc/150?img=10",
            bio: "Closed 30% more deals",
          },
          {
            name: "John Smith",
            role: "Teacher",
            image: "https://i.pravatar.cc/150?img=12",
            bio: "Engaging student presentations",
          },
        ],
      },
    },
    {
      id: 19,
      type: "TestimonialSlide",
      content: {
        testimonials: [
          {
            text: "Game-changer for our marketing team!",
            author: "Emma Wilson",
            role: "CMO, TechCorp",
            image: "https://i.pravatar.cc/100?img=5",
          },
          {
            text: "The best presentation tool I've ever used.",
            author: "David Lee",
            role: "Consultant",
            image: "https://i.pravatar.cc/100?img=15",
          },
        ],
      },
    },
    {
      id: 20,
      type: "CTAFormSlide",
      content: {
        title: "Ready to Get Started?",
        subtitle: "Create your first AI-powered presentation today",
        ctaText: "Start Free Trial",
        features: [
          "No credit card required",
          "3 presentations free",
          "Cancel anytime",
        ],
      },
    },
    {
      id: 21,
      type: "SummarySlide",
      content: {
        title: "Key Takeaways",
        summary: [
          "AI-powered content extraction saves hours",
          "23+ professional slide templates available",
          "6 beautiful themes to choose from",
          "Perfect for business, education, and personal use",
        ],
        cta: {
          text: "Start Creating Today",
          subtext: "Transform your documents into presentations",
        },
      },
    },
  ],
};

export type SlideData = typeof dummyPresentationData.slides[0];
