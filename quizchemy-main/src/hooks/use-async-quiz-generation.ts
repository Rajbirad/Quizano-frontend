import { useState, useCallback, useEffect } from 'react';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest, API_URL } from '@/lib/api-utils';
import { streamTaskStatus } from '@/lib/task-stream';

interface QuizGenerationResponse {
  success: boolean;
  task_id: string;
  status: string;
  message: string;
  estimated_time: string;
  check_status_url: string;
  correlation_id: string;
  text_size: number;
  processing_type: string;
}

interface TaskStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    status: string;
    quiz_id: string;
    num_questions: number;
    task_id: string;
    filename: string;
  };
  meta?: {
    quiz_id: string;
    num_questions: number;
    [key: string]: any;
  };
  error?: string;
}

interface UseAsyncQuizGenerationReturn {
  generateQuiz: (formData: FormData, endpoint?: string) => Promise<any>;
  loading: boolean;
  progress: string;
  error: string | null;
  taskId: string | null;
  cancelGeneration: () => void;
  showUpgradePopup: boolean;
  closeUpgradePopup: () => void;
  upgradeMessage: string;
}

export const useAsyncQuizGeneration = (): UseAsyncQuizGenerationReturn => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  // Debug: Track popup state changes
  useEffect(() => {
    console.log('🔔 [useAsyncQuizGeneration] Popup state changed:', showUpgradePopup);
    if (showUpgradePopup) {
      console.log('✅ [useAsyncQuizGeneration] Upgrade popup is now OPEN');
    } else {
      console.log('❌ [useAsyncQuizGeneration] Upgrade popup is now CLOSED');
      console.trace('🔍 [useAsyncQuizGeneration] Stack trace for popup close:');
    }
  }, [showUpgradePopup]);

  const pollTaskStatus = async (taskId: string): Promise<any> => {
    return streamTaskStatus(taskId, {
      onProgress: () => setProgress('Generating Quiz'),
    });
  };

  const fetchQuizData = async (quizId: string) => {
    try {
      // Use the authenticated request through the proxy instead of direct fetch
      const response = await makeAuthenticatedRequest(`/api/quizzes/${quizId}/public`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz data: ${response.status}`);
      }
      
      const quizData = await response.json();
      return quizData;
    } catch (err) {
      console.error('Error fetching quiz data:', err);
      throw err;
    }
  };

  const generateQuiz = useCallback(async (formData: FormData, endpoint: string = '/api/generate-quiz-from-text') => {
    setLoading(true);
    setError(null);
    setCancelled(false);
    setProgress('Generating Quiz');
    // Don't reset upgrade popup state here - let user explicitly close it
    
    try {
      // Step 1: Start quiz generation
      const response = await makeAuthenticatedFormRequest(
        `http://localhost:8083${endpoint}`,
        formData
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const initialData: any = await response.json();
      
      // Check if this is a quota exceeded response
      if (!initialData.success && initialData.message && 
          (initialData.message.includes('quiz limit') || initialData.message.includes('upgrade') || initialData.message.includes('Quota limit exceeded') || initialData.message.includes('total_limit_exceeded'))) {
        console.log('💳 [useAsyncQuizGeneration] Quota exceeded in initial response, showing upgrade popup');
        console.log('📝 [useAsyncQuizGeneration] API Response:', initialData);
        // Use custom message instead of API message
        setUpgradeMessage("You're out of free trials for this month. Upgrade to get more!");
        setShowUpgradePopup(true);
        throw new Error(initialData.message);
      }
      
      // Check if this is an immediate completion response (cached result)
      if (initialData.status === 'completed' && initialData.quiz) {
        console.log('⚡ [useAsyncQuizGeneration] Immediate completion detected (cached result), using quiz data directly without polling');
        setProgress('Quiz generated!');
        
        // For cached results, we need to fetch the full quiz data using the quiz ID
        const quizId = initialData.quiz.id;
        if (!quizId) {
          throw new Error('No quiz ID found in cached result');
        }
        
        // Fetch the complete quiz data
        const quizData = await fetchQuizData(quizId);
        
        return {
          success: true,
          quiz: quizData,
          task_id: initialData.task_id,
          quiz_id: quizId,
          cached: initialData.cached,
          quota_status: initialData.quota_status
        };
      }
      
      // Check if this is the new async response or old sync response
      if (initialData.task_id && initialData.success) {
        // New async flow
        setTaskId(initialData.task_id);
        setProgress('Generating Quiz');

        // Step 2: Poll for completion
        const statusData = await pollTaskStatus(initialData.task_id);
        
        // Check for quiz_id in multiple locations (backend may return it in different places)
        const quizId = statusData.quiz_id || statusData.result?.quiz_id || statusData.meta?.quiz_id;
        const numQuestions = statusData.num_questions || statusData.result?.num_questions || statusData.meta?.num_questions;
        
        if (!quizId) {
          console.error('Status data:', statusData);
          throw new Error('No quiz ID found in completed task');
        }

        setProgress('Generating Quiz');

        // Step 3: Fetch the final quiz data
        const quizData = await fetchQuizData(quizId);
        
        setProgress('Generating Quiz');
        return {
          success: true,
          quiz: quizData,
          task_id: initialData.task_id,
          quiz_id: quizId,
          num_questions: numQuestions
        };
      } else if (initialData.success && (initialData as any).quiz) {
        // Old synchronous flow - return as is
        setProgress('Generating Quiz');
        return initialData;
      } else {
        throw new Error('Invalid response from quiz generation API');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      // Check if this is a quota exceeded error
      if (errorMessage.includes('quiz limit') || errorMessage.includes('upgrade your plan') || errorMessage.includes('reached your total') || errorMessage.includes('Quota limit exceeded') || errorMessage.includes('total_limit_exceeded')) {
        console.log('💳 [useAsyncQuizGeneration] Quota exceeded detected in catch block, showing upgrade popup');
        console.log('📝 [useAsyncQuizGeneration] Original error message:', errorMessage);
        // Use custom message instead of API message
        setUpgradeMessage("You're out of free trials for this month. Upgrade to get more!");
        setShowUpgradePopup(true);
        console.log('✅ [useAsyncQuizGeneration] Upgrade popup state should now be true');
        // Don't set error state for quota limit - upgrade popup is shown instead
      } else {
        // Only set error for non-quota errors
        setError(errorMessage);
      }
      
      console.error('Quiz generation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cancelled]);

  const cancelGeneration = useCallback(() => {
    setCancelled(true);
    setLoading(false);
    setProgress('Generating Quiz');
  }, []);

  const closeUpgradePopup = useCallback(() => {
    console.log('🚪 [useAsyncQuizGeneration] closeUpgradePopup called');
    console.trace('🔍 [useAsyncQuizGeneration] Stack trace for closeUpgradePopup:');
    setShowUpgradePopup(false);
    setUpgradeMessage('');
  }, []);

  return {
    generateQuiz,
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