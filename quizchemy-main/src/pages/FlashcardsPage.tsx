import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CreateFlashcardIcon } from '@/components/icons/CreateFlashcardIcon';
import noteIcon from '/icons/note.svg?raw';
import flashaiIcon from '/icons/flashai.svg?raw';
const FlashcardsPage: React.FC = () => {
  const navigate = useNavigate();
  const inputMethods = [{
    id: 'create',
    title: 'Start from Scratch',
    description: 'Create custom flashcards manually with your own content.',
    icon: CreateFlashcardIcon,
    route: '/app/create',
    badge: 'Manual',
    gradient: "from-blue-500 to-cyan-500"
  }, {
    id: 'generate',
    title: 'Let AI Help You',
    description: 'Transform any content into flashcards automatically.',
    route: '/app/generator',
    badge: 'Popular',
    gradient: "from-emerald-500 to-green-500"
  }];
  const handleMethodSelect = (route: string) => {
    navigate(route);
  };
  return (
    <div className="container max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-20">
        <h1 className="mb-4 text-slate-700 text-3xl font-normal">
          Create Your Flashcards
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose your preferred method to create effective flashcards for better learning and retention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
        {inputMethods.map(method => (
          <Card 
            key={method.id} 
            className="group relative overflow-hidden border-2 border-transparent hover:border-primary/30 cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => handleMethodSelect(method.route)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${method.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <CardContent className="relative p-3">
              <div className="flex items-start gap-4">
                {method.id === 'create' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: noteIcon }} />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: flashaiIcon }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {method.title}
                    </h3>
                    {method.badge && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                        {method.badge}
                      </span>}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FlashcardsPage;