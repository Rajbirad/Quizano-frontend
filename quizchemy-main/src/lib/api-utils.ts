import { supabase } from '@/integrations/supabase/client';
import http from 'http';
import https from 'https';

// Environment configuration
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000';
export const API_BASE_URL = isDevelopment ? 'https://127.0.0.1:8000' : API_URL;
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:8080';

// URL paths configuration
export const URL_PATHS = {
  QUIZ_PREVIEW: (id: string) => `${APP_URL}/quiz-preview/${id}`,
  QUIZ_EMBED: (id: string) => `${APP_URL}/embed/quiz/${id}`
};

/**
 * Validate JWT token format
 */
const validateJWTFormat = (token: string): boolean => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('❌ Invalid JWT: Expected 3 parts, got', parts.length);
    return false;
  }
  
  try {
    // Try to decode header and payload
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('✅ JWT Format Valid:', {
      algorithm: header.alg,
      type: header.typ,
      audience: payload.aud,
      subject: payload.sub,
      expires: new Date(payload.exp * 1000).toISOString()
    });
    
    return true;
  } catch (e) {
    console.error('❌ Invalid JWT: Cannot decode parts', e);
    return false;
  }
};

/**
 * Makes an authenticated API request to the backend
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise<Response>
 */
export const makeAuthenticatedRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  // Handle URL formatting for the proxy
  if (url.startsWith('http')) {
    // Convert absolute URLs to relative paths for the proxy
    try {
      const urlObj = new URL(url);
      url = urlObj.pathname + urlObj.search + urlObj.hash;
    } catch (e) {
      console.error('Invalid URL:', url);
      throw new Error('Invalid URL format');
    }
  }

  // Ensure the URL starts with a single slash
  url = url.startsWith('/') ? url : `/${url}`;
  
  // Remove any existing /api prefixes first
  url = url.replace(/^\/api\/+/, '/');
  url = url.replace(/\/api\/+/g, '/');
  
  // Add the single /api prefix
  url = url.startsWith('/api/') ? url : `/api${url}`;

  console.log('🔐 Making request to:', url);
  
  // Log request details
  console.log('📝 Request details:', {
    method: options.method || 'GET',
    url,
    isFormData: options.body instanceof FormData,
    hasBody: !!options.body
  });
  
  if (error || !session?.access_token) {
    console.error('❌ Authentication failed:', error?.message);
    throw new Error('Authentication required. Please sign in.');
  }

  // Set up headers with proper CORS and authentication
  const headers = new Headers({
    'Accept': 'application/json, text/plain, */*',
    'Authorization': `Bearer ${session.access_token}`,
    'X-User-ID': session.user?.id || '',
    'Origin': window.location.origin
  });

  // Handle Content-Type header based on request body
  if (options.body instanceof FormData) {
    // For FormData, remove Content-Type to let browser set it with proper boundary
    headers.delete('Content-Type');
    
    // Debug log the FormData contents
    console.log('🔍 Request FormData contents:');
    for (const [key, value] of options.body.entries()) {
      if (value instanceof File) {
        console.log(`- ${key}: [File] name=${value.name}, size=${value.size}, type=${value.type}`);
      } else {
        console.log(`- ${key}: ${value}`);
      }
    }

  } else if (typeof options.body === 'string' || options.body instanceof URLSearchParams) {
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
  } else if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Merge with any custom headers from options, except Content-Type for FormData
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (value && !(options.body instanceof FormData && key.toLowerCase() === 'content-type')) {
        headers.set(key, value);
      }
    });
  }

  // Set up fetch options with proper CORS settings
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors',
    signal: undefined  // Remove any abort signal
  };
  
  // Let's also decode the JWT payload to see what's inside
  if (session?.access_token) {
    try {
      const tokenParts = session.access_token.split('.');
      if (tokenParts.length === 3) {
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🔍 JWT Header:', {
          alg: header.alg,
          typ: header.typ,
          kid: header.kid
        });
        console.log('🔍 JWT Payload Preview:', {
          sub: payload.sub,
          aud: payload.aud,
          exp: payload.exp,
          iat: payload.iat,
          iss: payload.iss,
          role: payload.role,
          email: payload.email,
          app_metadata: payload.app_metadata,
          user_metadata: payload.user_metadata
        });
        console.log('🔍 Full JWT Token (first 100 chars):', session.access_token.substring(0, 100) + '...');
      }
    } catch (e) {
      console.log('❌ Could not decode JWT payload:', e);
    }
  }
  
  if (error || !session?.access_token) {
    console.error('❌ Authentication failed:', error?.message);
    throw new Error('Authentication required. Please sign in.');
  }

  // Validate JWT format before sending
  if (!validateJWTFormat(session.access_token)) {
    throw new Error('Invalid JWT token format');
  }

  // Update headers with authentication and required fields
  headers.set('Authorization', `Bearer ${session.access_token}`);
  headers.set('X-User-ID', session.user?.id || '');
  headers.set('X-Supabase-Token', session.access_token);
  headers.set('Accept', 'application/json');

  console.log('📡 Making authenticated request to:', url);
  console.log('🔍 Request Headers:', {
    'Authorization': `Bearer ${session.access_token.substring(0, 50)}...`,
    'X-User-ID': session.user?.id,
    'X-Supabase-Token': `${session.access_token.substring(0, 50)}...`,
    'Content-Type': options.headers?.['Content-Type'] || 'not set'
  });
  
  // Show exactly what we're sending to the API
  console.log('📦 Full Token Being Sent:', {
    tokenLength: session.access_token.length,
    tokenSegments: session.access_token.split('.').length,
    firstSegment: session.access_token.split('.')[0],
    tokenStart: session.access_token.substring(0, 100),
    tokenEnd: session.access_token.substring(session.access_token.length - 50)
  });

  // Check if SSL certificate has been accepted
  const checkSSLCertificate = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        credentials: 'include'
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Development environment checks and warnings
  // When in development and making requests to localhost, ensure we're using HTTP
  if (isDevelopment && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    url = url.replace('https://', 'http://');
  }

  try {
    // Make the request without timeout
    const response = await fetch(url, fetchOptions);

    // Log response details in development
    if (isDevelopment) {
      console.log('📡 Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    // Handle error responses
    if (!response.ok) {
      const responseClone = response.clone();
      let errorMessage = `HTTP Error ${response.status}`;
      let errorDetails = '';
      
      try {
        // Try to read the response content regardless of content-type
        const errorText = await responseClone.text();
        
        // Try to parse as JSON if it looks like JSON
        if (errorText.startsWith('{') || errorText.startsWith('[')) {
          try {
            const errorData = JSON.parse(errorText);
            const rawMsg = errorData.message || errorData.error;
            if (rawMsg && typeof rawMsg === 'object') {
              // e.g. { error: 'insufficient_credits', message: '...', required: 42, available: 20 }
              errorMessage = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
            } else {
              errorMessage = rawMsg || errorText || errorMessage;
            }
            if (errorData.detail) {
              errorDetails = `\nDetails: ${errorData.detail}`;
            }
          } catch (e) {
            // If JSON parsing fails, use the text
            errorMessage = errorText || errorMessage;
          }
        } else if (errorText) {
          // Use plain text error if available
          errorMessage = errorText;
        }
      } catch (e) {
        console.error('Failed to read error response:', e);
        if (response.status === 500) {
          errorMessage = 'Internal Server Error: The server encountered an error while processing the request.';
          errorDetails = '\nPlease ensure the backend server is running and properly configured.';
        }
      }
      
      // Add helpful context for specific error codes
      switch (response.status) {
        case 500:
          errorMessage = `${errorMessage}${errorDetails}\nRequest URL: ${url}\nRequest Method: ${options.method || 'GET'}\nPlease check if the backend server at http://127.0.0.1:8000 is running and accessible.`;
          break;
        case 413:
          errorMessage = `${errorMessage}\nThe file might be too large. Please try a smaller file.`;
          break;
        case 415:
          errorMessage = `${errorMessage}\nUnsupported file type. Please make sure you're uploading a valid PDF file.`;
          break;
        case 422:
          errorMessage = `${errorMessage}${errorDetails}\nPlease check the file content and try again.`;
          break;
      }
      
      // Log complete error information for debugging
      console.error('Request failed:', {
        status: response.status,
        statusText: response.statusText,
        url,
        method: options.method || 'GET',
        errorMessage,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const apiError = new Error(errorMessage) as any;
      apiError.__isHandledApiError = true;
      throw apiError;
    }

    // For successful responses, return as is - let the caller handle the response body
    return response;
  } catch (error: any) {
    // Re-throw errors we already handled above (they have clean user-facing messages)
    if (error.__isHandledApiError) throw error;

    // Enhance network/unexpected errors in development
    const message = isDevelopment
      ? `API Request Failed: ${error.message}\nURL: ${url}\nMake sure your backend is running on http://127.0.0.1:8000`
      : `Request failed: ${error.message}`;

    throw new Error(message);
  }
};

/**
 * Makes an authenticated JSON API request with error handling and response parsing
 * @param url - The API endpoint URL
 * @param data - The data to send as JSON
 * @param method - HTTP method (default: POST)
 * @returns Promise<T> The parsed JSON response
 */
export const makeAuthenticatedJSONRequest = async <T = any>(
  url: string,
  data: any,
  method: string = 'POST'
): Promise<T> => {
  const response = await makeAuthenticatedRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server error:', errorText);
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
};

/**
 * Makes an authenticated FormData API request
 * @param url - The API endpoint URL
 * @param formData - The FormData to send
 * @param method - HTTP method (default: POST)
 * @returns Promise<Response>
 */
export async function makeAuthenticatedFormRequest(
  url: string,
  formData: FormData,
  method: string = 'POST'
): Promise<Response> {
  // Use the existing makeAuthenticatedRequest which handles CORS properly
  return makeAuthenticatedRequest(url, {
    method,
    body: formData,
    headers: {
      'Accept': 'application/json, text/plain, */*'
    }
  });
}

/**
 * Alternative authentication using user email/ID for backends that don't support JWT
 */
export const makeSimpleAuthenticatedRequest = async (
  url: string,
  data: any,
  method: string = 'POST'
): Promise<Response> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    throw new Error('Authentication required. Please sign in.');
  }

  // Add user info to the request data instead of using JWT
  const requestData = {
    ...data,
    user_id: session.user.id,
    user_email: session.user.email,
  };

  console.log('🔐 Simple Auth Request:', { 
    user_id: session.user.id,
    user_email: session.user.email,
    url 
  });

  // Try different authorization approaches
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.id}`, // Try user ID as token
      'X-User-ID': session.user.id,
      'X-User-Email': session.user.email || '',
    },
    body: JSON.stringify(requestData),
  });
};

export interface BatchFlashcardUpdate {
  cards: {
    id: string;
    front: string;
    back: string;
    hint?: string;
  }[];
}

export async function updateFlashcards(flashcardSetId: string, data: BatchFlashcardUpdate) {
  return makeAuthenticatedJSONRequest(`${API_URL}/api/flashcards/${flashcardSetId}/update`, data, 'PUT');
}

/**
 * Try with API key approach (no authentication)
 */
export const makeUnauthenticatedRequest = async (
  url: string,
  data: any,
  method: string = 'POST'
): Promise<Response> => {
  console.log('🔓 Making unauthenticated request to:', url);

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const responseClone = response.clone();
    let errorMessage = `HTTP Error ${response.status}`;
      
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await responseClone.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } else {
        const errorText = await responseClone.text();
        if (errorText) errorMessage = errorText;
      }
    } catch (e) {
      console.error('Failed to read error response:', e);
    }

    throw new Error(errorMessage);
  }

  return response;
};