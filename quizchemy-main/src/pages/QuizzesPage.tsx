import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, FileUp, Link, Video, Youtube, Image, BookOpen, Copy, FilePlus, Edit, Mic } from 'lucide-react';
import txtFileIcon from '/icons/txt-file.svg?raw';
import pdfIcon from '/icons/pdf.svg?raw';
import videoIcon from '/icons/clapperboard.svg?raw';
import youtubeIcon from '/icons/YouTube.svg?raw';
import hyperlinkIcon from '/icons/hyperlink.svg?raw';
import imageIcon from '/icons/Image.svg?raw';
import similarIcon from '/icons/similar.svg?raw';
import questionIcon from '/icons/question.svg?raw';
import downloadFolderIcon from '/icons/download-folder.svg?raw';
import manualIcon from '/icons/manual.svg?raw';
import quizletIcon from '/icons/quizleti.svg?raw';
import ankiIcon from '/icons/anki.svg?raw';
import audioIcon from '/icons/music-player.svg?raw';
import newsIcon from '/icons/global-news.svg?raw';

// Custom component for download folder icon
const DownloadFolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: downloadFolderIcon }} />
);

// Custom component for manual icon
const ManualIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: manualIcon }} />
);

const QuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const inputMethods = [{
    id: 'manual',
    title: 'Manual',
    description: 'Manually Create Quiz Questions.',
    icon: ManualIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  },{
    id: 'text',
    title: 'Text',
    description: 'Turn your text into questions.',
    icon: FilePlus,
    gradient: "from-blue-500 to-cyan-500"
  }, {
    id: 'upload',
    title: 'Upload',
    description: 'Extract questions from documents.',
    icon: FileUp,
    gradient: "from-emerald-500 to-green-500",
    badge: 'Popular'
  }, {
    id: 'video',
    title: 'Video',
    description: 'Make questions from video content.',
    icon: '/icons/clapperboard.svg',
    gradient: "from-red-500 to-pink-500"
  }, {
    id: 'youtube',
    title: 'YouTube',
    description: 'Pull questions directly from YouTube.',
    icon: Youtube,
    gradient: "from-rose-500 to-red-500"
  }, {
    id: 'url',
    title: 'URL',
    description: 'Create questions from articles.',
    icon: Link,
    gradient: "from-purple-500 to-violet-500"
  }, {
    id: 'news',
    title: 'News',
    description: 'Generate quiz from news articles.',
    gradient: "from-sky-500 to-blue-500"
  }, {
    id: 'image',
    title: 'Image',
    description: 'Create questions from images.',
    icon: Image,
    gradient: "from-orange-500 to-amber-500"
  }, {
    id: 'audio',
    title: 'Audio',
    description: 'Generate quiz from audio recordings.',
    icon: Mic,
    gradient: "from-pink-500 to-purple-500"
  }, {
    id: 'similar',
    title: 'Similar Question',
    description: 'Get variations of existing questions.',
    icon: Copy,
    gradient: "from-teal-500 to-cyan-500"
  }, {
    id: 'subject',
    title: 'Subject',
    description: 'Choose a topic to auto-build a quiz.',
    icon: BookOpen,
    gradient: "from-indigo-500 to-blue-500"
  },{
    id: 'import',
    title: 'Import Questions',
    description: 'Upload a file with existing questions.',
    icon: DownloadFolderIcon,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100'
  }, {
    id: 'quizlet',
    title: 'Quizlet',
    description: 'convert Quizlet sets to quizzes.',
    gradient: "from-blue-600 to-purple-600"
  }, {
    id: 'anki',
    title: 'Anki',
    description: 'convert Anki decks to quizzes.',
    gradient: "from-green-600 to-emerald-600"
  }];
  const handleMethodSelect = (route: string) => {
    navigate(`/quiz/${route}`);
  };
  return (
    <div className="container max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="mb-4 font-normal text-slate-700 text-3xl">
          Create Your Quiz
        </h1>
        <p className="text-lg text-muted-foreground">
          Pick your preferred method to get started with quiz creation:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {inputMethods.map(method => (
          <Card 
            key={method.id} 
            className="group relative overflow-hidden border-2 border-transparent hover:border-primary/30 cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${method.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <CardContent className="relative p-3">
              <div className="flex items-start gap-4">
                {method.id === 'manual' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: manualIcon }} />
                  </div>
                ) : method.id === 'text' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: txtFileIcon }} />
                  </div>
                ) : method.id === 'upload' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: pdfIcon }} />
                  </div>
                ) : method.id === 'video' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: videoIcon }} />
                  </div>
                ) : method.id === 'youtube' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: youtubeIcon }} />
                  </div>
                ) : method.id === 'url' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: hyperlinkIcon }} />
                  </div>
                ) : method.id === 'image' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: imageIcon }} />
                  </div>
                ) : method.id === 'audio' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: audioIcon }} />
                  </div>
                ) : method.id === 'similar' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: similarIcon }} />
                  </div>
                ): method.id === 'subject' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: questionIcon }} />
                  </div>
                ): method.id === 'import' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: downloadFolderIcon }} />
                  </div>
                ): method.id === 'quizlet' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: quizletIcon }} />
                  </div>
                ): method.id === 'anki' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: ankiIcon }} />
                  </div>
                ): method.id === 'news' ? (
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: newsIcon }} />
                  </div>
                ): (
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.gradient} p-0.5 group-hover:scale-105 transition-transform duration-200`}>
                    <div className="w-full h-full bg-card rounded-xl flex items-center justify-center">
                      <method.icon className="h-6 w-6 text-foreground" />
                    </div>
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

export default QuizzesPage;