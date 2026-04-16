import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Mic,
  FileText,
  PlayCircle
} from 'lucide-react';

interface UseCaseProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const UseCase: React.FC<UseCaseProps> = ({ icon, title, description }) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden p-6">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 text-primary/80">
        {icon}
      </div>
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </Card>
);

export const AudioTranscriptionUseCases: React.FC = () => {
  const useCases = [
    {
      icon: <div className="w-12 h-12 flex items-center justify-center">
              <img src="/icons/mic.svg" alt="" className="w-8 h-8" />
            </div>,
      title: "Live Recording",
      description: "Record and transcribe lectures, meetings, or interviews in real-time."
    },
    {
      icon: <div className="w-12 h-12 flex items-center justify-center">
              <img src="/icons/AudioFiles.svg" alt="" className="w-8 h-8" />
            </div>,
      title: "Audio Files",
      description: "Convert pre-recorded audio files into accurate text transcripts."
    },
    {
      icon: <div className="w-12 h-12 flex items-center justify-center">
              <img src="/icons/Document.svg" alt="" className="w-8 h-8" />
            </div>,
      title: "Quick Notes",
      description: "Transform voice memos into organized text notes instantly."
    }
  ];

  return (
    <div className="mt-52 py-12">
      <h2 className="text-2xl font-semibold mb-8 text-center">Popular Use Cases</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
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
  );
};
