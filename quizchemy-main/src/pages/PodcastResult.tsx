import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mic, Download, Play, Pause, ArrowLeft, Save, Sparkles, Edit2, X, Trash2, Plus, User, ChevronDown, ChevronUp, Share2, SkipBack, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PodcastResponse, DialogueSegment, Exchange } from '@/types/podcast';
import { makeAuthenticatedRequest } from '@/lib/api-utils';

const PodcastResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [podcast, setPodcast] = useState<PodcastResponse | undefined>(() => {
    const receivedPodcast = location.state?.podcast;
    console.log('PodcastResult received podcast data:', receivedPodcast);
    return receivedPodcast;
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const [dialogues, setDialogues] = useState<DialogueSegment[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioRef] = useState(new Audio());
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState(podcast?.title || 'AI Generated Podcast');
  const [description, setDescription] = useState(podcast?.description || '');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section expanded by default
  const [mainAudioPlaying, setMainAudioPlaying] = useState(false);
  const [mainAudioRef] = useState(new Audio());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch podcast by ID if accessed via shareable URL
  useEffect(() => {
    const fetchPodcast = async () => {
      if (id && !podcast) {
        setIsLoading(true);
        try {
          const response = await makeAuthenticatedRequest(`/api/podcast/${id}`, {
            method: 'GET',
          });
          if (!response.ok) {
            throw new Error('Podcast not found');
          }
          const data = await response.json();
          setPodcast(data);
        } catch (error) {
          console.error('Error fetching podcast:', error);
          toast({
            title: 'Error',
            description: 'Unable to load podcast. Please try again.',
            variant: 'destructive',
          });
          navigate('/app/ai-podcast');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchPodcast();
  }, [id, podcast, navigate, toast]);

  useEffect(() => {
    // Only redirect if we don't have a podcast and we're not loading from URL
    if (!podcast && !id && !isLoading) {
      navigate('/app/ai-podcast');
      return;
    }

    // Handle new sections structure or legacy dialogue structure
    if (podcast && podcast.sections && podcast.sections.length > 0) {
      // Convert sections to flat dialogue list for compatibility
      const flatDialogues: DialogueSegment[] = [];
      podcast.sections.forEach(section => {
        (section.turns || section.exchanges || []).forEach(exchange => {
          flatDialogues.push({
            host: exchange.speaker,
            role: exchange.role,
            text: exchange.text,
            voice_id: exchange.role.toLowerCase(),
            audio_url: exchange.audio_url,
            duration_seconds: 0,
            audio_format: exchange.audio_format,
            audio_size_bytes: exchange.audio_size_bytes,
          });
        });
      });
      setDialogues(flatDialogues);
    } else if (podcast && podcast.dialogue && podcast.dialogue.length > 0) {
      setDialogues(podcast.dialogue);
    } else if (podcast) {
      const numHosts = podcast.num_hosts || 1;
      const initialDialogues = generateInitialDialogues(numHosts);
      setDialogues(initialDialogues);
    }
  }, [podcast, navigate, id, isLoading]);

  // Update title and description when podcast changes
  useEffect(() => {
    if (podcast) {
      setTitle(podcast.title || 'AI Generated Podcast');
      setDescription(podcast.description || '');
    }
  }, [podcast]);

  useEffect(() => {
    // Setup main audio player
    if (podcast?.full_audio_url) {
      mainAudioRef.src = podcast.full_audio_url;
      mainAudioRef.addEventListener('loadedmetadata', () => {
        setDuration(mainAudioRef.duration);
      });
      mainAudioRef.addEventListener('timeupdate', () => {
        setCurrentTime(mainAudioRef.currentTime);
      });
      mainAudioRef.addEventListener('ended', () => {
        setMainAudioPlaying(false);
      });
    }
    
    // Cleanup audio on unmount
    return () => {
      audioRef.pause();
      audioRef.src = '';
      mainAudioRef.pause();
      mainAudioRef.src = '';
    };
  }, [audioRef, mainAudioRef, podcast]);

  const handlePlaySegment = async (index: number, audioUrl: string) => {
    if (!audioUrl) {
      toast({
        title: 'Audio not available',
        description: 'This segment does not have audio yet.',
        variant: 'destructive',
      });
      return;
    }

    if (playingIndex === index) {
      audioRef.pause();
      setPlayingIndex(null);
    } else {
      try {
        audioRef.pause();
        audioRef.src = '';
        
        console.log('Playing audio from:', audioUrl);
        
        // Use S3 presigned URL directly (backend has fixed signatures)
        audioRef.src = audioUrl;
        audioRef.load();
        
        setPlayingIndex(index);
        await audioRef.play();
        
        audioRef.onended = () => {
          setPlayingIndex(null);
        };
        
        audioRef.onerror = (e) => {
          console.error('Audio playback error:', e);
          console.error('Failed URL:', audioUrl);
          toast({
            title: 'Playback error',
            description: 'Unable to play audio. Check S3 CORS configuration.',
            variant: 'destructive',
          });
          setPlayingIndex(null);
        };
      } catch (error) {
        console.error('Error playing audio:', error);
        toast({
          title: 'Playback failed',
          description: error instanceof Error ? error.message : 'Could not play audio.',
          variant: 'destructive',
        });
        setPlayingIndex(null);
      }
    }
  };

  const generateInitialDialogues = (numHosts: number): DialogueSegment[] => {
    // Generate sample podcast script with alternating hosts
    const sampleDialogues: DialogueSegment[] = [];
    const voices = ['alloy', 'echo', 'fable'];
    
    if (numHosts === 1) {
      sampleDialogues.push(
        { host: voices[0], text: "Welcome to today's podcast! I'm excited to dive into this topic with you.", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[0], text: "Let's start by exploring the main concepts and ideas that make this subject so fascinating.", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[0], text: "As we continue, I'll share some interesting insights and perspectives on this matter.", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[0], text: "To wrap up, let's summarize the key takeaways from our discussion today.", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' }
      );
    } else if (numHosts === 2) {
      sampleDialogues.push(
        { host: voices[0], text: "Welcome everyone! Today we have an amazing topic to discuss.", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[1], text: "That's right! I'm really excited to dive into this with you today.", voice_id: 'echo', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[0], text: "Let's start with the basics. Can you tell us what makes this topic so important?", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[1], text: "Absolutely! The key thing to understand is how it impacts our daily lives.", voice_id: 'echo', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[0], text: "That's a great point. And there's so much more to explore here.", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[1], text: "Indeed! Let me share some interesting facts and perspectives on this.", voice_id: 'echo', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[0], text: "Fascinating insights! What would you say is the most surprising aspect?", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[1], text: "I'd say the most surprising part is how interconnected everything is.", voice_id: 'echo', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[0], text: "Well said! Let's wrap up with some final thoughts.", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[1], text: "Thanks for tuning in everyone! We hope you enjoyed this discussion.", voice_id: 'echo', audio_url: '', duration_seconds: 0, audio_format: 'mp3' }
      );
    } else {
      sampleDialogues.push(
        { host: voices[0], text: "Welcome to the show! We have an exciting discussion lined up today.", voice_id: 'alloy', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[1], text: "Thanks for having us! I can't wait to get into the details.", voice_id: 'echo', audio_url: '', duration_seconds: 0, audio_format: 'mp3' },
        { host: voices[2], text: "Me too! This is going to be a great conversation.", voice_id: 'fable', audio_url: '', duration_seconds: 0, audio_format: 'mp3' }
      );
    }
    
    return sampleDialogues;
  };

  const handleDialogueChange = (index: number, newText: string) => {
    const updatedDialogues = [...dialogues];
    updatedDialogues[index].text = newText;
    setDialogues(updatedDialogues);
  };

  const handleAddDialogue = (afterIndex: number) => {
    const newDialogues = [...dialogues];
    const currentHost = dialogues[afterIndex].host;
    const numHosts = podcast?.num_hosts || 1;
    
    // If host is a string (voice name), rotate to next voice
    if (typeof currentHost === 'string') {
      const voices = ['alloy', 'echo', 'fable'];
      const currentIndex = voices.indexOf(currentHost);
      const nextVoice = voices[(currentIndex + 1) % Math.min(numHosts, voices.length)];
      
      newDialogues.splice(afterIndex + 1, 0, {
        host: nextVoice,
        text: '',
        voice_id: nextVoice,
        audio_url: '',
        duration_seconds: 0,
        audio_format: 'mp3'
      });
    } else {
      // Fallback for old number-based format
      const nextHost = currentHost >= numHosts ? 1 : currentHost + 1;
      const nextHostVoiceId = podcast?.hosts?.find(h => h.host_number === nextHost)?.voice_id || 'alloy';
      
      newDialogues.splice(afterIndex + 1, 0, {
        host: nextHost,
        text: '',
        voice_id: nextHostVoiceId,
        audio_url: '',
        duration_seconds: 0,
        audio_format: 'mp3'
      });
    }
    
    setDialogues(newDialogues);
  };

  const handleRemoveDialogue = (index: number) => {
    if (dialogues.length > 1) {
      const newDialogues = dialogues.filter((_, i) => i !== index);
      setDialogues(newDialogues);
    }
  };

  const handleGenerateAudio = async () => {
    // Check if podcast has audio ready (either full_audio_url or individual segment URLs)
    const hasFullAudio = podcast?.full_audio_url;
    const hasDialogueAudio = podcast?.dialogue?.length > 0 && podcast.dialogue.some(d => d.audio_url);
    const hasSectionsAudio = podcast?.sections?.length > 0 && 
      podcast.sections.some(s => (s.turns || s.exchanges || []).some(e => e.audio_url));
    
    if (hasFullAudio || hasDialogueAudio || hasSectionsAudio) {
      handleDownloadPodcast();
      return;
    }
    
    // Otherwise, show generation message
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success!',
        description: 'Your podcast audio is being generated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate audio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPodcast = async () => {
    try {
      // Use full_audio_url if available from API response
      if (podcast?.full_audio_url) {
        toast({
          title: 'Starting download...',
          description: 'Downloading your full podcast.',
        });

        // Fetch the file as a blob to force download
        const response = await fetch(podcast.full_audio_url);
        if (!response.ok) {
          throw new Error('Failed to fetch audio file');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${podcast?.title?.replace(/[^a-z0-9]/gi, '_') || 'podcast'}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      // Fallback: Call backend API if full_audio_url not present
      if (!podcast?.id) {
        toast({
          title: 'Error',
          description: 'Podcast ID not found.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Preparing download...',
        description: 'Requesting merged podcast file from server.',
      });

      const response = await fetch(`/api/podcast/download/${podcast.id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${podcast?.title?.replace(/[^a-z0-9]/gi, '_') || 'podcast'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download complete',
        description: 'Your full podcast has been downloaded.',
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download podcast. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      // Create shareable URL for the podcast result page
      // Use the podcast ID to create a shareable link
      const baseUrl = window.location.origin;
      const shareUrl = podcast?.id 
        ? `${baseUrl}/app/podcast/${podcast.id}`
        : window.location.href;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        description: 'Link copied successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Share error:', error);
      toast({
        description: 'Unable to copy link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getHostName = (host: string | number, role?: string) => {
    // If host is a string (voice name like "alloy", "echo"), capitalize and display it
    if (typeof host === 'string') {
      return host.charAt(0).toUpperCase() + host.slice(1);
    }
    
    // Fallback for old number-based format
    const hostInfo = podcast?.hosts?.find(h => h.host_number === host);
    if (hostInfo) {
      return `Host ${host} (${hostInfo.role})`;
    }
    
    return `Host ${host}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-muted-foreground">Loading podcast...</p>
        </div>
      </div>
    );
  }

  if (!podcast) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header Section with Cover Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left: Cover Image Card */}
        <div className="lg:col-span-1">
          <Card className="relative h-[400px] overflow-hidden">
            {podcast?.cover_image || podcast?.cover_image_url ? (
              <>
                <img 
                  src={podcast.cover_image || podcast.cover_image_url} 
                  alt={podcast.title || 'Podcast cover'}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center">
                <Mic className="w-32 h-32 text-white/30" />
              </div>
            )}
          </Card>
        </div>

        {/* Right: Podcast Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {editingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                    className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 outline-none flex-1"
                    autoFocus
                  />
                ) : (
                  <h1 className="text-3xl font-bold">{title}</h1>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {editingDescription ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setEditingDescription(false)}
                  className="text-base text-muted-foreground leading-relaxed flex-1 min-h-[80px]"
                  autoFocus
                />
              ) : (
                <p className="text-base text-muted-foreground leading-relaxed flex-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="py-4">
            
            {/* Audio Player Controls */}
            {podcast?.full_audio_url && (
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4">
                  {/* Skip Back 15s */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => {
                      mainAudioRef.currentTime = Math.max(0, mainAudioRef.currentTime - 15);
                    }}
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  
                  {/* Play/Pause */}
                  <Button
                    variant="default"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      if (mainAudioPlaying) {
                        mainAudioRef.pause();
                        setMainAudioPlaying(false);
                      } else {
                        mainAudioRef.play();
                        setMainAudioPlaying(true);
                      }
                    }}
                  >
                    {mainAudioPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  
                  {/* Skip Forward 15s */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => {
                      mainAudioRef.currentTime = Math.min(duration, mainAudioRef.currentTime + 15);
                    }}
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  
                  {/* Time Display */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={(e) => {
                          const newTime = parseFloat(e.target.value);
                          mainAudioRef.currentTime = newTime;
                          setCurrentTime(newTime);
                        }}
                        className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Share and Download Buttons */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                variant="outline"
                size="default"
                onClick={handleShare}
                className="flex-1 max-w-[160px] rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleDownloadPodcast}
                disabled={isGenerating}
                size="default"
                className="flex-1 max-w-[160px] rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => navigate('/app/ai-podcast')}
                className="flex-1 max-w-[160px] rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Podcast
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this podcast?')) {
                    navigate('/app/ai-podcast');
                  }
                }}
                className="rounded-xl px-3 text-destructive border-destructive/40 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Language: <span className="font-medium text-foreground">{podcast.language_name || podcast.language || 'English'}</span>
            </span>
            <span className="text-muted-foreground">
              Hosts: <span className="font-medium text-foreground">{podcast.num_hosts || '1'}</span>
            </span>
            {podcast.metadata?.estimated_duration_minutes && (
              <span className="text-muted-foreground">
                Duration: <span className="font-medium text-foreground">{podcast.metadata.estimated_duration_minutes.toFixed(1)} min</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Script Editor - Sections View */}
      {podcast.sections && podcast.sections.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Podcast Script</h2>
          <div className="space-y-4">
            {podcast.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <div
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    const newExpanded = new Set(expandedSections);
                    if (newExpanded.has(sectionIndex)) {
                      newExpanded.delete(sectionIndex);
                    } else {
                      newExpanded.add(sectionIndex);
                    }
                    setExpandedSections(newExpanded);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                      {section.timestamp}
                    </div>
                    <h3 className="font-medium text-base">{section.title}</h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {expandedSections.has(sectionIndex) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {expandedSections.has(sectionIndex) && (
                  <div className="pl-4 space-y-4">
                    {(section.turns || section.exchanges || []).map((exchange, exchangeIndex) => {
                      const globalIndex = podcast.sections!
                        .slice(0, sectionIndex)
                        .reduce((sum, s) => sum + (s.turns || s.exchanges || []).length, 0) + exchangeIndex;
                      
                      return (
                        <div key={exchangeIndex} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-muted rounded-full p-2">
                                <User className="h-4 w-4" />
                              </div>
                              <Label className="text-base font-semibold">
                                {exchange.speaker}
                              </Label>
                              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                                {exchange.role}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {exchange.audio_url && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handlePlaySegment(globalIndex, exchange.audio_url)}
                                  className="h-8 w-8"
                                  title={playingIndex === globalIndex ? "Pause" : "Play segment"}
                                >
                                  {playingIndex === globalIndex ? (
                                    <X className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="text-base text-muted-foreground leading-relaxed pl-10">
                            {exchange.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Legacy Script Editor */
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Podcast Script</h2>
          <div className="space-y-6">
          {(dialogues || []).map((dialogue, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-muted rounded-full p-2">
                    <User className="h-4 w-4" />
                    </div>
                    <Label className="text-base font-semibold">
                      {getHostName(dialogue.host, dialogue.role)}
                    </Label>
                    {dialogue.duration_seconds > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({dialogue.duration_seconds.toFixed(1)}s)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {dialogue.audio_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlaySegment(index, dialogue.audio_url)}
                        className="h-8 w-8"
                        title={playingIndex === index ? "Pause" : "Play segment"}
                      >
                        {playingIndex === index ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddDialogue(index)}
                      className="h-8 w-8"
                      title="Add line after this"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      className="h-8 w-8"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {dialogues.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDialogue(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {editingIndex === index ? (
                  <Textarea
                    value={dialogue.text}
                    onChange={(e) => handleDialogueChange(index, e.target.value)}
                    className="min-h-[100px] resize-none"
                    placeholder={`Enter dialogue for ${getHostName(dialogue.host)}...`}
                    autoFocus
                  />
                ) : (
                  <div className="text-base text-muted-foreground leading-relaxed pl-10">
                    {dialogue.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastResult;
