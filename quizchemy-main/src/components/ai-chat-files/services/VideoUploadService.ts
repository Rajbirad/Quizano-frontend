import { apiRequest } from '@/lib/api-request';

export interface VideoPresignedUrlResponse {
  success: boolean;
  presigned_url: string | null;
  presigned_data: Record<string, string> | null;
  video_id: string;
  s3_key: string;
  expires_at?: string;
  max_file_size?: number;
  bucket_name?: string;
  // Duplicate/cached video fields
  duplicate_detected?: boolean;
  cached?: boolean;
  ai_chat_suggestions?: string[];
  upload_instructions?: {
    skip_upload?: boolean;
    reason?: string;
    message?: string;
  };
  existing_video?: {
    id: string;
    filename: string;
    ai_chat_suggestions?: string[];
  };
}

export interface VideoUploadStatusResponse {
  task_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  step?: string;
  message: string;
  result?: {
    video_id: string;
    processing_time: number;
    chunks_created: number;
    embeddings_created: number;
    ai_chat_suggestions?: string[];
    success?: boolean;
    s3_key?: string;
    content_length?: number;
    transcript?: string;
    duration?: number;
    message?: string;
  };
  error?: string;
}

export interface VideoUploadResult {
  success: boolean;
  task_id?: string;
  video_id?: string;
  message?: string;
  result?: {
    video_id: string;
    ai_chat_suggestions?: string[];
    s3_key?: string;
    processing_time: number;
    content_length?: number;
    embeddings_created: number;
    transcript?: string;
    duration?: number;
    success?: boolean;
    message?: string;
  };
}

