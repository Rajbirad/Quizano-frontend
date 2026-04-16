import { supabase } from '@/integrations/supabase/client';

export const testEmailConfiguration = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'testpassword123', // temporary password
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        data: {
          name: 'Test User'
        }
      }
    });

    if (error) {
      console.error('Test failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'Test email sent successfully. Check your inbox and spam folder.',
      data
    };
  } catch (error: any) {
    console.error('Test error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
