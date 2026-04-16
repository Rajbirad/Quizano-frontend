
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackRecentTool } from '@/utils/recentTools';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest, API_URL } from '@/lib/api-utils';
import { streamTaskStatus } from '@/lib/task-stream';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { FileImage, Copy, Download, Camera, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ImageTranscription: React.FC = (): JSX.Element => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }
      
      // Set the file and create preview
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleTranscribe = async () => {
    if (!imageFile) return;
    
    setIsTranscribing(true);
    setProgressOpen(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      // Step 1: Submit image for transcription using authenticated request
      setProgress(10);
      const response = await makeAuthenticatedFormRequest(
        '/api/transcribe-image-structured',
        formData
      );

      const taskResponse = await response.json();
      console.log('📡 Transcription task response:', taskResponse);

      if (!taskResponse.success) {
        throw new Error(taskResponse.message || 'Failed to submit image for transcription');
      }

      // Handle cached response — no task_id, structured_content returned immediately
      if (taskResponse.cached || taskResponse.structured_content) {
        console.log('⚡ Cached response received, skipping poll');
        setProgress(100);
        const structuredContent = taskResponse.structured_content || null;
        const extractedText = structuredContent || taskResponse.text || 'No text found in image';
        const metadata = taskResponse.metadata || {};
        setTranscription(typeof extractedText === 'string' ? extractedText : JSON.stringify(extractedText));
        setTimeout(() => {
          trackRecentTool('/app/image-transcription');
          navigate('/app/image-text-result', {
            state: { extractedText, imageFile, confidence: metadata }
          });
          setProgressOpen(false);
        }, 500);
        return;
      }

      // Step 2: Stream task status via SSE
      setProgress(30);
      const taskId = taskResponse.task_id;
      const statusData = await streamTaskStatus(taskId, {
        onProgress: (e) => setProgress(30 + Math.min(60, (e.progress ?? 0) * 60)),
      }) as any;

      setProgress(100);
      // Handle nested result: statusData.result.result.structured_content
      const resultPayload = statusData.result?.result ?? statusData.result ?? {};
      const structuredContent = resultPayload.structured_content || statusData.result?.structured_content || null;
      const extractedText = structuredContent || resultPayload.text || statusData.result?.text || 'No text found in image';
      const metadata = resultPayload.metadata || statusData.result?.metadata || {};
      setTranscription(typeof extractedText === 'string' ? extractedText : JSON.stringify(extractedText));

      setTimeout(() => {
        trackRecentTool('/app/image-transcription');
        // Navigate to result page with the structured content
        navigate('/app/image-text-result', {
          state: {
            extractedText,
            imageFile,
            confidence: metadata
          }
        });

        setProgressOpen(false);
      }, 500);
      return;
    } catch (error: any) {
      console.error('Transcription error:', error);
      setProgressOpen(false);
      
      // Handle specific error messages
      const errorMessage = error.message || 'Unknown error occurred';
      let userMessage = "There was an error processing your image. Please try again.";
      
      if (errorMessage.includes("taking longer than expected")) {
        userMessage = "Image processing timed out. Please try with a smaller or clearer image, or try these tips:\n" +
                     "• Reduce image size or resolution\n" +
                     "• Ensure text is clear and well-lit\n" +
                     "• Crop unnecessary parts of the image\n" +
                     "• Convert to black and white if possible";
      } else if (errorMessage.includes("413")) {
        userMessage = "Image file is too large. Please reduce the size and try again.";
      } else if (errorMessage.includes("429")) {
        userMessage = "Too many requests. Please wait a moment and try again.";
      }
      
      toast({
        title: "Transcription failed",
        description: userMessage,
        variant: "destructive",
        duration: 6000  // Show for longer since there's more text
      });
    } finally {
      setIsTranscribing(false);
      setProgress(0);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    toast({
      title: "Copied to clipboard",
      description: "Extracted text has been copied"
    });
  };
  
  const handleDownload = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download complete",
      description: "Extracted text saved as file"
    });
  };
  
  const captureImage = () => {
    // This would normally trigger a camera API
    // For demo purposes, we'll just show a toast
    toast({
      title: "Camera access requested",
      description: "In a real implementation, this would access your device camera"
    });
    
    // Simulate capturing an image
    setTimeout(() => {
      const dummyFile = new File(["image data"], "camera-capture.jpg", { type: "image/jpeg" });
      setImageFile(dummyFile);
      
      // Use a placeholder image for demo
      setImagePreview("https://placehold.co/600x400/png?text=Camera+Capture");
      
      toast({
        title: "Image captured",
        description: "Photo has been taken successfully"
      });
    }, 1500);
  };
  
  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
      
      {!imagePreview ? (
        <div className="flex justify-center mt-8">
          <div 
            className="border-2 border-dashed border-primary/30 rounded-3xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-primary/5 hover:bg-primary/10"
            onClick={() => imageInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src="/icons/image-summarizer.svg" alt="" className="w-full h-full" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-foreground">Upload Image</p>
                <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="relative border rounded-lg overflow-hidden bg-background">
            <img 
              src={imagePreview} 
              alt="Uploaded image" 
              className="max-h-[400px] w-full object-contain"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => imageInputRef.current?.click()}
                disabled={isTranscribing}
                className="bg-background/80 backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Replace
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleTranscribe}
            disabled={isTranscribing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranscribing ? "Processing..." : "Generate"}
          </Button>
        </div>
      )}
      
      {transcription && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Extracted Text</h3>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
      )}
    
    </div>
  )
};
