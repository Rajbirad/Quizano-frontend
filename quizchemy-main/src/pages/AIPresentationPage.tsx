import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  Zap, 
  Palette, 
  BarChart3, 
  Share2, 
  Download, 
  Plus,
  ArrowRight,
  Wand2,
  Loader2
} from 'lucide-react';

export const AIPresentationPage: React.FC = () => {
  const [topicInput, setTopicInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<any>(null);

  const handleGeneratePresentation = async () => {
    if (!topicInput.trim()) return;
    
    setGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedSlides({
        title: 'Multi-threaded Architecture',
        slides: [
          { type: 'title', content: 'Thread Lifecycle States' },
          { type: 'content', content: 'Understanding Java Threading' },
          { type: 'benefits', content: 'Why Use Multithreading?' }
        ]
      });
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="relative container max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                AI Presentation Generator
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Stunning Presentations</span> in Seconds
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Transform any topic into a professionally designed presentation with AI-powered content, beautiful layouts, and ready-to-share slides.
            </p>
          </div>

          {/* Input Section */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-12">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Presentation Topic</label>
                <Input
                  placeholder="e.g., Java Multithreading, Climate Change, Renaissance Art..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Additional Details (Optional)</label>
                <Textarea
                  placeholder="Add any specific points, examples, or requirements..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 resize-none h-24"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleGeneratePresentation}
                  disabled={!topicInput.trim() || generating}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Presentation...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Presentation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {generatedSlides && (
            <div className="space-y-8 mb-12">
              <h2 className="text-3xl font-bold text-white">Your Generated Presentation</h2>

              {/* Slide 1: Title Slide */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  <div className="relative">
                    <span className="text-sm font-semibold text-blue-100 opacity-75">Slide 1 - Title</span>
                  </div>
                  <div className="relative text-center">
                    <h1 className="text-6xl font-bold text-white mb-4">{generatedSlides.title}</h1>
                    <p className="text-xl text-blue-100">Powered by AI Presentation Generator</p>
                  </div>
                  <div className="relative flex justify-between items-center">
                    <div className="text-blue-100 text-sm">1</div>
                    <div className="flex gap-2">
                      <Sparkles className="w-6 h-6 text-blue-100" />
                      <Zap className="w-6 h-6 text-blue-100" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Slide 2: Content Slide */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
                <div className="aspect-video bg-slate-900 p-12 flex gap-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
                  <div className="relative flex-1">
                    <h2 className="text-4xl font-bold text-white mb-6">Thread Lifecycle States</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">New State</h3>
                          <p className="text-slate-400">Thread instance created but start() not yet invoked.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Runnable State</h3>
                          <p className="text-slate-400">After start() invocation, awaiting thread scheduler selection.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Running State</h3>
                          <p className="text-slate-400">Thread scheduler has selected it for execution.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex-1 hidden lg:flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg border border-slate-700 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-20 h-20 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Visual Diagram</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Slide 3: Benefits Slide */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
                <div className="aspect-video bg-slate-900 p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
                  <div className="relative">
                    <h2 className="text-4xl font-bold text-white mb-12">Why Use Multithreading?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-6">
                        <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
                          <Zap className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Non-Blocking</h3>
                        <p className="text-slate-400 text-sm">Threads are independent—perform multiple operations simultaneously without blocking the user.</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-6">
                        <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
                          <BarChart3 className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Time Efficient</h3>
                        <p className="text-slate-400 text-sm">Execute many operations together, significantly reducing overall processing time.</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-lg p-6">
                        <div className="p-3 bg-pink-500/20 rounded-lg w-fit mb-4">
                          <Palette className="w-6 h-6 text-pink-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Fault Isolation</h3>
                        <p className="text-slate-400 text-sm">Exceptions in one thread don't affect others—ensuring robust application behavior.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 h-11 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 font-semibold rounded-lg px-6 h-11 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 font-semibold rounded-lg px-6 h-11 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Slide
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-900/50 border-t border-slate-800 py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Content',
                description: 'Generate engaging, well-researched content automatically'
              },
              {
                icon: Palette,
                title: 'Beautiful Themes',
                description: 'Choose from stunning pre-designed themes and layouts'
              },
              {
                icon: Zap,
                title: 'Instant Generation',
                description: 'Create complete presentations in seconds, not hours'
              },
              {
                icon: Share2,
                title: 'Easy Sharing',
                description: 'Download, share, or present directly from the platform'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="bg-slate-800/30 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:bg-slate-800/50">
                  <CardContent className="pt-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg w-fit mb-4">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-slate-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          <CardContent className="pt-12 pb-12 relative text-center space-y-6">
            <h3 className="text-3xl font-bold text-white">Ready to Create Amazing Presentations?</h3>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Join thousands of professionals and educators creating stunning presentations with AI.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg px-8 h-12 flex items-center gap-2">
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 font-semibold rounded-lg px-8 h-12">
                View Examples
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIPresentationPage;
