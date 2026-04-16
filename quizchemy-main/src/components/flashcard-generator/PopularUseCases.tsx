import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  GraduationCap,
  BookText,
  Network,
  Bot,
  Brain,
  Lightbulb,
  Zap
} from 'lucide-react';

interface UseCaseProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const UseCase: React.FC<UseCaseProps> = ({ icon, title, description }) => (
  <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
    <div className="w-12 h-12 mx-auto">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </Card>
);

export const PopularUseCases: React.FC = () => {
  const useCases = [
    {
      icon: <img src="/icons/study.svg" alt="" className="w-full h-full" />,
      title: "Study Notes",
      description: "Transform your lecture notes and study materials into interactive flashcards."
    },
    {
      icon: <img src="/icons/content-lecture.svg" alt="" className="w-full h-full" />,
      title: "Course Content",
      description: "Convert textbook chapters and course materials into digestible flashcard sets."
    },
    {
      icon: <img src="/icons/Research.svg" alt="" className="w-full h-full" />,
      title: "Research Material",
      description: "Organize research papers and academic content into structured flashcard sets."
    }
  ];

  return (
    <div className="mt-36">
      <h2 className="text-2xl font-medium mb-8 text-center flex items-center justify-center gap-2">
        Popular Use Cases
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
