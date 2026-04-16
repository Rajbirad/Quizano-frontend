import { makeAuthenticatedRequest } from '@/lib/api-utils';

export interface AudioUploadResult {
  success: boolean;
  task_id?: string;
  audio_id?: string;
  message?: string;
  result?: {
    audio_id: string;
    s3_key?: string;
    processing_time: number;
    content_length?: number;
    transcription?: string;
    duration?: number;
    success?: boolean;
    message?: string;
  };
}

export interface AudioUploadStatusResponse {
  task_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  step?: string;
  message: string;
  result?: {
    audio_id: string;
    processing_time: number;
    s3_key?: string;
    content_length?: number;
    transcription?: string;
    duration?: number;
    success?: boolean;
    message?: string;
  };
  error?: string;
}

export interface AudioPresignedUrlResponse {
  upload_url: string;
  fields: Record<string, string>;
  document_id: string;
  s3_key: string;
  expires_at: string;
  max_file_size: number;
  bucket_name: string;
  correlation_id: string;
  language: string;
  message: string;
  next_step_endpoint: string;
  next_step_method: string;
  next_step_params: {
    s3_key: string;
    language: string;
  };
}

class AudioUploadService {
  async uploadFile(file: File, language: string = 'en', onProgress?: (progress: number) => void, forceNew: boolean = false): Promise<AudioUploadResult> {
    try {
      // Phase 1: Get presigned URL for upload
      console.log('📋 Phase 1: Getting audio upload URL...');
      const presignedData = await this.getPresignedUrl(file, language);

      // Phase 2: Upload directly to S3
      console.log('📤 Phase 2: Uploading audio directly to S3...', {
        uploadUrl: presignedData.upload_url,
        fileSize: file.size,
        fileType: file.type,
        s3Key: presignedData.s3_key
      });
      await this.uploadToS3(presignedData, file, onProgress);
      onProgress?.(50);

      // Phase 3: Notify backend that upload is complete and begin transcription
      console.log('✅ Phase 3: Initiating transcription...');
      const transcriptionResult = await this.startTranscription(presignedData, forceNew);

      return transcriptionResult;
    } catch (error) {
      console.error('Audio upload error:', error);
      throw error;
    }
  }

