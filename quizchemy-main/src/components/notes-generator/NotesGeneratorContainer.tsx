import React from 'react';
import { NotesUploader } from './NotesUploader';
import { useNavigate } from 'react-router-dom';
import { trackRecentTool } from '@/utils/recentTools';
import { Card } from '@/components/ui/card';

export const NotesGeneratorContainer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="w-full max-w-5xl mx-auto">
        <NotesUploader
          onNotesGenerated={(notes) => {
            trackRecentTool('/app/notes-generator');
            navigate('/app/notes-result', { state: { notes } });
          }}
        />
        {/* Popular Use Cases */}
        <div className="mt-36">
          <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
          <div className="container max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/lecture.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Lecture Summaries</h3>
                <p className="text-muted-foreground">
                  Transform lecture content into comprehensive, organized study notes.
                </p>
              </Card>
              <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/meeting-notes.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Meeting Notes</h3>
                <p className="text-muted-foreground">
                  Convert meeting discussions into structured, actionable summaries.
                </p>
              </Card>
              <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/Research.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Research Documentation</h3>
                <p className="text-muted-foreground">
                  Organize research findings into clear, structured documentation.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};