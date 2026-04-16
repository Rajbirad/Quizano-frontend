import React, { useState } from 'react';
import { PodcastUploader } from './PodcastUploader';
import { useNavigate } from 'react-router-dom';
import { trackRecentTool } from '@/utils/recentTools';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecentPodcasts } from '@/hooks/use-recent-podcasts';
import { supabase } from '@/integrations/supabase/client';
import { CreditsInfo } from '@/utils/credits';

const PAGE_SIZE = 6;

interface PodcastGeneratorContainerProps {
  onCreditsUpdated?: (credits: CreditsInfo) => void;
}

export const PodcastGeneratorContainer: React.FC<PodcastGeneratorContainerProps> = ({ onCreditsUpdated }) => {
  const navigate = useNavigate();
  const { podcasts, loading: podcastsLoading, refetch: refetchPodcasts } = useRecentPodcasts();
  const [page, setPage] = useState(0);

  const handleDeletePodcast = async (e: React.MouseEvent, podcastId: string) => {
    e.stopPropagation();
    await supabase.from('podcasts').delete().eq('id', podcastId as any);
    refetchPodcasts();
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="w-full max-w-5xl mx-auto">
        <PodcastUploader
          onPodcastGenerated={(podcast) => {
            // Notify parent of credits update if available
            if (podcast?.credits && onCreditsUpdated) {
              onCreditsUpdated(podcast.credits);
            }
            trackRecentTool('/app/ai-podcast');
            navigate('/app/podcast-result', { state: { podcast } });
          }}
        />
        {/* My Podcasts with pagination */}
        {(podcastsLoading || podcasts.length > 0) && (() => {
          const totalPages = Math.ceil(podcasts.length / PAGE_SIZE);
          const paged = podcasts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
          return (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <img src="/icons/podcast-dashbaord.svg" alt="" className="w-7 h-7" />
                  <h2 className="text-xl font-semibold">My Podcasts</h2>
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
              {podcastsLoading ? (
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
                  {paged.map((podcast) => (
                    <Card
                      key={podcast.id}
                      className="cursor-pointer group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 hover:border-primary/50 relative rounded-2xl"
                      onClick={() => navigate(`/app/podcast/${podcast.id}`)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => handleDeletePodcast(e, podcast.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {podcast.cover_image_url ? (
                            <img
                              src={podcast.cover_image_url}
                              alt={podcast.title}
                              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                              <img src="/icons/Audio.svg" alt="" className="w-14 h-14" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-primary transition-colors">
                              {podcast.title}
                            </h3>
                            {podcast.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{podcast.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {podcast.estimated_duration_minutes && <span>{podcast.estimated_duration_minutes} min</span>}
                              {podcast.language_name && <><span>•</span><span>{podcast.language_name}</span></>}
                              <span>•</span>
                              <span>{new Date(podcast.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                <h3 className="text-lg font-medium">Educational Content</h3>
                <p className="text-muted-foreground">
                  Transform educational materials into engaging podcast episodes.
                </p>
              </Card>
              <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/meeting-notes.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">Blog to Podcast</h3>
                <p className="text-muted-foreground">
                  Convert blog posts and articles into audio podcast format.
                </p>
              </Card>
              <Card className="glass-panel p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <div className="w-12 h-12 mx-auto">
                  <img src="/icons/Research.svg" alt="" className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium">News Summary</h3>
                <p className="text-muted-foreground">
                  Turn news articles and reports into concise audio summaries.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