class VideoUploadService {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<VideoUploadResult> {
    try {
      // Phase 1: Get presigned URL from backend
      console.log('🚀 Phase 1: Getting video presigned URL...');
      const presignedData = await this.getPresignedUrl(file);
      onProgress?.(10);

      // Check if this is a duplicate/cached video
      if (presignedData.duplicate_detected || presignedData.upload_instructions?.skip_upload) {
        console.log('✅ Using cached video data, skipping upload phases');
        onProgress?.(100);
        
        return {
          success: true,
          video_id: presignedData.video_id,
          message: presignedData.upload_instructions?.message || 'Video already exists, using cached data',
          result: {
            video_id: presignedData.video_id,
            ai_chat_suggestions: presignedData.ai_chat_suggestions || [],
            s3_key: presignedData.s3_key,
            processing_time: 0,
            content_length: 0,
            embeddings_created: 0,
            success: true
          }
        };
      }

      // Phase 2: Upload directly to S3 (bypasses backend completely)
      console.log('📤 Phase 2: Uploading video directly to S3...', {
        url: presignedData.presigned_url,
        fields: presignedData.presigned_data,
        fileSize: file.size,
        fileType: file.type
      });
      await this.uploadToS3(presignedData, file, onProgress);
      onProgress?.(50);

      // Phase 3: Notify backend that upload is complete
      console.log('✅ Phase 3: Notifying backend of video completion...');
      const processingResponse = await this.notifyUploadComplete(presignedData.s3_key, presignedData.video_id);
      onProgress?.(60);

      // Phase 4: Monitor processing status
      console.log('🔄 Phase 4: Monitoring video processing status...');
      let status: VideoUploadStatusResponse;
      do {
        await new Promise(resolve => setTimeout(resolve, 2000));
        status = await this.getUploadStatus(processingResponse.task_id);
        
        if (status.progress) {
          // Map progress 0-100 to remaining 60-100
          const mappedProgress = 60 + (status.progress * 0.4);
          onProgress?.(Math.round(mappedProgress));
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Video processing failed');
        }
      } while (status.status === 'processing');

      onProgress?.(100);

      return {
        success: true,
        task_id: processingResponse.task_id,
        video_id: status.result?.video_id || presignedData.video_id,
        message: status.message,
        result: status.result
      };

    } catch (error) {
      console.error('❌ Video upload failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getPresignedUrl(file: File): Promise<VideoPresignedUrlResponse> {
    try {
      console.log('📋 Requesting video presigned URL with payload:', {
        filename: file.name,
        file_size: file.size,
        content_type: file.type || 'video/mp4',
        video_name: file.name.split('.')[0],
        force_new_processing: false
      });

      const response = await apiRequest('/api/video/generate-presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          file_size: file.size,
          content_type: file.type || 'video/mp4',
          video_name: file.name.split('.')[0],
          force_new_processing: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Presigned URL request failed:', response.status, errorText);
        throw new Error(`Failed to get presigned URL: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Presigned URL response:', responseData);

      // Validate response structure
      if (!responseData.success) {
        console.error('❌ API returned success: false');
        throw new Error('API returned error response');
      }

      // Check for duplicate/cached video case
      if (responseData.duplicate_detected || responseData.upload_instructions?.skip_upload) {
        console.log('🔄 Duplicate video detected, using cached data');
        return responseData; // Return the cached response with video_id and ai_chat_suggestions
      }

      // For new uploads, validate presigned URL structure
      if (!responseData.presigned_url || !responseData.presigned_data) {
        console.error('❌ Invalid presigned URL response structure:', responseData);
        throw new Error('Invalid presigned URL response: missing presigned_url or presigned_data');
      }

      return responseData;
    } catch (error) {
      console.error('Failed to get video presigned URL:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get video presigned URL');
    }
  }

  private async uploadToS3(presignedData: VideoPresignedUrlResponse, file: File, onProgress?: (progress: number) => void): Promise<void> {
    try {
      console.log('🔍 uploadToS3 called with presignedData:', {
        hasPresignedUrl: !!presignedData.presigned_url,
        hasPresignedData: !!presignedData.presigned_data,
        presignedDataType: typeof presignedData.presigned_data,
        presignedData: presignedData.presigned_data
      });

      if (!presignedData.presigned_url) {
        throw new Error('Missing presigned_url in presigned data');
      }

      if (!presignedData.presigned_data || typeof presignedData.presigned_data !== 'object') {
        throw new Error('Missing or invalid presigned_data in presigned data');
      }

      const formData = new FormData();
      
      // Debug: Log all fields we're about to add
      console.log('🔍 Presigned data fields:', presignedData.presigned_data);
      console.log('🔍 S3 key from response:', presignedData.s3_key);
      
      // Check if 'key' field is missing and add it first if needed
      if (!presignedData.presigned_data.key && presignedData.s3_key) {
        console.log('⚠️ Adding missing key field from s3_key:', presignedData.s3_key);
        formData.append('key', presignedData.s3_key);
      }
      
      // Add all required fields from presigned response
      Object.entries(presignedData.presigned_data).forEach(([key, value]) => {
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
      const response = await fetch(presignedData.presigned_url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit', // Important: Do not send credentials to S3
        headers: {
          'Accept': '*/*'  // Accept any content type in response
        }
      });

      // Check response status
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `S3 video upload failed: ${response.status}`;
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

      // Update progress to completion
      onProgress?.(50);

    } catch (error) {
      console.error('S3 video upload error:', error);
      throw error instanceof Error ? error : new Error('S3 video upload failed');
    }
  }

  private async notifyUploadComplete(s3Key: string, videoId: string, forceNewProcessing = false) {
    try {
      const response = await apiRequest('/api/video/notify-upload-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          s3_key: s3Key,
          video_id: videoId,
          force_new_processing: forceNewProcessing
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to notify video upload complete:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to notify video upload completion');
    }
  }

  async getUploadStatus(taskId: string): Promise<VideoUploadStatusResponse> {
    try {
      const response = await apiRequest(`/api/video/upload-status/${taskId}`, {
        method: 'GET'
      });

      const data = await response.json();
      return data as VideoUploadStatusResponse;
    } catch (error) {
      console.error('Failed to get video upload status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to check video upload status');
    }
  }
}

export default VideoUploadService;