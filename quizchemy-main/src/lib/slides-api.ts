// API functions for AI Slides functionality
import { streamTaskStatus } from '@/lib/task-stream';

// Get API base URL from environment or use relative path for proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Get the auth token from browser storage
 */
function getAuthToken(): string {
  // Check for manual token (for testing)
  const manualToken = localStorage.getItem('temp-auth-token');
  if (manualToken) {
    return manualToken;
  }
  
  // Try to get token from Supabase localStorage key
  const supabaseKey = Object.keys(localStorage).find(key => 
    key.startsWith('sb-') && key.includes('-auth-token')
  );
  
  if (supabaseKey) {
    try {
      const authData = JSON.parse(localStorage.getItem(supabaseKey) || '{}');
      if (authData.access_token) {
        return authData.access_token;
      }
    } catch (e) {
      console.warn('Failed to parse Supabase auth token:', e);
    }
  }
  
  // Fallback to environment variable
  return import.meta.env.VITE_API_TOKEN || "";
}

/**
 * Get headers with Bearer token authentication
 */
export function getAuthHeaders(includeContentType = false): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}

/**
 * Get full API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Extract PDF text from file
 */
export async function extractPdf(file: File): Promise<{ text: string; pageCount: number }> {
  const formData = new FormData();
  formData.append("pdf", file);
  
  try {
    const response = await fetch(getApiUrl("/api/extract-pdf"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = "Unable to read error response";
      }
      throw new Error(`API Error ${response.status}: ${errorText || "No error message"}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to extract PDF");
    }
    
    return {
      text: data.text,
      pageCount: data.pageCount,
    };
  } catch (error) {
    console.error("Extract PDF Error:", error);
    throw error;
  }
}

/**
 * Generate presentation outline
 */
export async function generateOutline(params: {
  content: string;
  slideCount: number;
  language: string;
}): Promise<{ outline: Array<{ title: string; bullets: string[] }> }> {
  const response = await fetch(getApiUrl("/api/generate-outline"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(params),
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to generate outline");
  }
  
  return { outline: data.outline };
}

/**
 * Generate presentation slides
 */
export async function generateSlides(params: {
  pdfText: string;
  slideCount: number;
  language: string;
  theme: string;
  contentDensity: string;
  outline?: Array<{ title: string; bullets?: string[] }>;
}, signal?: AbortSignal): Promise<{ slides: any[] }> {
  const response = await fetch(getApiUrl("/api/generate-presentation"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(params),
    signal,
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to generate slides");
  }
  
  return { slides: data.slides };
}

/**
 * Generate slides from text (for text and prompt tabs)
 */
export async function generateSlidesFromText(params: {
  pdfText: string;
  slideCount: number;
  language: string;
  theme: string;
  contentDensity?: string;
  outline?: Array<{ title: string; bullets?: string[] }>;
}): Promise<{ slides: any[] }> {
  const response = await fetch(getApiUrl("/api/generate-presentation-from-text"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      pdfText: params.pdfText,
      slideCount: params.slideCount,
      language: params.language,
      theme: params.theme,
      contentDensity: params.contentDensity,
      outline: params.outline,
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to generate slides from text");
  }
  
  return { slides: data.slides };
}

/**
 * Visual Slide Interface
 */
export interface VisualSlide {
  slideNumber: number;
  title: string;
  content: string;
  imageUrl: string;
  s3Key: string;
  s3Bucket: string;
  layout: string;
}

export interface VisualSlideResponse {
  success: boolean;
  slides: VisualSlide[];
  total_slides: number;
  correlation_id: string;
  processing_time: number;
  s3_urls: string[];
}

/**
 * Generate visual slides with AI-generated images
 */
/**
 * Poll task status until completion
 */
async function pollTaskStatus(taskId: string, onProgress?: (status: string) => void): Promise<VisualSlideResponse> {
  const event = await streamTaskStatus(taskId, {
    onProgress: (e) => onProgress?.(e.message || e.status),
  });
  return ((event as any).result ?? event) as VisualSlideResponse;
}

export async function generateVisualSlides(
  params: {
    pdf?: File;
    video?: File;
    prompt?: string;
    text?: string;
    websiteUrl?: string;
    youtubeUrl?: string;
    slideCount: number;
    style?: string;
    theme?: string;
    language?: string;
    contentType?: string;
  },
  onProgress?: (status: string) => void
): Promise<VisualSlideResponse> {
  const formData = new FormData();
  
  if (params.pdf) {
    formData.append('pdf', params.pdf);
  }
  if (params.video) {
    formData.append('video', params.video);
  }
  if (params.prompt) {
    formData.append('prompt', params.prompt);
  }
  if (params.text) {
    formData.append('text', params.text);
  }
  if (params.websiteUrl) {
    formData.append('websiteUrl', params.websiteUrl);
  }
  if (params.youtubeUrl) {
    formData.append('youtubeUrl', params.youtubeUrl);
  }
  formData.append('slideCount', params.slideCount.toString());
  
  const selectedStyleOrTheme = params.theme || params.style;
  if (selectedStyleOrTheme) {
    // Send both keys to support API variants expecting either field name.
    formData.append('style', selectedStyleOrTheme);
    formData.append('theme', selectedStyleOrTheme);
  }
  if (params.language) {
    formData.append('language', params.language);
  }
  if (params.contentType) {
    formData.append('contentType', params.contentType);
  }
  
  const response = await fetch(getApiUrl("/api/generate-visual-slides"), {
    method: "POST",
    headers: getAuthHeaders(), // Don't include Content-Type for FormData
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to generate visual slides");
  }
  
  // If response includes task_id, poll for completion
  if (data.task_id) {
    if (onProgress) {
      onProgress(`Processing: ${data.message || 'Generating slides...'}`);
    }
    return await pollTaskStatus(data.task_id, onProgress);
  }
  
  // Otherwise return direct response (backward compatibility)
  return data;
}
