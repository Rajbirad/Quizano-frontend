import { makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';
import { API_CONFIG } from '@/config/api';
import { streamTaskStatus } from '@/lib/task-stream';

export interface TTSGenerateParams {
  text?: string;
  file?: File;
  url?: string;
  voice?: string;
}

export interface TTSMetadata {
  voice?: string;
  model?: string;
  speed?: number;
}

export interface TTSResponse {
  success?: boolean;
  task_id?: string;
  tts_id?: string;
  correlation_id?: string;
  status?: string;
  audio_url?: string;
  audio_file?: string;
  audio?: string;
  duration?: number;
  message?: string;
  error?: string;
  check_status_url?: string;
  content_source?: string;
  estimated_time?: string;
  metadata?: TTSMetadata;
  result?: {
    audio_url?: string;
    audio_file?: string;
    audio?: string;
    duration?: number;
  };
}

/**
 * Generates speech from text, file, or URL using the TTS API.
 * When a file is provided, uses a 3-phase presigned S3 upload flow.
 */
export const generateTTS = async (params: TTSGenerateParams): Promise<TTSResponse> => {
  const voice = params.voice || 'alloy';

  // ── File upload: presigned S3 flow ─────────────────────────────────────────
  if (params.file) {
    const file = params.file;

    // Phase 1: Get presigned URL
    console.log('📝 TTS Phase 1: Getting presigned upload URL...');
    const contentType = file.type || 'application/octet-stream';
    const presignFormData = new FormData();
    presignFormData.append('filename', file.name);
    presignFormData.append('content_type', contentType);
    presignFormData.append('file_size', file.size.toString());
    presignFormData.append('purpose', 'tts-file');

    const presignResponse = await makeAuthenticatedFormRequest('/api/upload/presigned-url', presignFormData);
    if (!presignResponse.ok) {
      const errText = await presignResponse.text();
      throw new Error(errText || 'Failed to get upload URL');
    }
    const presignData = await presignResponse.json();
    console.log('📋 TTS Presigned URL response:', presignData);

    // Phase 2: Upload directly to S3
    console.log('📤 TTS Phase 2: Uploading file to S3...');
    const s3FormData = new FormData();
    Object.entries(presignData.fields as Record<string, string>).forEach(([key, value]) => {
      s3FormData.append(key, value);
    });
    s3FormData.append('file', file);

    const s3Response = await fetch(presignData.upload_url, {
      method: 'POST',
      body: s3FormData,
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Accept': '*/*' },
    });

    if (!s3Response.ok) {
      let msg = `S3 upload failed: ${s3Response.status}`;
      try { const t = await s3Response.text(); if (t) msg += ` - ${t}`; } catch {}
      throw new Error(msg);
    }
    console.log('✅ TTS S3 upload successful');

    await new Promise(resolve => setTimeout(resolve, 500));

    // Phase 3: Trigger TTS generation with s3_key
    console.log('⚙️ TTS Phase 3: Triggering generation with s3_key...');
    const nextEndpoint = presignData.next_step_endpoint || API_CONFIG.ENDPOINTS.TTS_GENERATE;
    const generateFormData = new FormData();
    generateFormData.append('file_s3_key', presignData.s3_key);
    generateFormData.append('voice', voice);

    const generateResponse = await makeAuthenticatedFormRequest(nextEndpoint, generateFormData, 'POST');

    if (!generateResponse.ok) {
      const errorData = await generateResponse.json().catch(() => ({}));
      throw new Error((errorData as any).message || (errorData as any).error || 'Failed to generate TTS');
    }

    const data = await generateResponse.json() as TTSResponse;
    console.log('✅ TTS Generation started (file):', data);
    return data;
  }

  // ── Text / URL: send directly ───────────────────────────────────────────────
  console.log('📝 Sending TTS Generation Request:', {
    voice,
    hasText: !!params.text,
    hasUrl: !!params.url,
  });

  const formData = new FormData();
  if (params.text) formData.append('text', params.text);
  if (params.url)  formData.append('url', params.url);
  formData.append('voice', voice);

  const response = await makeAuthenticatedFormRequest(
    API_CONFIG.ENDPOINTS.TTS_GENERATE,
    formData,
    'POST'
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error((errorData as any).message || (errorData as any).error || 'Failed to generate TTS');
  }

  const data = await response.json() as TTSResponse;
  console.log('✅ TTS Generation Request Successful:', data);
  return data;
};

/**
 * Polls the task status endpoint until TTS generation is complete
 * @param taskId - The task ID returned from generateTTS
 * @param maxAttempts - Maximum number of polling attempts
 * @param interval - Interval between polling attempts in milliseconds
 * @returns Promise with the completed TTS data
 */
export const pollTTSStatus = async (
  taskId: string,
): Promise<TTSResponse> => {
  console.log('🔄 Starting TTS task stream for:', taskId);
  const event = await streamTaskStatus(taskId);
  const statusData = event as any;
  const ttsData: TTSResponse = {
    ...statusData,
    audio_url: statusData.audio_url || statusData.result?.audio_url,
    audio_file: statusData.audio_file || statusData.result?.audio_file,
    audio: statusData.audio || statusData.result?.audio,
    duration: statusData.duration || statusData.result?.duration,
  };
  if (ttsData.audio_url || ttsData.audio_file || ttsData.audio) {
    console.log('✅ TTS Generation Complete via SSE!');
    return ttsData;
  }
  throw new Error('No audio URL in completed TTS result');
};

/**
 * Generates TTS with polling and returns the final audio data
 * @param params - TTS generation parameters
 * @returns Promise with completed TTS data
 */
export const generateTTSWithPolling = async (params: TTSGenerateParams): Promise<TTSResponse> => {
  try {
    // Initial generation request
    const response = await generateTTS(params);

    // If response contains task_id, poll for completion
    if (response.task_id) {
      console.log('\n🔄 Starting TTS Generation Polling...');
      console.log(`📋 Task ID: ${response.task_id}`);
      console.log(`⏱️  Estimated Time: ${response.estimated_time || 'Unknown'}`);
      if (response.content_source) {
        console.log(`📄 Content Source: ${response.content_source}`);
      }

      const completedResult = await pollTTSStatus(response.task_id);
      return completedResult;
    }

    // If audio_url/audio_file is available immediately, return it
    if (response.audio_url || response.audio_file || response.audio) {
      console.log('⚡ TTS Generated Immediately (no polling needed)');
      return response;
    }

    // Return response even if we don't have audio yet
    console.log('⚠️ No task_id or audio_url in response, returning as-is');
    return response;
  } catch (error) {
    console.error('❌ TTS Generation with Polling Failed:', error);
    throw error;
  }
};

/**
 * Validates text input for TTS generation
 * @param text - Text to validate
 * @returns Error message or null if valid
 */
export const validateTTSText = (text: string): string | null => {
  if (!text || !text.trim()) {
    return 'Please enter text to convert to speech';
  }

  if (text.length > 10000) {
    return 'Text is too long. Maximum 10,000 characters allowed.';
  }

  return null;
};

/**
 * Validates file for TTS generation
 * @param file - File to validate
 * @returns Error message or null if valid
 */
export const validateTTSFile = (file: File): string | null => {
  const validTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  const allowedExtensions = ['.pdf', '.txt', '.docx', '.doc'];

  if (!validTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return 'Please upload a PDF, TXT, DOC, or DOCX file';
  }

  if (file.size > 50 * 1024 * 1024) {
    return 'File size must be less than 50MB';
  }

  return null;
};

/**
 * Validates URL for TTS generation
 * @param url - URL to validate
 * @returns Error message or null if valid
 */
export const validateTTSUrl = (url: string): string | null => {
  if (!url || !url.trim()) {
    return 'Please enter a URL';
  }

  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};
