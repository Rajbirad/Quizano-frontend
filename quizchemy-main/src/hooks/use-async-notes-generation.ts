import { useState } from 'react';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';
import { streamTaskStatus } from '@/lib/task-stream';

const UNIFIED_ENDPOINT = '/api/notes/generate';
// Adaptive polling: slow at first, faster once it's likely near completion
const POLL_SLOW_MS = 10000;        // 10 s — while still early in processing
const POLL_FAST_MS = 3000;         // 3 s  — once "nearing completion"
const POLL_SLOW_ATTEMPTS = 9;      // first 9 polls × 10 s = 90 s slow phase
const POLL_FAST_MAX = 80;          // then up to 80 × 3 s = 240 s fast phase
const MAX_POLL_ATTEMPTS = POLL_SLOW_ATTEMPTS + POLL_FAST_MAX; // ~330 s total (~5.5 min)

interface TaskStatusResponse {
  task_id: string;
  status: 'processing' | 'completed' | 'failed';
  meta?: {
    success?: boolean;
    message?: string;
    document_title?: string;
    sections?: any[];
    metadata?: Record<string, any>;
    correlation_id?: string;
  };
  result?: {
    success: boolean;
    structured_content?: any;
    notes?: string;
    message?: string;
    meta?: {
      success?: boolean;
      message?: string;
      document_title?: string;
      sections?: any[];
      metadata?: Record<string, any>;
      correlation_id?: string;
    };
  };
  message?: string;
  error?: string;
}

const buildSectionFromText = (text: string) => ({
  sections: [
    {
      title: 'Generated Notes',
      type: 'section',
      children: [
        {
          title: 'Summary',
          type: 'topic',
          children: [
            {
              type: 'paragraph',
              content: text,
            },
          ],
        },
      ],
    },
  ],
});

const normalizeNotesResponse = (payload: any) => {
  const directSections = payload?.meta?.sections || payload?.result?.meta?.sections;
  if (Array.isArray(directSections) && directSections.length > 0) {
    const meta = payload?.meta || payload?.result?.meta || {};
    return {
      sections: directSections,
      document_title: meta.document_title,
      metadata: meta.metadata,
      message: meta.message || payload?.message,
      correlation_id: meta.correlation_id || payload?.correlation_id,
      task_id: payload?.task_id,
      source_type: meta?.metadata?.source,
      content_source: meta.document_title || meta?.metadata?.filename,
    };
  }

  const structured =
    payload?.result?.structured_content ||
    payload?.structured_content ||
    payload?.result ||
    payload;

  if (structured?.sections && Array.isArray(structured.sections)) {
    return structured;
  }

  const textNotes = payload?.result?.notes || payload?.notes;
  if (typeof textNotes === 'string' && textNotes.trim()) {
    return buildSectionFromText(textNotes.trim());
  }

  return null;
};

