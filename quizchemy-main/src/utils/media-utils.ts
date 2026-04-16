
import { useToast } from '@/hooks/use-toast';

export function useMediaUpload() {
  const { toast } = useToast();
  
  const validateImageFile = (file: File | undefined) => {
    if (!file) return false;
    
    if (!file.type.startsWith('image/')) {
      return false;
    }
    return true;
  };
  
  const validateVideoFile = (file: File | undefined) => {
    if (!file) return false;
    
    if (!file.type.startsWith('video/')) {
      return false;
    }
    return true;
  };
  
  const validateYoutubeUrl = (url: string) => {
    if (!url.trim()) {
      return { isValid: false, error: "YouTube URL required" };
    }
    
    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    
    if (!youtubeRegex.test(url)) {
      return { isValid: false, error: "Invalid YouTube URL" };
    }
    
    return { isValid: true, error: "" };
  };
  
  return {
    validateImageFile,
    validateVideoFile,
    validateYoutubeUrl
  };
}
