import { supabase } from '@/integrations/supabase/client';

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get session for authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session?.access_token) {
    throw new Error('Authentication required. Please sign in.');
  }

  // Make sure we're using relative path
  const url = endpoint.startsWith('http') ? 
    endpoint.replace(/^https?:\/\/[^/]+/, '') : 
    endpoint;

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

export const apiFormRequest = async (
  endpoint: string,
  formData: FormData,
  method: string = 'POST'
): Promise<Response> => {
  return apiRequest(endpoint, {
    method,
    body: formData
  });
};
