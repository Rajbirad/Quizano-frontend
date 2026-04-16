import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AudioVisualizer } from '../ai-chat-files/transcription/AudioVisualizer';

interface QuizRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (audioFile: File) => void;
}

export const QuizRecordingModal: React.FC<QuizRecordingModalProps> = ({
  isOpen,
  onClose,
  onRecordingComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/wav'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/wav'
        });
        const file = new File([audioBlob], `recording-${Date.now()}.${mediaRecorder.mimeType?.includes('webm') ? 'webm' : 'wav'}`, {
          type: audioBlob.type
        });
        stream.getTracks().forEach(track => track.stop());
        
        // Automatically use the recording and close modal
        onRecordingComplete(file);
        onClose();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <img src="/icons/audioRecording.svg" alt="" className="h-5 w-5" />
            Audio Recording
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {isRecording ? (
            // Recording State
            <>
              <div className="text-center space-y-4">
                <AudioVisualizer isRecording={isRecording} isPaused={isPaused} />
                <div className="text-lg font-semibold">{formatTime(recordingTime)}</div>
                <div className="text-sm text-muted-foreground">
                  {isPaused ? 'Recording Paused' : 'Recording...'}
                </div>
              </div>
              
              <div className="flex gap-6 items-center">
                <button onClick={handlePauseRecording} className="hover:opacity-80 transition-opacity">
                  {isPaused ? (
                    <img src="/icons/playButton.svg" alt="Resume" className="h-12 w-12" />
                  ) : (
                    <img src="/icons/pauseButton.svg" alt="Pause" className="h-12 w-12" />
                  )}
                </button>
                <button onClick={handleStopRecording} className="hover:opacity-80 transition-opacity">
                  <img src="/icons/stop-button.svg" alt="Stop" className="h-12 w-12" />
                </button>
              </div>
            </>
          ) : (
            // Initial State
            <>
              <img src="/icons/microphone.svg" alt="" className="h-20 w-20" />
              
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Start Recording</h3>
                <p className="text-sm text-muted-foreground">
                  Click the button below to start recording your voice
                </p>
              </div>

              <Button onClick={handleStartRecording} size="lg" className="w-full">
                Start Recording
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
