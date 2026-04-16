import { supabase } from '@/integrations/supabase/client';

const API_URL = import.meta.env.VITE_API_URL || 'https://127.0.0.1:8000';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Get current session
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session?.access_token) {
    throw new Error('Please sign in to access this feature');
  }

  // Prepare headers
  const headers = {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('API request failed:', {
      endpoint,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
