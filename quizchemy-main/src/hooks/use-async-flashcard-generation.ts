import { useState, useCallback } from 'react';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest, makeAuthenticatedJSONRequest, API_URL } from '@/lib/api-utils';
import { streamTaskStatus } from '@/lib/task-stream';

interface FlashcardGenerationResponse {
  success: boolean;
  task_id: string;
  status: string;
  message: string;
  estimated_time: string;
  check_status_url: string;
  correlation_id: string;
  text_size?: number;
  processing_type: string;
}

interface TaskStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  // some API responses put identifiers at the top level too
  flashcard_set_id?: string;
  quiz_id?: string;
  num_flashcards?: number;
  result?: {
    status: string;
    flashcard_set_id?: string;
    quiz_id?: string; // Your API returns quiz_id for flashcards
    num_flashcards?: number;
    num_questions?: number; // Alternative name
    task_id: string;
    filename?: string;
    file_type?: string;
  };
  error?: string;
}

interface UseAsyncFlashcardGenerationReturn {
  generateFlashcards: (data: FormData | object, endpoint: string) => Promise<any>;
  loading: boolean;
  progress: string;
  error: string | null;
  taskId: string | null;
  cancelGeneration: () => void;
  showUpgradePopup: boolean;
  closeUpgradePopup: () => void;
  upgradeMessage: string;
}

