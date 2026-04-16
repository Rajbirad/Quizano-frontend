import { makeAuthenticatedFormRequest, makeAuthenticatedRequest, API_BASE_URL } from './api-utils';
import { supabase } from '@/integrations/supabase/client';
import { streamTaskStatus } from './task-stream';

// Legacy API functions - these now use async task pattern
// Recommend using useAsyncNotesGeneration hook instead for new implementations
export const notesApi = {
  // Generate notes from text - now uses async task pattern
  generateNotesFromText: async (text: string) => {
    const formData = new FormData();
    formData.append('text', text);

    // Step 1: Submit task
    const response = await makeAuthenticatedFormRequest('/api/generate-notes-from-text', formData);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate notes from text');
    }
    
    const taskResponse = await response.json();
    if (!taskResponse.success) {
      throw new Error(taskResponse.message || 'Failed to submit text for notes generation');
    }

    // Step 2: Stream task status via SSE
    const taskId = taskResponse.task_id;
    const event = await streamTaskStatus(taskId);
    return event.result?.notes || event.result?.structured_content || event.result;
  },

  // Generate notes from file - now uses async task pattern
  generateNotesFromFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Step 1: Submit task
    const response = await makeAuthenticatedFormRequest('/api/generate-notes-from-file', formData);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate notes from file');
    }
    
    const taskResponse = await response.json();
    if (!taskResponse.success) {
      throw new Error(taskResponse.message || 'Failed to submit file for notes generation');
    }

    // Step 2: Stream task status via SSE
    const taskId = taskResponse.task_id;
    const event = await streamTaskStatus(taskId);
    return event.result?.notes || event.result?.structured_content || event.result;
  },

  // Generate notes from YouTube URL - now uses async task pattern
  generateNotesFromYoutube: async (youtubeUrl: string) => {
    const formData = new FormData();
    formData.append('youtube_url', youtubeUrl);

    // Step 1: Submit task
    const response = await makeAuthenticatedFormRequest('/api/generate-notes-from-youtube', formData);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate notes from YouTube video');
    }
    
    const taskResponse = await response.json();
    if (!taskResponse.success) {
      throw new Error(taskResponse.message || 'Failed to submit YouTube URL for notes generation');
    }

    // Step 2: Stream task status via SSE
    const taskId = taskResponse.task_id;
    const event = await streamTaskStatus(taskId);
    return event.result?.notes || event.result?.structured_content || event.result;
  },

  // Generate notes from video file - now uses async task pattern
  generateNotesFromVideo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Step 1: Submit task
    const response = await makeAuthenticatedFormRequest('/api/generate-notes-from-video', formData);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate notes from video');
    }
    
    const taskResponse = await response.json();
    if (!taskResponse.success) {
      throw new Error(taskResponse.message || 'Failed to submit video for notes generation');
    }

    // Step 2: Stream task status via SSE
    const taskId = taskResponse.task_id;
    const event = await streamTaskStatus(taskId);
    return event.result?.notes || event.result?.structured_content || event.result;
  },
};
