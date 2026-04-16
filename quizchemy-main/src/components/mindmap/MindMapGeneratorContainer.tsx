import React, { useState } from 'react';
import { MindMapUploader } from './MindMapUploader';
import { useNavigate } from 'react-router-dom';
import { trackRecentTool } from '@/utils/recentTools';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecentMindMaps } from '@/hooks/use-recent-mindmaps';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 6;

export const MindMapGeneratorContainer: React.FC = () => {
  const navigate = useNavigate();
  const { mindmaps, loading: mindmapsLoading, refetch: refetchMindmaps } = useRecentMindMaps();
  const [page, setPage] = useState(0);

  const handleDeleteMindmap = async (e: React.MouseEvent, mindmapId: string) => {
    e.stopPropagation();
    await supabase.from('mindmaps').delete().eq('id', mindmapId as any);
    refetchMindmaps();
  };
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="w-full max-w-4xl mx-auto">
        <MindMapUploader
          onMindMapGenerated={(mindmap, mindmapId, shareId, variation) => {
            trackRecentTool('/app/ai-mindmap');
            navigate('/app/mindmap-result', { 
              state: { 
                mindmap,
                mindmap_id: mindmapId,
                share_id: shareId,
                variation: variation || 'variation1'
              } 
            });
          }}
        />
        {/* Recent Mind Maps */}
        {(mindmapsLoading || mindmaps.filter(m => m.share_id && m.share_id !== m.id).length > 0) && (() => {
          const filtered = mindmaps.filter(m => m.share_id && m.share_id !== m.id);
          const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
          const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
          return (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <img src="/icons/mindmap-dashbaord.svg" alt="" className="w-7 h-7" />
                  <h2 className="text-xl font-semibold">My Mind Maps</h2>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="h-8 w-8 rounded-full border flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-muted-foreground px-1">{page + 1} / {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="h-8 w-8 rounded-full border flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {mindmapsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border bg-card animate-pulse">
                      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-3/4 bg-muted rounded" />
                        <div className="h-3 w-1/2 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paged.map((mindmap, index) => {
                    const gradients = [
                      'from-blue-500 to-cyan-500',
                      'from-purple-500 to-pink-500',
                      'from-emerald-500 to-teal-500',
                      'from-orange-500 to-red-500',
                      'from-indigo-500 to-purple-500',
                      'from-green-500 to-blue-500',
                    ];
                    const gradient = gradients[(page * PAGE_SIZE + index) % gradients.length];
                    return (
                      <Card
                        key={mindmap.id}
                        className="cursor-pointer group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 hover:border-primary/50 relative rounded-2xl"
                        onClick={() => {
                          try {
                            const content = typeof mindmap.content === 'string'
                              ? JSON.parse(mindmap.content)
                              : mindmap.content;
                            navigate('/app/mindmap-result', {
                              state: { mindmap: content, mindmap_id: mindmap.id, share_id: mindmap.share_id },
                            });
                          } catch {}
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteMindmap(e, mindmap.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                              <img src="/icons/hierarchical-structure.svg" alt="" className="w-14 h-14" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-primary transition-colors">
                                {mindmap.title}
                              </h3>
                              {mindmap.content_source && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                  {mindmap.content_source.replace(/^(https?:\/\/[^\s]+)$/, 'Web page').replace(/\.[a-z0-9]+$/i, '')}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {mindmap.complexity_level && <span className="capitalize">{mindmap.complexity_level}</span>}
                                {mindmap.complexity_level && <span>•</span>}
                                <span>{new Date(mindmap.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Popular Use Cases */}
        <div className="mt-36">
          <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
          <div className="container max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/lecture.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Study Materials</h3>
                <p className="text-muted-foreground">
                  Transform study content into visual mind maps for better retention.
                </p>
              </Card>
              <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/Research.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Research Papers</h3>
                <p className="text-muted-foreground">
                  Convert complex research into structured visual diagrams.
                </p>
              </Card>
              <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/meeting-notes.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Project Planning</h3>
                <p className="text-muted-foreground">
                  Organize ideas and concepts into clear visual mind maps.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
