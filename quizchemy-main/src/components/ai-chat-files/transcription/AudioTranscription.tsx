import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackRecentTool } from '@/utils/recentTools';
import { Mic, FileAudio, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RecordingModal } from './RecordingModal';
import { UploadProgressModal } from './UploadProgressModal';
import { useCredits } from '@/contexts/CreditsContext';

export const AudioTranscription: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const { refreshCredits } = useCredits();
  const [forceNew, setForceNew] = useState(false);
  const [showForceNew, setShowForceNew] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRecordingComplete = (recordedFile: File) => {
    setAudioFile(recordedFile);
    setError(null);
    setShowForceNew(false);
    setForceNew(false);
    setIsUploadModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.toLowerCase().split('.').pop();
    const isAudio = file.type.startsWith('audio/');
    const isMp4 = file.type === 'video/mp4' || extension === 'mp4';
    const isValidExtension = ['mp3', 'wav', 'm4a', 'mp4'].includes(extension || '');

    if (!isValidExtension || (!isAudio && !isMp4)) {
      toast({ title: "Invalid file type", description: "Please select an audio file (MP3, WAV, M4A, or MP4)", variant: "destructive" });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select a file smaller than 50MB", variant: "destructive" });
      return;
    }

    setAudioFile(file);
    setError(null);
    // Check if previously transcribed
    const processed = JSON.parse(localStorage.getItem('processedAudioFiles') || '[]');
    const key = `${file.name}_${file.size}`;
    setShowForceNew(processed.includes(key));
    setForceNew(false);
    setModalKey(k => k + 1);
    setIsUploadModalOpen(true);
  };

  const pollForTranscriptionResult = async (taskId: string): Promise<any> => {
    const { streamTaskStatus } = await import('@/lib/task-stream');
    return streamTaskStatus(taskId);
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setIsTranscribing(true);
    setError(null);
    try {
      const AudioUploadService = (await import('@/components/ai-chat-files/services/AudioUploadService')).default;
      const result = await AudioUploadService.uploadFile(audioFile, 'en', () => {}, forceNew);

      if (!result.success) throw new Error(result.message || 'Failed to transcribe audio');

      let transcription = '';
      let utterances: any[] = [];
      let plainText = '';
      let metadata: any = {};
      let summary = '';

      if (result.task_id) {
        const taskResult = await pollForTranscriptionResult(result.task_id);
        const r = taskResult.result?.result ?? taskResult.result ?? taskResult;
        transcription = r.transcription || '';
        utterances = r.utterances || [];
        plainText = r.plain_text || '';
        metadata = r.metadata || {};
        summary = r.summary || '';
        if (!transcription) throw new Error('No transcription found in task result');
      } else if (result.result?.transcription) {
        const r = result.result as any;
        transcription = r.transcription;
        utterances = r.utterances || [];
        plainText = r.plain_text || '';
        metadata = r.metadata || {};
        summary = r.summary || '';
      } else {
        throw new Error('No transcription found in response');
      }

      trackRecentTool('/app/audio-transcription');
      // Save to processed files list
      const processed = JSON.parse(localStorage.getItem('processedAudioFiles') || '[]');
      const key = `${audioFile.name}_${audioFile.size}`;
      if (!processed.includes(key)) {
        processed.push(key);
        localStorage.setItem('processedAudioFiles', JSON.stringify(processed));
      }
      // Determine correct MIME type by both file.type and extension
      const ext = audioFile.name.toLowerCase().split('.').pop();
      let audioMimeType = audioFile.type;
      if (!audioMimeType || audioMimeType === 'video/mp4' || audioMimeType === 'audio/x-m4a' || ext === 'mp4' || ext === 'm4a') {
        audioMimeType = 'audio/mp4';
      } else if (audioMimeType === 'audio/mp3' || ext === 'mp3') {
        audioMimeType = 'audio/mpeg';
      }
      const audioBlob = new Blob([audioFile], { type: audioMimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      await refreshCredits();
      navigate('/app/transcription-result', {
        state: { transcription, utterances, plainText, metadata, summary, fileName: audioFile.name, audioUrl, audioMimeType }
      });
    } catch (err) {
      console.error('Transcription error:', err);
      const rawMsg = err instanceof Error ? err.message : 'Failed to transcribe audio. Please try again after sometime.';
      const isCreditsError = rawMsg.toLowerCase().includes('credit');
      const errMsg = isCreditsError ? `${rawMsg}. Please upgrade.` : rawMsg;
      setIsTranscribing(false);
      setIsUploadModalOpen(false);
      setAudioFile(null);
      setShowForceNew(false);
      setForceNew(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
      setError(errMsg);
      if (!isCreditsError) {
        toast({ title: 'Transcription failed', description: 'There was an error processing your audio file', variant: 'destructive' });
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    setAudioFile(null);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center gap-8 items-center">
        <input type="file" ref={audioInputRef} className="hidden" accept="audio/*,.mp4" onChange={handleFileUpload} />

        {/* Upload Audio */}
        <div
          className="border-2 border-dashed rounded-3xl p-8 text-center transition-colors w-40 h-40 flex flex-col items-center justify-center flex-shrink-0 border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 cursor-pointer"
          onClick={() => audioInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileAudio className="h-7 w-7 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Upload className="h-3 w-3 text-white" />
              </div>
            </div>
            <span className="text-base font-medium text-foreground text-center">Upload Audio</span>
          </div>
        </div>

        <span className="text-muted-foreground font-medium">or</span>

        {/* Record Audio */}
        <div
          className="border-2 border-dashed rounded-3xl p-8 text-center transition-colors w-40 h-40 flex flex-col items-center justify-center flex-shrink-0 border-green-500/30 bg-green-500/5 hover:border-green-500/50 hover:bg-green-500/10 cursor-pointer"
          onClick={() => setIsRecordingModalOpen(true)}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="h-7 w-7 text-green-500" />
            </div>
            <span className="text-base font-medium text-foreground text-center">Record Audio</span>
          </div>
        </div>
      </div>

      <RecordingModal
        isOpen={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
        onRecordingComplete={handleRecordingComplete}
      />

      <UploadProgressModal
        key={modalKey}
        isOpen={isUploadModalOpen}
        onClose={handleModalClose}
        uploadProgress={100}
        isUploaded={true}
        fileName={audioFile?.name}
        onTranscribe={handleTranscribe}
        isTranscribing={isTranscribing}
        showForceNew={showForceNew}
        forceNew={forceNew}
        onForceNewChange={setForceNew}
      />


    </div>
  );
};
