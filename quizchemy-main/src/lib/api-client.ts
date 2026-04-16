import { supabase } from '@/integrations/supabase/client';

// Use relative URLs for API endpoints to work with Vite's proxy
import { supabase } from '@/integrations/supabase/client';

// Use relative paths for proxy to work
export const API_BASE_URL = '/api';

// Types
export interface FlashcardCreate {
  title: string;
  cards: Array<{
    front: string;
    back: string;
    hint?: string;
  }>;
}

export interface FlashcardResponse {
  id: string;
  title: string;
  cards: Array<{
    id: string;
    front: string;
    back: string;
    hint?: string;
    difficulty?: string;
    created_at?: string;
    frontMedia?: {
      type: 'image' | 'video' | 'youtube';
      url: string;
    };
    backMedia?: {
      type: 'image' | 'video' | 'youtube';
      url: string;
    };
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Makes an authenticated request with proper error handling
 */
export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null
): Promise<ApiResponse<T>> {
  try {
    // Get current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      // Try to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshedSession) {
        throw new Error('Authentication required. Please sign in.');
      }
      return makeAuthenticatedRequest(endpoint, method, data);
    }

    // Ensure endpoint starts with /
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Prepare request options with proper CORS settings
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      credentials: 'include',
      mode: 'cors'
    };

    // Add body for non-GET requests
    if (method !== 'GET' && method !== 'HEAD' && data) {
      requestOptions.body = JSON.stringify(data);
    }

    console.log(`Making ${method} request to:`, url);
    console.log('Request options:', {
      method,
      headers: requestOptions.headers,
      body: data ? JSON.stringify(data) : undefined
    });

    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Parse the response
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = null;
    }

    // Handle errors
    if (!response.ok) {
      const errorMessage = responseData?.error || responseData?.message || `HTTP error! status: ${response.status}`;
      console.error('API Error:', {
        status: response.status,
        url,
        error: errorMessage
      });
      return {
        success: false,
        error: errorMessage
      };
    }

    // Return success response
    return {
      success: true,
      data: responseData
    };
  } catch (error: any) {
    console.error('Request failed:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }
  
  return response;
}
