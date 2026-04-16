import { useState } from 'react';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';
import { streamTaskStatus } from '@/lib/task-stream';
import { TransformedSimilarQuestion } from '@/lib/types/similar-questions';

interface TaskResponse {
  success: boolean;
  task_id: string;
  message: string;
}

interface TaskStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    status: 'success';
    similar_questions: string[];
    num_questions: number;
    task_id: string;
  };
  error?: string;
  meta?: {
    step: string;
  };
}

export const useAsyncSimilarQuestions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const pollTaskStatus = async (taskId: string): Promise<any> => {
    console.log('🔄 Starting similar questions task stream for:', taskId);
    return streamTaskStatus(taskId, {
      onProgress: () => setProgress('Generating Similar Questions'),
    });
  };

  const generateSimilarQuestions = async (
    question: string,
    numQuestions: number = 5,
    language: string = 'english',
    forceNew: boolean = false
  ): Promise<TransformedSimilarQuestion[]> => {
    setIsProcessing(true);
    setError(null);
    setProgress('Generating Similar Questions');

    try {
      const formData = new FormData();
      formData.append('question', question);
      formData.append('num_questions', numQuestions.toString());
      formData.append('language', language);
      formData.append('force_new', forceNew.toString());

      console.log('🔐 Submitting question for similar questions generation');
      console.log('🚀 Sending similar questions request');
      const response = await makeAuthenticatedFormRequest('/api/generate-similar-questions', formData);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const taskResponse: any = await response.json();
      console.log('📡 Similar questions task response:', taskResponse);

      // Check if this is a quota exceeded response
      if (!taskResponse.success && taskResponse.message && 
          (taskResponse.message.includes('Quota limit exceeded') || taskResponse.message.includes('total_limit_exceeded'))) {
        console.log('💳 [useAsyncSimilarQuestions] Quota exceeded detected, showing upgrade popup');
        setUpgradeMessage("You're out of free trials for this month. Upgrade to get more!");
        setShowUpgradePopup(true);
        throw new Error(taskResponse.message);
      }

      // Check if this is an immediate completion response (cached/completed)
      if (taskResponse.status === 'completed' && taskResponse.quiz) {
        console.log('⚡ Immediate completion detected (cached result), using data directly without polling');
        setProgress('Generation completed!');
        
        // Extract questions from the quiz data
        const questions = taskResponse.quiz.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('No similar questions received in the response');
        }
        
        return questions.map((q: any, index: number) => ({
          question: q.question,
          similarityScore: 1 - (index * 0.1), // Decreasing similarity for each subsequent question
        }));
      }

      // Otherwise, treat as async task requiring polling
      if (!taskResponse.success || !taskResponse.task_id) {
        throw new Error(taskResponse.message || 'Failed to start similar questions generation');
      }

      console.log('✅ Got task ID:', taskResponse.task_id);

      setProgress('Generating Similar Questions');
      const statusData = await pollTaskStatus(taskResponse.task_id);

      console.log('📋 Final status data:', statusData);
      
      // Check for quiz_id in multiple locations (backend may return it in different places)
      const quizId = statusData.quiz_id || statusData.result?.quiz_id || statusData.meta?.quiz_id;
      
      if (statusData.status === 'completed' && quizId) {
        setProgress('Fetching similar questions...');
        console.log('🎯 Task completed, fetching quiz data with ID:', quizId);
        
        // Fetch the actual quiz data
        const quizResponse = await makeAuthenticatedRequest(`/api/quizzes/${quizId}`);
        if (!quizResponse.ok) {
          throw new Error('Failed to fetch similar questions data');
        }
        
        const quizData = await quizResponse.json();
        console.log('📥 Quiz data fetched:', quizData);
        
        // Extract questions from the quiz
        const questions = quizData.questions || [];
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('No similar questions received in the response');
        }
        
        setProgress('Generation completed!');
        return questions.map((q: any, index: number) => ({
          question: q.question,
          similarityScore: 1 - (index * 0.1), // Decreasing similarity for each subsequent question
        }));
      } else if (statusData.status === 'completed' && statusData.result) {
        // Fallback: Check old format with similar_questions in result
        setProgress('Generation completed!');
        console.log('🎯 Similar questions generated successfully');
        
        // Extract questions from the result
        const questions = statusData.result.similar_questions;
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('No similar questions received in the response');
        }
        
        return questions.map((question, index) => ({
          question,
          similarityScore: 1 - (index * 0.1), // Decreasing similarity for each subsequent question
        }));
      } else if (statusData.status === 'failed' || statusData.error) {
        throw new Error(statusData.error || 'Similar questions generation failed');
      } else {
        console.error('❌ Unexpected status data:', statusData);
        throw new Error('Unexpected response format from similar questions generation');
      }

    } catch (error) {
      console.error('❌ Similar questions generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate similar questions';
      
      // Check if this is a quota limit error
      if (errorMessage.includes('Quota limit exceeded') || errorMessage.includes('total_limit_exceeded')) {
        console.log('💳 [useAsyncSimilarQuestions] Quota exceeded detected in catch block, showing upgrade popup');
        setUpgradeMessage("You're out of free trials for this month. Upgrade to get more!");
        setShowUpgradePopup(true);
        // Don't set error state for quota limit - upgrade popup is shown instead
      } else {
        // Only set error for non-quota errors
        setError(errorMessage);
      }
      
      setProgress('');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeUpgradePopup = () => {
    setShowUpgradePopup(false);
    setUpgradeMessage('');
  };

  return {
    generateSimilarQuestions,
    isProcessing,
    progress,
    error,
    showUpgradePopup,
    closeUpgradePopup,
    upgradeMessage
  };
};