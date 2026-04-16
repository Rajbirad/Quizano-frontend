import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, Globe, Link, Loader2, Sparkles, Upload, Volume2, VolumeX, Play, Pause, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { VoiceSelector } from '@/components/podcast-generator/VoiceSelector';
import { 
  generateTTSWithPolling, 
  validateTTSText, 
  validateTTSFile, 
  validateTTSUrl,
  type TTSResponse 
} from '@/lib/tts-api';
import { RecentTTSItems } from '@/components/tts/RecentTTSItems';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

type AudioPlayerProps = {
  src: string;
  playOnLoad?: boolean;
};

const AudioPlayer = React.forwardRef<HTMLAudioElement, AudioPlayerProps>(({ src, playOnLoad }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(2); // 1x

  React.useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement, []);

  React.useEffect(() => {
    if (playOnLoad && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    // eslint-disable-next-line
  }, [src, playOnLoad]);

  const fmt = (s: number) => {
    if (!isFinite(s)) return '00:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) { audioRef.current.volume = v; audioRef.current.muted = v === 0; }
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    setMuted(next);
    audioRef.current.muted = next;
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  return (
    <div className="mt-8 flex flex-col gap-3">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
      />
      {/* Player row */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/50 border border-border/50">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-500/80 flex items-center justify-center hover:bg-slate-500 transition-colors shadow-sm"
        >
          {playing
            ? <Pause className="h-4 w-4 text-white" />
            : <Play className="h-4 w-4 text-white ml-0.5" />}
        </button>

        {/* Current time */}
        <span className="text-xs tabular-nums text-muted-foreground w-10 flex-shrink-0">{fmt(currentTime)}</span>

        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 cursor-pointer"
          style={{ accentColor: '#64748b' }}
        />

        {/* Duration */}
        <span className="text-xs tabular-nums text-muted-foreground w-10 flex-shrink-0 text-right">{fmt(duration)}</span>

        {/* Volume toggle */}
        <button onClick={toggleMute} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Volume slider */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={handleVolume}
          className="w-16 h-1.5 cursor-pointer"
          style={{ accentColor: '#64748b' }}
        />

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          className="flex-shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground w-8 text-right transition-colors"
          title="Playback speed"
        >
          {SPEEDS[speedIdx]}x
        </button>
      </div>

      {/* Download */}
      <button
        onClick={async () => {
          try {
            const res = await fetch(src);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tts-audio.mp3';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch {
            // fallback: open in new tab
            window.open(src, '_blank');
          }
        }}
        className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
      >
        <Download className="h-4 w-4" />
        Download
      </button>

    </div>
  );
});

const TextToSpeechPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref for controlling AudioPlayer
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'link'>('text');
  const [textInput, setTextInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [webLink, setWebLink] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [generating, setGenerating] = useState(false);
  const [displayError, setDisplayError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<TTSResponse | null>(null);
  const [ttsRefreshTrigger, setTtsRefreshTrigger] = useState(0);

  const validateInput = (): boolean => {
    let error: string | null = null;

    if (activeTab === 'text') {
      error = validateTTSText(textInput);
    } else if (activeTab === 'file') {
      if (!uploadedFile) {
        error = 'Please upload a file to convert into speech';
      } else {
        error = validateTTSFile(uploadedFile);
      }
    } else if (activeTab === 'link') {
      error = validateTTSUrl(webLink);
    }

    if (error) {
      setDisplayError(error);
      setShowNotification(true);
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to generate speech.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateInput()) return;

    setGenerating(true);
    setDisplayError('');
    setShowNotification(false);
    setGeneratedAudio(null);

    try {
      const result = await generateTTSWithPolling({
        text: activeTab === 'text' ? textInput : undefined,
        file: activeTab === 'file' ? uploadedFile || undefined : undefined,
        url: activeTab === 'link' ? webLink : undefined,
        voice: selectedVoice,
      });

      setGeneratedAudio(result);
      setTtsRefreshTrigger(t => t + 1);
      toast({
        title: 'Success!',
        description: 'Your audio has been generated successfully.',
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to generate speech. Please try again.';
      setDisplayError(errorMessage);
      setShowNotification(true);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const allowedExtensions = ['.pdf', '.txt', '.docx', '.doc'];

    if (!validTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setDisplayError('Please upload a PDF, TXT, DOC, or DOCX file');
      setShowNotification(true);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setDisplayError('File size must be less than 10MB');
      setShowNotification(true);
      return;
    }

    setUploadedFile(file);
    setDisplayError('');
    setShowNotification(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  // Ref for controlling AudioPlayer
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="px-6 py-4">
      {showNotification && displayError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{displayError}</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-center w-full mb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600">
              Text to Speech
            </span>
          </h1>
          <Volume2 className="h-7 w-7 text-primary" />
        </div>
      </div>

      <p className="text-base text-muted-foreground text-center max-w-3xl mx-auto mb-6">
        Convert your text, documents, or web content into natural AI voice.
      </p>

      <div className="container max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'file' | 'link')} className="w-full">
          <TabsList className="grid grid-cols-3 gap-1 p-1 bg-background/50 border-2 rounded-full w-full max-w-xl mx-auto mb-6 h-auto">
            <TabsTrigger value="text" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-1" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Upload className="h-4 w-4 mr-1" />
              <span>File</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="rounded-full py-2.5 px-2.5 text-sm whitespace-nowrap font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe className="h-4 w-4 mr-1" />
              <span>Web Link</span>
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[280px]">
            <TabsContent value="text" className="space-y-0">
              <div className="space-y-1 h-full flex flex-col">
                <Textarea
                  id="tts-text-input"
                  placeholder="Paste or type any text you want to convert to speech — articles, essays, notes, scripts, or anything else..."
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    setDisplayError('');
                    setShowNotification(false);
                  }}
                  className="h-[280px] w-full border-2 border-input focus-visible:ring-primary resize-none rounded-3xl px-5 py-4"
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-0">
              <div className="space-y-4 flex items-center justify-center">
                {!uploadedFile ? (
                  <div
                    className={`border-2 border-dashed rounded-3xl text-center transition-colors cursor-pointer w-full h-[240px] flex items-center justify-center ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="tts-file-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt"
                    />
                    <label htmlFor="tts-file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Upload className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-muted-foreground">
                          Drag your file here, or <span className="text-primary underline">click here to upload</span>
                        </p>
                        <p className="text-sm text-muted-foreground">Supports: PDF, DOC, DOCX, TXT files</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-3xl text-center transition-colors w-full h-[240px] flex items-center justify-center border-input bg-muted/20">
                    <div className="flex items-center justify-between w-full max-w-2xl px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-10 w-10 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground text-base">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {uploadedFile.size > 1024 * 1024
                              ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`
                              : `${Math.round(uploadedFile.size / 1024)} KB`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        disabled={generating}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        title="Remove file"
                      >
                        <X className="h-7 w-7" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-0">
              <div className="space-y-1 h-full flex flex-col">
                <Label htmlFor="tts-web-link" className="text-sm font-medium">
                  Enter website URL
                </Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="tts-web-link"
                    type="url"
                    placeholder="https://example.com"
                    value={webLink}
                    onChange={(e) => {
                      setWebLink(e.target.value);
                      setDisplayError('');
                      setShowNotification(false);
                    }}
                    className="h-12 pl-12 border-2 border-input focus-visible:ring-primary rounded-2xl"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste a webpage link and we will convert the extracted content into speech.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-5">
          <VoiceSelector
            value={selectedVoice}
            onChange={setSelectedVoice}
            label=""
            allowHostEditing={false}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleGenerate}
            disabled={
              generating ||
              (activeTab === 'text' && !textInput.trim()) ||
              (activeTab === 'file' && !uploadedFile) ||
              (activeTab === 'link' && !webLink.trim())
            }
            size="lg"
            className="rounded-full px-16 gap-2 min-w-[200px] text-base"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        {/* AudioPlayer with auto-play on select */}

        {generatedAudio && (generatedAudio.audio_url || generatedAudio.audio_file) && (
          <AudioPlayer
            ref={audioPlayerRef}
            src={generatedAudio.audio_url || generatedAudio.audio_file}
            playOnLoad={true}
          />
        )}

        <RecentTTSItems
          refreshTrigger={ttsRefreshTrigger}
          onSelect={(audioUrl) => {
            setGeneratedAudio({ audio_url: audioUrl } as any);
          }}
        />
      </div>
    </div>
  );
};

export default TextToSpeechPage;