export const useAsyncNotesGeneration = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pollTaskStatus = async (taskId: string): Promise<TaskStatusResponse> => {
    return streamTaskStatus(taskId, {
      onProgress: (e) => setProgress(e.message || 'Processing...'),
    }) as Promise<TaskStatusResponse>;
  };

  const callUnifiedApi = async (formData: FormData, forceNew = false): Promise<any> => {
    setIsProcessing(true);
    setError(null);
    setProgress('Generating...');

    if (forceNew) {
      formData.append('force_new', 'true');
    }

    try {
      const response = await makeAuthenticatedFormRequest(UNIFIED_ENDPOINT, formData);

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.message || errData?.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('📡 Notes generation response:', data);

      if (data?.success === false) {
        throw new Error(data.message || 'Notes generation failed');
      }

      // If already completed (e.g. cached response), skip polling entirely
      if (data?.status === 'completed' || data?.cached === true) {
        console.log('⚡ Cached/instant response — skipping poll');
        const result = normalizeNotesResponse(data);
        if (!result) throw new Error('No notes content received');
        setProgress('Notes generation completed!');
        return result;
      }

      // Async task — poll for completion
      if (data?.task_id) {
        setProgress('Processing...');
        const statusData = await pollTaskStatus(data.task_id);
        const result = normalizeNotesResponse(statusData);
        if (!result) throw new Error('No notes content received');
        setProgress('Notes generation completed!');
        console.log('🎯 Notes generated successfully');
        return result;
      }

      // Synchronous response fallback
      const result = normalizeNotesResponse(data);
      if (!result) throw new Error('No notes content received');
      setProgress('Notes generation completed!');
      return result;
    } catch (err) {
      console.error('❌ Notes generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
      setProgress('');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNotesFromFile = async (file: File, forceNew = false): Promise<any> => {
    console.log('� Phase 1: Getting presigned upload URL for notes file...');
    setIsProcessing(true);
    setError(null);
    setProgress('Preparing upload...');

    try {
      // ── Phase 1: Get presigned URL ──────────────────────────────────────────
      const contentType = file.type ||
        (file.name.toLowerCase().endsWith('.pdf')  ? 'application/pdf' :
         file.name.toLowerCase().endsWith('.doc')  ? 'application/msword' :
         file.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
         file.name.toLowerCase().endsWith('.txt')  ? 'text/plain' :
         file.name.toLowerCase().endsWith('.md')   ? 'text/markdown' :
         'application/octet-stream');

      const presignFormData = new FormData();
      presignFormData.append('filename', file.name);
      presignFormData.append('content_type', contentType);
      presignFormData.append('file_size', file.size.toString());
      presignFormData.append('purpose', 'notes-file');

      const presignResponse = await makeAuthenticatedFormRequest('/api/upload/presigned-url', presignFormData);
      if (!presignResponse.ok) {
        const errText = await presignResponse.text();
        throw new Error(errText || 'Failed to get upload URL');
      }
      const presignData = await presignResponse.json();
      console.log('📋 Presigned URL response:', presignData);

      // ── Phase 2: Upload directly to S3 ─────────────────────────────────────
      console.log('📤 Phase 2: Uploading file to S3...');
      setProgress('Uploading file...');

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
      console.log('✅ S3 upload successful');

      // Small delay to ensure S3 has processed the upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ── Phase 3: Trigger notes generation ──────────────────────────────────
      console.log('⚙️ Phase 3: Triggering notes generation with s3_key...');
      setProgress('Generating notes...');

      const genFormData = new FormData();
      genFormData.append('file_s3_key', presignData.next_step_params.file_s3_key);
      if (forceNew) genFormData.append('force_new', 'true');

      const genResponse = await makeAuthenticatedFormRequest(
        presignData.next_step_endpoint || UNIFIED_ENDPOINT,
        genFormData
      );

      if (!genResponse.ok) {
        const errData = await genResponse.json().catch(() => null);
        throw new Error(errData?.message || errData?.detail || `HTTP error! status: ${genResponse.status}`);
      }

      const data = await genResponse.json();
      console.log('📡 Notes generation response:', data);

      if (data?.success === false) throw new Error(data.message || 'Notes generation failed');

      if (data?.status === 'completed' || data?.cached === true) {
        const result = normalizeNotesResponse(data);
        if (!result) throw new Error('No notes content received');
        setProgress('Notes generation completed!');
        return result;
      }

      if (data?.task_id) {
        setProgress('Processing...');
        const statusData = await streamTaskStatus(data.task_id, {
          onProgress: (e) => setProgress(e.message || 'Processing...'),
        });
        const result = normalizeNotesResponse(statusData);
        if (!result) throw new Error('No notes content received');
        setProgress('Notes generation completed!');
        return result;
      }

      const result = normalizeNotesResponse(data);
      if (!result) throw new Error('No notes content received');
      setProgress('Notes generation completed!');
      return result;
    } catch (err) {
      console.error('❌ Notes file generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
      setProgress('');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNotesFromText = async (text: string, forceNew = false): Promise<any> => {
    console.log('🔐 Submitting text for notes generation');
    const formData = new FormData();
    formData.append('text', text);
    return callUnifiedApi(formData, forceNew);
  };

  const generateNotesFromYoutube = async (youtubeUrl: string, forceNew = false): Promise<any> => {
    console.log('🔐 Submitting YouTube URL for notes generation');
    const formData = new FormData();
    formData.append('youtube_url', youtubeUrl);
    return callUnifiedApi(formData, forceNew);
  };

  const generateNotesFromVideo = async (file: File, forceNew = false): Promise<any> => {
    console.log('🔐 Submitting video for notes generation');
    const formData = new FormData();
    formData.append('video_file', file);
    return callUnifiedApi(formData, forceNew);
  };

  return {
    generateNotesFromFile,
    generateNotesFromText,
    generateNotesFromYoutube,
    generateNotesFromVideo,
    isProcessing,
    progress,
    error,
    setError
  };
};