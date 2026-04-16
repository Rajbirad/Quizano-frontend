import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotesGeneratorContainer } from '@/components/notes-generator/NotesGeneratorContainer';
import { RecentNotesHistory } from '@/components/notes-generator/RecentNotesHistory';
import { NotebookPen, Sparkles } from 'lucide-react';
import { CreditsButton } from '@/components/CreditsButton';
import { useCredits } from '@/contexts/CreditsContext';

const AiNotesGenerator = () => {
  const { credits: creditsData, loading } = useCredits();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const notesCredits =
    (creditsData as any)?.notes ||
    (creditsData as any)?.ai_notes ||
    (creditsData as any)?.notes_generator ||
    null;

  const handleSelectNote = (noteData: any) => {
    navigate('/app/notes-result', { state: { notes: noteData } });
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 bg-background flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-60 border-r border-border/60' : 'w-0'
        }`}
      >
        <div className="flex items-center justify-end px-4 py-3 min-w-[15rem]">
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 w-7 h-7 flex items-center justify-center border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer"
            title="Close"
          >
            <img src="/icons/sidebar.svg" alt="Close sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
          </button>
        </div>
        <div className="px-4 py-2 min-w-[15rem]">
          <p className="text-xs text-muted-foreground font-medium">Recent Notes</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 min-w-[15rem] thin-scrollbar">
          <RecentNotesHistory onSelectNote={handleSelectNote} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto thin-scrollbar relative">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-50 flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border bg-background shadow-sm hover:bg-muted transition-colors cursor-pointer"
            title="Recent notes"
          >
            <img src="/icons/side-menu.svg" alt="Open sidebar" className="h-4 w-4" style={{ pointerEvents: 'none' }} />
          </button>
        )}
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="relative mb-10">
            <div className="flex flex-col items-center text-center mb-6 relative z-10">
              <div className="flex items-center justify-between w-full max-w-7xl mb-2">
                <div className="flex-1" />
                <div className="flex items-center gap-3">
                  <NotebookPen className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl md:text-3xl font-bold gradient-text">Notes Generator</h1>
                  <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
                </div>
                <div className="flex-1 flex justify-end">
                  <CreditsButton
                    balance={notesCredits?.balance}
                    isLoading={loading}
                    isUnlimited={notesCredits?.unlimited}
                  />
                </div>
              </div>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Transform any content into comprehensive, structured notes. Upload files, videos, paste text, or use YouTube links to generate AI-powered notes.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-primary/20 rotate-12">
                <NotebookPen className="h-10 w-10" />
              </div>
            </div>
            <div className="absolute top-10 right-1/4 transform translate-x-1/2 -translate-y-1/2">
              <div className="text-accent/30 -rotate-12">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
          </div>

          <NotesGeneratorContainer />
        </div>
      </div>
    </div>
  );
};

export default AiNotesGenerator;