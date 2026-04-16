
import { Message } from '../types';
import { API_URL } from '@/lib/api-utils';
// Ensure Message type supports 'error' and 'text' values for type
// Removed unused imports for backend chat integration

// Poll for task status
const pollTaskStatus = async (
  taskId: string,
  callback: (response: Message) => void,
  maxAttempts: number = 60, // 60 attempts = 10 minutes with 10s interval
  interval: number = 10000 // 10 seconds
) => {
  const { makeAuthenticatedRequest } = await import('@/lib/api-utils');
  let attempts = 0;

  const poll = async () => {
    try {
      attempts++;
      console.log(`📊 Polling task status (attempt ${attempts}/${maxAttempts}): ${taskId}`);

      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/task-status/${taskId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Task status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Task status response:', data);

      // Check if processing is complete
      if (data.status === 'completed' && data.answer) {
        callback({
          id: `msg-${Date.now()}-ai`,
          content: data.answer,
          sender: 'ai',
          timestamp: new Date(),
          type: 'text',
          data
        });
        return;
      }

      // Check if there was an error
      if (data.status === 'failed' || data.status === 'error') {
        callback({
          id: `msg-${Date.now()}-ai`,
          content: data.message || 'Failed to process your question',
          sender: 'ai',
          timestamp: new Date(),
          type: 'error'
        });
        return;
      }

      // Still processing, continue polling
      if ((data.status === 'processing' || data.status === 'pending') && attempts < maxAttempts) {
        setTimeout(poll, interval);
        return;
      }

      // Max attempts reached
      if (attempts >= maxAttempts) {
        callback({
          id: `msg-${Date.now()}-ai`,
          content: 'Request timed out. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
          type: 'error'
        });
      }
    } catch (err: any) {
      console.error('❌ Error polling task status:', err);
      callback({
        id: `msg-${Date.now()}-ai`,
        content: `Error checking status: ${err?.message || String(err)}`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      });
    }
  };

  poll();
};

export const processUserQuery = (
  userMessage: string,
  fileContext: any,
  callback: (response: Message) => void
) => {
  // Get document_id from fileContext.chatData.document_id
  const document_id = fileContext?.chatData?.document_id;
  if (!document_id) {
    callback({
      id: `msg-${Date.now()}-ai`,
      content: 'No document_id found. Please upload a document first.',
      sender: 'ai',
      timestamp: new Date(),
      type: 'error' as 'error' | 'text' | 'summary' | 'keypoints' | 'flashcards' | 'translation'
    });
    return;
  }

  // Prepare form data
  const formData = new FormData();
  formData.append('document_id', String(document_id));
  formData.append('question', String(userMessage));

  // Use makeAuthenticatedFormRequest for API call
  import('@/lib/api-utils').then(({ makeAuthenticatedFormRequest }) => {
    makeAuthenticatedFormRequest(`${API_URL}/api/document/chat`, formData)
      .then(async (response: any) => {
        if (!response.ok) {
          const errorText = await response.text();
          callback({
            id: `msg-${Date.now()}-ai`,
            content: `Error from chat API: ${errorText}`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'error'
          });
          return;
        }
        const data = await response.json();
        
        // Check if the response includes a task_id (async processing)
        if (data.success && data.task_id && data.status === 'processing') {
          console.log('🔄 Task started, polling for result:', data.task_id);
          // Start polling for the task result
          pollTaskStatus(data.task_id, callback);
          return;
        }
        
        // Handle synchronous response (if answer is immediately available)
        if (data.answer) {
          callback({
            id: `msg-${Date.now()}-ai`,
            content: data.answer,
            sender: 'ai',
            timestamp: new Date(),
            type: 'text',
            data
          });
          return;
        }
        
        // Fallback for unexpected response format
        callback({
          id: `msg-${Date.now()}-ai`,
          content: data.message || 'Received unexpected response format',
          sender: 'ai',
          timestamp: new Date(),
          type: 'error'
        });
      })
      .catch((err: any) => {
        callback({
          id: `msg-${Date.now()}-ai`,
          content: `Network or server error: ${err?.message || String(err)}`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'error'
        });
      });
  });
};

export const downloadMessageContent = (message: Message) => {
  let fileContent = '';
  let fileName = 'download.txt';
  let fileType = 'text/plain';
  
  switch (message.type) {
    case 'summary':
      fileContent = message.content;
      fileName = 'document-summary.txt';
      break;
    case 'keypoints':
      fileContent = message.content;
      fileName = 'key-points.txt';
      break;
    case 'flashcards':
      fileContent = message.content;
      fileName = 'flashcards.txt';
      break;
    case 'translation':
      fileContent = message.content;
      fileName = `translation-${message.data?.language || 'unknown'}.txt`;
      break;
    default:
      fileContent = message.content;
      fileName = 'ai-response.txt';
  }
  
  const blob = new Blob([fileContent], { type: fileType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return fileName;
};
