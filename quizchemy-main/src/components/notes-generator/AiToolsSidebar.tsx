
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Type, 
  SquareArrowUpRight, 
  Pencil, 
  Palette,
  Languages,
  ThumbsUp,
  BookOpen,
  Lightbulb,
  BookOpenCheck,
  ArrowRight
} from 'lucide-react';
import AIToolsIcon from '/icons/AITools.svg';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

interface AiToolsSidebarProps {
  onToolSelect: (tool: string) => void;
}

export const AiToolsSidebar: React.FC<AiToolsSidebarProps> = ({ onToolSelect }) => {
  const aiTools = {
    writing: [
      { id: 'extend', label: 'Extend', icon: SquareArrowUpRight, description: 'Add more details' },
      { id: 'shorten', label: 'Shorten', icon: Type, description: 'Make text more concise' },
      { id: 'rephrase', label: 'Rephrase', icon: Wand2, description: 'Rewrite selection' },
      { id: 'spelling', label: 'Fix Spelling', icon: Pencil, description: 'Correct spelling and grammar' },
    ],
    style: [
      { id: 'thesaurus', label: 'Thesaurus', icon: BookOpen, description: 'Find better words' },
      { id: 'translate', label: 'Translate', icon: Languages, description: 'Translate text' },
      { id: 'tone', label: 'Change Tone', icon: ThumbsUp, description: 'Adjust writing tone' },
      { id: 'style', label: 'Change Style', icon: Palette, description: 'Adjust writing style' },
    ],
    thinking: [
      { id: 'explain', label: 'Explain', icon: Lightbulb, description: 'Explain this concept' },
      { id: 'summarize', label: 'Summarize', icon: Sparkles, description: 'Create a summary' },
      { id: 'brainstorm', label: 'Brainstorm', icon: BookOpenCheck, description: 'Generate ideas' },
    ],
  };

  return (
    <div className="w-64 flex-shrink-0 border-l bg-muted/30 p-4 overflow-y-auto">
      <div className="space-y-2 mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <img src={AIToolsIcon} alt="AI Tools" className="mr-2 h-5 w-5" />
          AI Tools
        </h2>
        <p className="text-sm text-muted-foreground">
          Select text and choose a tool to apply AI enhancements
        </p>
      </div>

      <Separator className="my-4" />

      <Accordion type="multiple" defaultValue={["writing", "style", "thinking"]} className="space-y-2">
        <AccordionItem value="writing" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Writing
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="grid grid-cols-1 gap-1.5">
              {aiTools.writing.map((tool) => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  className="justify-start h-auto py-2"
                  onClick={() => onToolSelect(tool.id)}
                >
                  <tool.icon className="h-4 w-4 mr-2 text-primary" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm">{tool.label}</span>
                    <span className="text-xs text-muted-foreground">{tool.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Style
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="grid grid-cols-1 gap-1.5">
              {aiTools.style.map((tool) => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  className="justify-start h-auto py-2"
                  onClick={() => onToolSelect(tool.id)}
                >
                  <tool.icon className="h-4 w-4 mr-2 text-primary" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm">{tool.label}</span>
                    <span className="text-xs text-muted-foreground">{tool.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="thinking" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Thinking
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="grid grid-cols-1 gap-1.5">
              {aiTools.thinking.map((tool) => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  className="justify-start h-auto py-2"
                  onClick={() => onToolSelect(tool.id)}
                >
                  <tool.icon className="h-4 w-4 mr-2 text-primary" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm">{tool.label}</span>
                    <span className="text-xs text-muted-foreground">{tool.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 space-y-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => onToolSelect('continue')}>
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          <span>Continue writing</span>
          <ArrowRight className="ml-auto h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
