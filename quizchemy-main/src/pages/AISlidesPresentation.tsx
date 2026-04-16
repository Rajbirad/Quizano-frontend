import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Palette,
  Check,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePdfToPresentation } from '@/hooks/use-pdf-to-presentation';
import { ThemePreviewGamma } from '@/components/presentation-templates/ThemePreviewGamma';
import '@/components/ui/ShinyText.css';

interface PresentationData {
  inputType: 'text' | 'upload' | 'prompt';
  content: string;
  file?: File;
}

const themes = [
  { 
    id: 'modern', 
    name: 'Modern', 
    description: 'Clean and contemporary design',
    colors: ['#2563eb', '#9333ea'],
    bgClass: 'from-blue-600 to-purple-600',
    useCase: 'Tech, Startups'
  },
  { 
    id: 'gradient', 
    name: 'Gradient', 
    description: 'Vibrant and dynamic',
    colors: ['#ec4899', '#6366f1'],
    bgClass: 'from-pink-500 to-indigo-500',
    useCase: 'Creative, Design'
  },
  { 
    id: 'dark', 
    name: 'Dark', 
    description: 'Sleek and sophisticated',
    colors: ['#0f172a', '#1e293b'],
    bgClass: 'from-slate-950 to-slate-900',
    useCase: 'Gaming, Night Mode'
  },
  { 
    id: 'colorful', 
    name: 'Colorful', 
    description: 'Bright and energetic',
    colors: ['#facc15', '#ec4899'],
    bgClass: 'from-yellow-400 to-pink-500',
    useCase: 'Wellness, Lifestyle'
  },
  { 
    id: 'light', 
    name: 'Light', 
    description: 'Clean and minimal',
    colors: ['#f3f4f6', '#d1d5db'],
    bgClass: 'from-gray-100 to-gray-200',
    useCase: 'Education, Clean'
  },
  { 
    id: 'deepblue', 
    name: 'Deep Blue', 
    description: 'Professional and rich',
    colors: ['#1e3a8a', '#3b82f6'],
    bgClass: 'from-blue-900 to-blue-800',
    useCase: 'Corporate, Premium'
  },
  { 
    id: 'crimson', 
    name: 'Crimson', 
    description: 'Bold and powerful',
    colors: ['#7f1d1d', '#dc2626'],
    bgClass: 'from-red-900 to-red-800',
    useCase: 'Business, Executive'
  },
  { 
    id: 'teal', 
    name: 'Teal', 
    description: 'Fresh and modern',
    colors: ['#0d9488', '#14b8a6'],
    bgClass: 'from-teal-700 to-teal-600',
    useCase: 'Tech, Innovation'
  },
  { 
    id: 'cosmic', 
    name: 'Cosmic', 
    description: 'Dark starry night with elegant design',
    colors: ['#1a1f3a', '#3B82F6'],
    bgClass: 'from-[#1a1f3a] via-[#2d1b4e] to-[#1a1f3a]',
    useCase: 'Premium, Tech, Modern'
  },
  { 
    id: 'sage', 
    name: 'Sage', 
    description: 'Calm and professional light green design',
    colors: ['#d4e5d4', '#4a7c59'],
    bgClass: 'from-[#e8f5e8] to-[#d4e5d4]',
    useCase: 'Business, Professional, Clean'
  },
  { 
    id: 'neon', 
    name: 'Neon', 
    description: 'Dark theme with vibrant gradient text',
    colors: ['#8b5cf6', '#06b6d4'],
    bgClass: 'from-black to-[#1a1a2e]',
    useCase: 'Creative, Modern, Tech'
  },
  { 
    id: 'midnight', 
    name: 'Midnight', 
    description: 'Deep purple with vibrant pink accents',
    colors: ['#2d1b4e', '#ec4899'],
    bgClass: 'from-[#1a0b2e] to-[#2d1b4e]',
    useCase: 'Creative, Bold, Premium'
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    description: 'Professional blue with clean white layout',
    colors: ['#2c5f8d', '#4a90c8'],
    bgClass: 'from-[#5b8db8] to-[#6a9fc9]',
    useCase: 'Professional, Corporate, Clean'
  },
  { 
    id: 'coral', 
    name: 'Coral', 
    description: 'Warm coral with white content and red accents',
    colors: ['#ff7f6e', '#ef4444'],
    bgClass: 'from-[#ff9a8b] to-[#ff6a88]',
    useCase: 'Vibrant, Creative, Warm'
  },
];

const imageSourceOptions = [
  { value: 'auto', label: 'Auto', description: 'Automatically select best images' },
  { value: 'ai-images', label: 'AI Images', description: 'Generate images with AI' },
  { value: 'stock-images', label: 'Stock Images', description: 'Use professional stock photos' },
  { value: 'illustrator', label: 'Illustrator', description: 'Use illustration style images' },
  { value: 'upload', label: 'Add Images', description: 'Upload your own images' },
];

export const AISlidespresentationSettings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { generatePresentation } = usePdfToPresentation();

  const presentationData: PresentationData | null = location.state?.presentationData || null;

  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [imageSource, setImageSource] = useState('auto');
  const [generating, setGenerating] = useState(false);

  const handleBack = () => {
    navigate('/app/ai-slides');
  };

  const handleGenerate = async () => {
    if (!presentationData) {
      toast({
        title: 'Error',
        description: 'No presentation data found. Please go back and try again.',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);

    try {
      // If file upload type, call the PDF to presentation API
      if (presentationData.inputType === 'upload' && presentationData.file) {
        console.log('📄 [AISlidesPresentation] Generating from PDF file:', presentationData.file.name);
        console.log('📊 [AISlidesPresentation] Number of slides requested:', presentationData.numSlides || 7);
        
        const result = await generatePresentation({
          file: presentationData.file,
          numSlides: presentationData.numSlides || 7,
          theme: selectedTheme,
          includeAgenda: false,
        });

        if (result) {
          toast({
            title: 'Success',
            description: `Presentation generated with ${result.slides.length} slides!`,
          });
          
          navigate('/app/presentation-viewer', { 
            state: { 
              presentation: result,
              theme: typeof result.theme === 'string' ? result.theme : result.theme?.id || selectedTheme
            } 
          });
        } else {
          throw new Error('Failed to generate presentation');
        }
      } else {
        // For text and prompt, use dummy data for now
        console.log('📝 [AISlidesPresentation] Generating from text/prompt');
        
        setTimeout(() => {
          toast({
            title: 'Success',
            description: 'Your presentation has been generated successfully!',
          });
          
          navigate('/app/presentation-viewer', { 
            state: { 
              theme: selectedTheme,
              imageSource: imageSource
            } 
          });
          
          setGenerating(false);
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate presentation';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setGenerating(false);
    }
  };

  if (!presentationData) {
    return (
      <div className="container max-w-2xl mx-auto px-6 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Presentation Data</h1>
          <p className="text-muted-foreground">Please go back and create a presentation first.</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 shiny-gradient">
                Choose Your Theme
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Select a theme and preview how your slides will look
            </p>
          </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>
              
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px]">
              <ThemePreviewGamma 
                themes={themes} 
                selectedTheme={selectedTheme} 
                onThemeSelect={setSelectedTheme}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Source Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <CardTitle>Image Source</CardTitle>
            </div>
            <CardDescription>Select where images should come from for your slides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={imageSource} onValueChange={setImageSource}>
              <SelectTrigger className="w-full h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {imageSourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="flex-1 h-12 bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:opacity-90 text-white font-semibold"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Presentation...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Presentation
            </>
          )}
        </Button>
      </div>
      </div>
    </div>
  );
};

export default AISlidespresentationSettings;
