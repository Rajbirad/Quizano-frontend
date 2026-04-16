import { useCredits } from '@/contexts/CreditsContext';
import { useMemo } from 'react';

type CreditType = 
  | 'ai_podcast' 
  | 'ai_detection' 
  | 'ai_mindmap' 
  | 'qa_generator'
  | 'flashcards'
  | 'quiz'
  | 'notes'
  | 'video_summarizer'
  | 'audio_transcription'
  | 'image_transcription'
  | 'chat_files'
  | 'presentations';

/**
 * Hook to get credits for a specific feature
 * @param type - The type of credit to retrieve
 * @returns Object with balance and unlimited status
 */
export const useCreditBalance = (type: CreditType) => {
  const { credits, loading, refreshCredits } = useCredits();

  const balance = useMemo(() => {
    if (!credits || !credits[type]) {
      return { balance: 0, unlimited: false };
    }
    return {
      balance: credits[type]?.balance ?? 0,
      unlimited: credits[type]?.unlimited ?? false,
    };
  }, [credits, type]);

  return {
    ...balance,
    loading,
    refreshCredits,
  };
};