  private async getPresignedUrl(file: File, language: string): Promise<AudioPresignedUrlResponse> {
    try {
      // Ensure we have a valid content type
      const contentType = file.type || 
        (file.name.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' :
        file.name.toLowerCase().endsWith('.wav') ? 'audio/wav' :
        file.name.toLowerCase().endsWith('.m4a') ? 'audio/mp4' :
        file.name.toLowerCase().endsWith('.mp4') ? 'video/mp4' :
        'audio/mpeg');

      // Create FormData and append fields
      const formData = new FormData();
      formData.append('filename', file.name);
      formData.append('file_size', file.size.toString());
      formData.append('content_type', contentType);
      formData.append('language', language);

      console.log('📋 Requesting audio presigned URL with payload:', {
        filename: file.name,
        file_size: file.size,
        content_type: contentType,
        language
      });

      const { makeAuthenticatedFormRequest } = await import('@/lib/api-utils');
      const response = await makeAuthenticatedFormRequest('/api/audio/generate-upload-url', formData);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get presigned URL');
      }

      const data = await response.json();
      console.log('📋 Presigned URL response:', data);

      return data;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw error instanceof Error ? error : new Error('Failed to get presigned URL');
    }
  }

  private async uploadToS3(presignedData: AudioPresignedUrlResponse, file: File, onProgress?: (progress: number) => void): Promise<void> {
    try {
      console.log('🔍 uploadToS3 called with presignedData:', {
        uploadUrl: presignedData.upload_url,
        hasFields: !!presignedData.fields,
        fieldsType: typeof presignedData.fields,
        s3Key: presignedData.s3_key
      });

      if (!presignedData.upload_url) {
        throw new Error('Missing upload_url in presigned data');
      }

      if (!presignedData.fields || typeof presignedData.fields !== 'object') {
        throw new Error('Missing or invalid fields in presigned data');
      }

      const formData = new FormData();
      
      // Debug: Log all fields we're about to add
      console.log('🔍 S3 upload fields:', presignedData.fields);
      console.log('🔍 S3 key from response:', presignedData.s3_key);
      
      // Add all required fields from presigned response
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        console.log(`📝 Adding field: ${key} = ${value}`);
        formData.append(key, value as string);
      });
      
      // Add the file last (this is important for S3)
      console.log('📎 Adding file:', file.name);
      formData.append('file', file);

      // Debug: Log FormData contents
      console.log('📋 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, typeof value === 'string' ? value : `[File: ${(value as File).name}]`);
      }

      // Use fetch with CORS settings that match S3 bucket configuration
      const response = await fetch(presignedData.upload_url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit', // Important: Do not send credentials to S3
        headers: {
          'Accept': '*/*'  // Accept any content type in response
        }
      });

      // Check response status (S3 returns 204 No Content on success)
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `S3 audio upload failed: ${response.status}`;
        try {
          const text = await response.text();
          if (text) {
            errorMessage += ` - ${text}`;
          }
        } catch (e) {
          // Ignore error parsing failure
        }
        throw new Error(errorMessage);
      }

      console.log('✅ S3 upload successful');
      
      // Update progress and wait a moment for S3 to process the upload
      onProgress?.(50);
      
      // Add a small delay to ensure S3 has processed the upload
      console.log('⏳ Waiting for S3 to process the upload...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify file size
      if (file.size < 1024) { // Less than 1KB
        throw new Error('File too small to be valid audio: ' + file.size + ' bytes');
      }
    } catch (error) {
      console.error('S3 audio upload error:', error);
      throw error instanceof Error ? error : new Error('S3 audio upload failed');
    }
  }

  private async startTranscription(presignedData: AudioPresignedUrlResponse, forceNew: boolean = false): Promise<AudioUploadResult> {
    try {
      // Log the transcription request details
      console.log('🎵 Starting transcription with:', {
        endpoint: presignedData.next_step_endpoint,
        method: presignedData.next_step_method,
        params: presignedData.next_step_params,
        correlation_id: presignedData.correlation_id,
        bucket_name: presignedData.bucket_name
      });

      // Create FormData for transcription request
      const transcriptionFormData = new FormData();
      transcriptionFormData.append('s3_key', presignedData.next_step_params.s3_key);
      transcriptionFormData.append('language', presignedData.next_step_params.language);
      // Add correlation ID to help with debugging
      transcriptionFormData.append('correlation_id', presignedData.correlation_id);
      transcriptionFormData.append('force_new', forceNew.toString());
      
      console.log('📋 Transcription request form data:', {
        s3_key: presignedData.next_step_params.s3_key,
        language: presignedData.next_step_params.language,
        correlation_id: presignedData.correlation_id,
        bucket_name: presignedData.bucket_name
      });

      const { makeAuthenticatedFormRequest } = await import('@/lib/api-utils');
      const response = await makeAuthenticatedFormRequest(
        presignedData.next_step_endpoint,
        transcriptionFormData
      );

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        
        console.error('❌ Transcription request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          s3Key: presignedData.next_step_params.s3_key,
          correlationId: presignedData.correlation_id
        });
        
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Transcription initiation response:', data);

      // Handle success:false in a 200 response (e.g. insufficient credits)
      if (data.success === false) {
        const msg = data.message;
        let errorMessage: string;
        if (msg && typeof msg === 'object') {
          errorMessage = msg.message || JSON.stringify(msg);
        } else {
          errorMessage = typeof msg === 'string' ? msg : 'Transcription failed';
        }
        throw new Error(errorMessage);
      }

      return {
        success: true,
        task_id: data.task_id,
        audio_id: presignedData.document_id,
        result: {
          audio_id: presignedData.document_id,
          s3_key: presignedData.s3_key,
          processing_time: 0,
          content_length: presignedData.max_file_size,
          success: true
        }
      };
    } catch (error) {
      console.error('Error starting transcription:', error);
      throw error instanceof Error ? error : new Error('Failed to start transcription');
    }
  }

  async getUploadStatus(taskId: string): Promise<AudioUploadStatusResponse> {
    try {
      const response = await makeAuthenticatedRequest(`/api/task-status/${taskId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get task status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting upload status:', error);
      throw error instanceof Error ? error : new Error('Failed to get upload status');
    }
  }
}

export default new AudioUploadService();