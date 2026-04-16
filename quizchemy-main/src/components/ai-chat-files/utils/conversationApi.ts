import { makeAuthenticatedRequest } from '@/lib/api-utils';

export interface ChatSession {
  conversation_id: string;
  document_id: string;
  document_name: string;
  first_question: string;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
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

export interface DocumentInfo {
  id: string;
  document_name: string;
  content_length: number;
  created_at: string;
  s3_key?: string;
  s3_bucket?: string;
}

export interface ConversationDetails {
  success: boolean;
  conversation_id: string;
  document: DocumentInfo;
  messages: ChatMessage[];
  message_count: number;
  created_at: string;
  last_message_at: string;
}

export interface SessionsResponse {
  success: boolean;
  sessions: ChatSession[];
  total: number;
  has_more: boolean;
  limit: number;
  offset: number;
}

/**
 * Fetch recent conversation sessions for the current user
 */
export async function fetchChatSessions(
  limit: number = 50,
  offset: number = 0,
  documentId?: string
): Promise<SessionsResponse> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  if (documentId) {
    params.append('document_id', documentId);
  }

  const url = `/api/document/chat/sessions?${params.toString()}`;

  const response = await makeAuthenticatedRequest(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chat sessions: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch full conversation history for a specific conversation
 */
export async function fetchConversation(
  conversationId: string
): Promise<ConversationDetails> {
  const url = `/api/document/chat/conversation/${conversationId}`;

  const response = await makeAuthenticatedRequest(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get presigned download URL for a document from S3
 */
export async function getPresignedDownloadUrl(
  documentId: string
): Promise<string> {
  const formData = new FormData();
  formData.append('document_id', documentId);

  const response = await makeAuthenticatedRequest('/api/document/generate-presigned-download-url', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to get presigned download URL: ${response.statusText}`);
  }

  const data = await response.json();
  return data.download_url;
}

/**
 * Fetch document file from S3 using document ID
 */
export async function fetchDocumentFromS3(
  documentId: string
): Promise<Blob> {
  // Get presigned download URL
  const downloadUrl = await getPresignedDownloadUrl(documentId);
  
  // Fetch file from S3
  const response = await fetch(downloadUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download file from S3: ${response.statusText}`);
  }
  
  return await response.blob();
}

/**
 * Delete a conversation by ID
 */
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const response = await makeAuthenticatedRequest(`/api/document/chat/conversation/${conversationId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`);
  }
}
