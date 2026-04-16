
import React from 'react';
import { Upload, BookOpen, Award, ArrowRight } from 'lucide-react';
import '@/components/ui/ShinyText.css';

export const GeneratorHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 text-center relative shiny-gradient">
        AI Flashcard Generator
      </h1>
      <p className="text-muted-foreground max-w-3xl mx-auto mb-10 text-center">
        Studying for an assessment, test, or knowledge check? Our AI-powered flashcard creator converts your content, notes, documents, and media into intelligent flashcards in moments. Simply add your materials and watch our AI transform them instantly.
      </p>

      {/* How it works section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-12">
        {/* Import Step */}
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Step 1: Import</h3>
          
          {/* Futuristic Import Graphic */}
          <div className="flex items-center justify-center my-4 h-32 w-full">
            <div className="w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Main circular container */}
              <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 animate-pulse-gentle"></div>
              <div className="absolute w-28 h-28 rounded-full border-2 border-cyan-400/30 animate-[spin_15s_linear_infinite]"></div>
              <div className="absolute w-32 h-32 rounded-full border border-orange-400/20 animate-[spin_20s_linear_infinite_reverse]"></div>
              
              {/* Document icons */}
              <div className="absolute w-16 h-20 bg-white/90 rounded-md transform rotate-6 animate-float shadow-md z-10">
                <div className="w-full h-3 bg-orange-400 mt-2 mx-auto"></div>
                <div className="w-3/4 h-1 bg-slate-300 mt-2 mx-auto"></div>
                <div className="w-3/4 h-1 bg-slate-300 mt-1 mx-auto"></div>
                <div className="w-3/4 h-1 bg-slate-300 mt-1 mx-auto"></div>
              </div>
              
              <div className="absolute w-16 h-20 bg-white/90 rounded-md transform -rotate-6 -translate-x-4 translate-y-4 animate-float shadow-md" style={{animationDelay: "0.6s"}}>
                <div className="w-full h-3 bg-cyan-400 mt-2 mx-auto"></div>
                <div className="w-3/4 h-1 bg-slate-300 mt-2 mx-auto"></div>
                <div className="w-3/4 h-1 bg-slate-300 mt-1 mx-auto"></div>
                <div className="w-3/4 h-1 bg-slate-300 mt-1 mx-auto"></div>
              </div>
              
              {/* Small particle elements */}
              <div className="absolute top-2 right-8 w-3 h-3 rounded-full bg-orange-500/70 animate-float" style={{animationDelay: "0.3s"}}></div>
              <div className="absolute bottom-4 left-8 w-2 h-2 rounded-full bg-cyan-500/70 animate-float" style={{animationDelay: "0.8s"}}></div>
              
              {/* Central icon */}
              <div className="relative z-20 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                <Upload className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          <p className="text-muted-foreground">
            Import images, upload documents, take photos, or enter text. Our AI processes any format you provide, with no account required.
          </p>
        </div>

        {/* Study Step */}
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center relative">
          <div className="absolute -left-3 top-1/2 hidden md:block">
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Step 2: Study</h3>
          
          {/* Futuristic Study Graphic */}
          <div className="flex items-center justify-center my-4 h-32 w-full">
            <div className="w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Concentric circles */}
              <div className="absolute w-28 h-28 rounded-full border-2 border-purple-400/30 animate-[spin_12s_linear_infinite_reverse]"></div>
              <div className="absolute w-36 h-36 rounded-full border border-indigo-400/20 animate-[spin_18s_linear_infinite]"></div>
              
              {/* Interactive flashcards */}
              <div className="absolute w-20 h-24 bg-gradient-to-br from-white/90 to-white/80 rounded-lg shadow-md transform -rotate-12 -translate-x-8 animate-float">
                <div className="w-full h-4 bg-purple-400 rounded-t-lg"></div>
                <div className="w-3/4 h-2 bg-purple-200 mt-3 mx-auto"></div>
                <div className="w-3/4 h-2 bg-purple-200 mt-2 mx-auto"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-yellow-400 m-1"></div>
              </div>
              
              <div className="absolute w-20 h-24 bg-gradient-to-br from-white/90 to-white/80 rounded-lg shadow-md z-10">
                <div className="w-full h-4 bg-indigo-400 rounded-t-lg"></div>
                <div className="w-3/4 h-2 bg-indigo-200 mt-3 mx-auto"></div>
                <div className="w-3/4 h-2 bg-indigo-200 mt-2 mx-auto"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-yellow-400 m-1"></div>
              </div>
              
              <div className="absolute w-20 h-24 bg-gradient-to-br from-white/90 to-white/80 rounded-lg shadow-md transform rotate-12 translate-x-8 animate-float" style={{animationDelay: "0.7s"}}>
                <div className="w-full h-4 bg-cyan-400 rounded-t-lg"></div>
                <div className="w-3/4 h-2 bg-cyan-200 mt-3 mx-auto"></div>
                <div className="w-3/4 h-2 bg-cyan-200 mt-2 mx-auto"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-yellow-400 m-1"></div>
              </div>
              
              {/* Connection lines */}
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
              <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-indigo-300/30 to-transparent"></div>
              
              {/* Small floating particles */}
              <div className="absolute top-6 right-10 w-2 h-2 rounded-full bg-purple-500/60 animate-float" style={{animationDelay: "0.4s"}}></div>
              <div className="absolute bottom-6 left-12 w-2 h-2 rounded-full bg-indigo-500/60 animate-float" style={{animationDelay: "0.9s"}}></div>
            </div>
          </div>

          <p className="text-muted-foreground">
            Review your generated flashcards, share with peers, or export to your favorite study platforms. Compatible with Anki and many others.
          </p>
        </div>

        {/* Master Step */}
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center relative">
          <div className="absolute -left-3 top-1/2 hidden md:block">
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Step 3: Master</h3>
          
          {/* Futuristic Master Graphic */}
          <div className="flex items-center justify-center my-4 h-32 w-full">
            <div className="w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Circular achievement container */}
              <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 animate-pulse-gentle"></div>
              <div className="absolute w-32 h-32 rounded-full border-2 border-yellow-400/30 animate-[spin_14s_linear_infinite]"></div>
              <div className="absolute w-36 h-36 rounded-full border border-orange-400/30 animate-[spin_20s_linear_infinite_reverse]"></div>
              
              {/* Achievement elements */}
              <div className="relative z-10">
                <div className="absolute w-18 h-18 rounded-full bg-gradient-to-r from-yellow-400/50 to-orange-500/50 -mt-9 -ml-9 blur-md"></div>
                <Award className="h-16 w-16 text-yellow-500 drop-shadow-lg" />
              </div>

              {/* Rainbow arcs */}
              <div className="absolute top-1/4 right-1/4 w-12 h-6 border-t-2 border-red-400 rounded-t-full rotate-45"></div>
              <div className="absolute top-1/4 right-1/4 w-14 h-7 border-t-2 border-orange-400 rounded-t-full rotate-45 mt-0.5"></div>
              <div className="absolute top-1/4 right-1/4 w-16 h-8 border-t-2 border-yellow-400 rounded-t-full rotate-45 mt-1"></div>
              
              {/* Success indicators */}
              <div className="absolute bottom-6 left-6 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-md animate-float">
                <span className="text-green-500 text-xs font-bold">A+</span>
              </div>
              <div className="absolute top-6 right-6 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-md animate-float" style={{animationDelay: "0.5s"}}>
                <span className="text-cyan-500 text-xs font-bold">✓</span>
              </div>
              
              {/* Particle effects */}
              <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-yellow-500/80 rounded-full animate-float" style={{animationDelay: "0.2s"}}></div>
              <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-orange-500/80 rounded-full animate-float" style={{animationDelay: "0.6s"}}></div>
              <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-500/80 rounded-full animate-float" style={{animationDelay: "1s"}}></div>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Once you've mastered your flashcards, test your knowledge in exam mode and receive personalized AI feedback on your progress.
          </p>
        </div>
      </div>
    </div>
  );
};
