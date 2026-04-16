import { API_URL } from '@/lib/api-utils';
import { apiRequest } from '@/lib/api-request';
import { supabase } from '@/integrations/supabase/client';

export interface PresignedUrlResponse {
  upload_url: string;
  fields: Record<string, string>;
  document_id: string;
  s3_key: string;
  expires_at: string;
  max_file_size: number;
  bucket_name: string;
}

export interface UploadStatusResponse {
  task_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  step?: string;
  message: string;
  result?: {
    document_id: string;
    processing_time: number;
    chunks_created: number;
    embeddings_created: number;
    ai_chat_suggestions?: string[];
    success?: boolean;
    s3_key?: string;
    content_length?: number;
    message?: string;
  };
  error?: string;
}

export interface UploadResult {
  success: boolean;
  task_id?: string;
  document_id?: string;
  message?: string;
  result?: {
    document_id: string;
    ai_chat_suggestions: string[];
    s3_key: string;
    processing_time: number;
    content_length: number;
    embeddings_created: number;
    success: boolean;
    message: string;
  };
}

class DirectUploadService {
  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    try {
      // Phase 1: Get presigned URL from backend
      console.log('🚀 Phase 1: Getting presigned URL...');
      const presignedData = await this.getPresignedUrl(file);
      onProgress?.(10);

      // Phase 2: Upload directly to S3 (bypasses backend completely)
      console.log('📤 Phase 2: Uploading directly to S3...', {
        url: presignedData.upload_url,
        fields: presignedData.fields,
        fileSize: file.size,
        fileType: file.type
      });
      await this.uploadToS3(presignedData, file, onProgress);
      onProgress?.(50);

      // Phase 3: Notify backend that upload is complete
      console.log('✅ Phase 3: Notifying backend of completion...');
      const processingResponse = await this.notifyUploadComplete(presignedData.s3_key, presignedData.document_id);
      onProgress?.(60);

      // Phase 4: Monitor processing status
      console.log('🔄 Phase 4: Monitoring processing status...');
      let status: UploadStatusResponse;
      do {
        await new Promise(resolve => setTimeout(resolve, 2000));
        status = await this.getUploadStatus(processingResponse.task_id);
        
        if (status.progress) {
          // Map progress 0-100 to remaining 60-100
          const mappedProgress = 60 + (status.progress * 0.4);
          onProgress?.(Math.round(mappedProgress));
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Processing failed');
        }
      } while (status.status === 'processing');

      onProgress?.(100);

      return {
        success: true,
        task_id: processingResponse.task_id,
        document_id: status.result?.document_id || presignedData.document_id,
        message: status.message,
        result: status.result
      };

    } catch (error) {
      console.error('❌ Upload failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getPresignedUrl(file: File): Promise<PresignedUrlResponse> {
    try {
      const response = await apiRequest('/api/document/generate-presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          file_size: file.size,
          document_name: file.name.split('.')[0]
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to get presigned URL:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get presigned URL');
    }
  }

  private async uploadToS3(presignedData: PresignedUrlResponse, file: File, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const formData = new FormData();
      
      // Add all required fields from presigned response in the exact order received
      // This is important as S3 policy conditions are order-sensitive
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        console.log(`📝 Appending field: ${key} = ${value}`);
        formData.append(key, value);
      });
      
      // Add the file last (this is required by S3)
      formData.append('file', file);

      console.log('📤 Uploading to S3:', {
        url: presignedData.upload_url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Use fetch without custom headers - let the browser set the correct Content-Type with boundary
      const response = await fetch(presignedData.upload_url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit' // Important: Do not send credentials to S3
      });

      // Check response status
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `S3 upload failed: ${response.status}`;
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

      // Update progress to completion
      onProgress?.(50);

    } catch (error) {
      console.error('S3 upload error:', error);
      throw error instanceof Error ? error : new Error('S3 upload failed');
    }
  }

  private async notifyUploadComplete(s3Key: string, documentId: string, forceNewProcessing = false) {
    try {
      const response = await apiRequest('/api/document/notify-upload-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          s3_key: s3Key,
          document_id: documentId,
          force_new_processing: forceNewProcessing
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to notify upload complete:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to notify upload completion');
    }
  }

  async getUploadStatus(taskId: string): Promise<UploadStatusResponse> {
    try {
      const response = await apiRequest(`/api/document/upload-status/${taskId}`, {
        method: 'GET'
      });

      const data = await response.json();
      return data as UploadStatusResponse;
    } catch (error) {
      console.error('Failed to get upload status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to check upload status');
    }
  }
}

export default DirectUploadService;