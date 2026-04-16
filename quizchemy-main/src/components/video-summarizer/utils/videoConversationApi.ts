import { makeAuthenticatedRequest, makeAuthenticatedFormRequest } from '@/lib/api-utils';

export interface VideoChatSession {
  conversation_id: string;
  video_id: string;
  video_name: string;
  first_question: string;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
}

export interface VideoChatMessage {
  id: string;
  question: string;
  answer: string | null;
  timestamp: string;
  relevance_score: number | null;
  context_chunks_used: number;
  source_info: any;
  processing_time_ms: number | null;
  metadata: any;
}

export interface VideoInfo {
  id: string;
  video_name: string;
  content_length: number;
  created_at: string;
  file_type: string;
  s3_key?: string;
  s3_bucket?: string;
  video_url?: string;
  duration?: number;
  transcript?: string;
  summary?: any;
}

export interface VideoConversationDetails {
  success: boolean;
  conversation_id: string;
  video: VideoInfo;
  messages: VideoChatMessage[];
  message_count: number;
  created_at: string;
  last_message_at: string;
}

export interface VideoSessionsResponse {
  success: boolean;
  sessions: VideoChatSession[];
  total: number;
  has_more: boolean;
  limit: number;
  offset: number;
}

/**
 * Fetch recent video conversation sessions for the current user
 */
export async function fetchVideoChatSessions(
  limit: number = 50,
  offset: number = 0,
  videoId?: string
): Promise<VideoSessionsResponse> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  if (videoId) {
    params.append('video_id', videoId);
  }

  const url = `/api/video/chat/sessions?${params.toString()}`;

  const response = await makeAuthenticatedRequest(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video chat sessions: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch full video conversation history for a specific conversation
 */
export async function fetchVideoConversation(
  conversationId: string
): Promise<VideoConversationDetails> {
  const url = `/api/video/chat/conversation/${conversationId}`;

  const response = await makeAuthenticatedRequest(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video conversation: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get presigned download URL for a video from S3
 */
export async function getVideoPresignedDownloadUrl(
  videoId: string
): Promise<string> {
  const formData = new FormData();
  formData.append('video_id', videoId);

  const response = await makeAuthenticatedFormRequest('/api/video/generate-presigned-download-url', formData);

  if (!response.ok) {
    throw new Error(`Failed to get video presigned download URL: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('📥 Received presigned URL response:', data);
  return data.download_url;
}

/**
 * Fetch video file from S3 using video ID
 */
export async function fetchVideoFromS3(
  videoId: string
): Promise<Blob> {
  console.log('📥 Fetching video from S3:', videoId);
  
  // Get presigned download URL
  const downloadUrl = await getVideoPresignedDownloadUrl(videoId);
  console.log('📥 Got presigned URL, downloading video...');
  
  // Fetch file from S3
  const response = await fetch(downloadUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download video from S3: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  console.log('✅ Video downloaded from S3:', blob.size, 'bytes');
  
  return blob;
}