export const useAsyncFlashcardGeneration = (): UseAsyncFlashcardGenerationReturn => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const pollTaskStatus = async (taskId: string): Promise<TaskStatusResponse> => {
    console.log('🔄 Starting flashcard task stream for:', taskId);
    return streamTaskStatus(taskId, {
      onProgress: () => setProgress('Generating Flashcards'),
    }) as Promise<TaskStatusResponse>;
  };

  const fetchFlashcardData = async (flashcardSetId: string) => {
    try {
      // Use the authenticated request through the proxy instead of direct fetch
      const response = await makeAuthenticatedRequest(`/api/flashcards/${flashcardSetId}/public`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch flashcard data: ${response.status}`);
      }
      
      const flashcardData = await response.json();
      return flashcardData;
    } catch (err) {
      console.error('Error fetching flashcard data:', err);
      throw err;
    }
  };

  const generateFlashcards = useCallback(async (data: FormData | object, endpoint: string) => {
    setLoading(true);
    setError(null);
    setCancelled(false);
    setProgress('Generating Flashcards');
    
    try {
      let response: Response;
      
      // Step 1: Start flashcard generation
      if (data instanceof FormData) {
        response = await makeAuthenticatedFormRequest(
          `http://localhost:8083${endpoint}`,
          data
        );
      } else {
        // Handle JSON data for text-based endpoints
        response = await makeAuthenticatedRequest(`http://localhost:8083${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // Check if this is a quota limit error
        if (errorData && !errorData.success && errorData.message && 
            (errorData.message.includes('quiz limit') || 
             errorData.message.includes('Quota limit exceeded') || 
             errorData.message.includes('total_limit_exceeded') ||
             errorData.message.includes('upgrade your plan'))) {
          setUpgradeMessage("You've reached your limit. Upgrade to create more!");
          setShowUpgradePopup(true);
          throw new Error(errorData.message);
        }
        
        // Check if this is a duration/size limit error
        if (errorData && !errorData.success && errorData.message && 
            (errorData.message.includes('exceeds') || 
             errorData.message.includes('duration') ||
             errorData.message.includes('limit') ||
             /too large/i.test(errorData.message))) {
          // Clean up error message for popup display
          let popupMsg = errorData.message;
          
          // Strip technical prefixes and URLs
          popupMsg = popupMsg.replace(/^(?:API Request Failed:|HTTP error! status:\s*\d+|Error:)/i, '').trim();
          popupMsg = popupMsg.replace(/https?:\/\/\S+/g, '').trim();
          popupMsg = popupMsg.replace(/URL:\s*\/[^\s]+/g, '').trim();
          popupMsg = popupMsg.replace(/Make sure your backend.*$/i, '').trim();
          
          // Handle file size errors
          if (/too large/i.test(popupMsg) ||
              (popupMsg.includes('exceeds') && /MB/.test(popupMsg))) {
            popupMsg = "File size exceeds your tier limit. Please upgrade or use a smaller file.";
          }
          // Handle duration limit errors
          else if (popupMsg.includes('duration') && popupMsg.includes('exceeds')) {
            const limitMatch = popupMsg.match(/(?:limit of|tier limit of)\s*(\d+\s*minutes)/i);
            if (limitMatch) {
              popupMsg = `Video duration exceeds your free tier of ${limitMatch[1]}. Please upgrade`;
            } else {
              popupMsg = "Video duration exceeds your free tier limit. Please upgrade.";
            }
          }
          
          setUpgradeMessage(popupMsg);
          setShowUpgradePopup(true);
          // Return the error message as-is for display
          throw new Error(errorData.message);
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const initialData: FlashcardGenerationResponse = await response.json();
      
      // Check if this is an immediate completion (cached/completed result with flashcard_set_id)
      if (initialData.success && (initialData as any).flashcard_set_id && !(initialData as any).flashcard_set) {
        console.log('⚡ Immediate completion detected (cached result), fetching flashcard data');
        const flashcardSetId = (initialData as any).flashcard_set_id;
        
        // Fetch the final flashcard data
        const flashcardData = await fetchFlashcardData(flashcardSetId);
        
        setProgress('Generating Flashcards');
        return {
          success: true,
          flashcard_set: flashcardData,
          task_id: initialData.task_id,
          flashcard_set_id: flashcardSetId,
          num_flashcards: flashcardData?.data?.cards?.length || 0
        };
      }
      
      // Check if this is the new async response with task_id
      if (initialData.task_id && initialData.success) {
        // New async flow
        setTaskId(initialData.task_id);
        setProgress('Generating Flashcards');

        // Step 2: Poll for completion
        const statusData = await pollTaskStatus(initialData.task_id);
        
        console.log('📊 Final status data:', statusData);
        
        // Extract flashcard_set_id from various possible locations
        // Check root level first, then fallback to nested locations
        const flashcardSetId = statusData.flashcard_set_id || 
                              statusData.quiz_id || 
                              statusData.result?.flashcard_set_id || 
                              statusData.result?.quiz_id;
        
        if (!flashcardSetId) {
          console.error('❌ No flashcard set ID found in response:', statusData);
          throw new Error('No flashcard set ID found in completed task');
        }

        console.log('🎯 Found flashcard set ID:', flashcardSetId);
        setProgress('Generating Flashcards');

        // Step 3: Fetch the final flashcard data
        const flashcardData = await fetchFlashcardData(flashcardSetId);
        
        setProgress('Generating Flashcards');
        return {
          success: true,
          flashcard_set: flashcardData,
          task_id: initialData.task_id,
          flashcard_set_id: flashcardSetId,
          num_flashcards: statusData.result?.num_flashcards || statusData.num_flashcards
        };
      } else if (initialData.success && (initialData as any).flashcard_set) {
        // Old synchronous flow with flashcard_set data included - return as is
        setProgress('Generating Flashcards');
        return initialData;
      } else {
        console.error('❌ Unexpected response format:', initialData);
        throw new Error('Invalid response from flashcard generation API');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      // Check if this is a quota limit error - don't set error state, upgrade popup will be shown
      if (errorMessage.includes('quiz limit') || 
          errorMessage.includes('Quota limit exceeded') || 
          errorMessage.includes('total_limit_exceeded') ||
          errorMessage.includes('upgrade your plan')) {
        setUpgradeMessage("You've reached your limit. Upgrade to create more!");
        setShowUpgradePopup(true);
      } else {
        // also treat any exceeds/too large/duration errors as upgrade triggers
        if (errorMessage.includes('exceeds') || errorMessage.toLowerCase().includes('too large') || errorMessage.includes('duration')) {
          let popupMsg = errorMessage;
          
          // Strip technical prefixes and URLs
          popupMsg = popupMsg.replace(/^(?:API Request Failed:|HTTP error! status:\s*\d+|Error:)/i, '').trim();
          popupMsg = popupMsg.replace(/https?:\/\/\S+/g, '').trim();
          popupMsg = popupMsg.replace(/URL:\s*\/[^\s]+/g, '').trim();
          popupMsg = popupMsg.replace(/Make sure your backend.*$/i, '').trim();
          
          // Handle file size errors
          if (popupMsg.toLowerCase().includes('too large') ||
              (popupMsg.includes('exceeds') && popupMsg.includes('MB'))) {
            popupMsg = "File size exceeds your tier limit. Please upgrade or use a smaller file.";
          }
          // Handle duration limit errors
          else if (popupMsg.includes('duration') && popupMsg.includes('exceeds')) {
            const limitMatch = popupMsg.match(/(?:limit of|tier limit of)\s*(\d+\s*minutes)/i);
            if (limitMatch) {
              popupMsg = `Video duration exceeds your free tier of ${limitMatch[1]}. Please upgrade`;
            } else {
              popupMsg = "Video duration exceeds your free tier limit. Please upgrade.";
            }
          }
          
          setUpgradeMessage(popupMsg);
          setShowUpgradePopup(true);
          setError(popupMsg); // Set cleaned error for quota/tier limits
        } else {
          // Don't expose technical API errors - use generic message
          setError('Unable to generate flashcards. Please try again.');
        }
      }
      
      console.error('Flashcard generation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cancelled]);

  const cancelGeneration = useCallback(() => {
    setCancelled(true);
    setLoading(false);
    setProgress('Generating Flashcards');
  }, []);

  const closeUpgradePopup = useCallback(() => {
    setShowUpgradePopup(false);
    setUpgradeMessage('');
  }, []);

  return {
    generateFlashcards,
    loading,
    progress,
    error,
    taskId,
    cancelGeneration,
    showUpgradePopup,
    closeUpgradePopup,
    upgradeMessage
  };
};