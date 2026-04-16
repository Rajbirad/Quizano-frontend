import React from 'react';
import { Card } from '@/components/ui/card';
import {
  GraduationCap,
  ScrollText,
  Receipt,
  Newspaper,
  BookOpen,
  FileText,
  Text,
  ScanLine
} from 'lucide-react';

interface UseCaseProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const UseCase: React.FC<UseCaseProps> = ({ icon, title, description }) => (
  <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
    {icon}
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </Card>
);

export const ImageTranscriptionUseCases: React.FC = () => {
  const useCases = [
    {
      icon: <div className="w-16 h-16 flex items-center justify-center mx-auto">
              <img src="/icons/text-area.svg" alt="" className="w-10 h-10" />
            </div>,
      title: "Text Extraction",
      description: "Extract and analyze text content from any type of image efficiently"
    },
    {
      icon: <div className="w-16 h-16 flex items-center justify-center mx-auto">
              <img src="/icons/Document.svg" alt="" className="w-10 h-10" />
            </div>,
      title: "Document Summary",
      description: "Generate concise, accurate summaries from document images"
    },
    {
      icon: <div className="w-16 h-16 flex items-center justify-center mx-auto">
              <img src="/icons/write.svg" alt="" className="w-10 h-10" />
            </div>,
      title: "Structured Notes",
      description: "Transform image content into well-organized study materials"
    }
  ];

  return (
    <div className="mt-52">
      <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <UseCase
              key={index}
              icon={useCase.icon}
              title={useCase.title}
              description={useCase.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
};
