import React from 'react';
import Lottie from 'lottie-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileAudio, Loader2, RefreshCw } from 'lucide-react';
import subtitleAnim from '@/assets/subtitle.json';

interface UploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadProgress: number;
  isUploaded: boolean;
  fileName?: string;
  onTranscribe: () => void;
  isTranscribing?: boolean;
  showForceNew?: boolean;
  forceNew?: boolean;
  onForceNewChange?: (value: boolean) => void;
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  isOpen,
  onClose,
  uploadProgress,
  isUploaded,
  fileName,
  onTranscribe,
  isTranscribing = false,
  showForceNew = false,
  forceNew = false,
  onForceNewChange,
}) => {
  const isProcessing = !isUploaded || isTranscribing;

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
      <DialogContent
        className={`sm:max-w-md ${isProcessing ? '[&>button:last-of-type]:hidden' : ''}`}
        onInteractOutside={isProcessing ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isProcessing ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-medium">
            <FileAudio className="h-7 w-7 text-primary" />
            Audio Upload
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!isUploaded ? (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Uploading audio file...</p>
                  <p className="text-xs text-muted-foreground mt-1">{fileName}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-center text-muted-foreground">
                  {uploadProgress}% uploaded
                </p>
              </div>
            </>
          ) : isTranscribing ? (
            <>
              <div className="flex flex-col items-center space-y-4">
                <Lottie animationData={subtitleAnim} loop className="w-24 h-24" />
                <div className="text-center">
                  <p className="text-lg font-semibold">Transcribing audio…</p>
                  <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
                </div>
              </div>
              
              <Button disabled className="w-full text-base py-5">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing…
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src="/icons/checklist.svg" alt="Upload complete" className="h-14 w-14" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload Complete!</p>
                  <p className="text-xs text-muted-foreground mt-1">{fileName}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-lg border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/40 text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onTranscribe}
                  className="flex-1 rounded-lg text-base"
                >
                  Transcribe
                </Button>
              </div>

              {showForceNew && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Force New Transcription</p>
                      <p className="text-xs text-muted-foreground">Re-transcribe instead of using cached results</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onForceNewChange?.(!forceNew)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ${
                      forceNew
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-r from-gray-200 to-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${forceNew ? 'translate-x-6' : 'translate-x-1'}`}>
                      <div className={`flex items-center justify-center h-full w-full ${forceNew ? 'text-blue-600' : 'text-gray-400'}`}>
                        <RefreshCw className="h-3 w-3" />
                      </div>
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};