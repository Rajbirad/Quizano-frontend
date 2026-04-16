import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from Supabase (handles OAuth tokens automatically)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          
          toast({
            title: "Authentication failed",
            description: error.message,
            variant: "destructive"
          });

          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        if (session) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Store authentication state
          localStorage.setItem('isLoggedIn', 'true');
          
          toast({
            title: "Welcome!",
            description: "You have been signed in successfully."
          });

          // Redirect to dashboard after a brief success message
          setTimeout(() => {
            navigate('/app/dashboard');
          }, 1000);
        } else {
          // No session found, something went wrong
          setStatus('error');
          setMessage('No authentication session found.');
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        
        toast({
          title: "Authentication failed",
          description: "An unexpected error occurred",
          variant: "destructive"
        });

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    // Small delay to ensure URL processing is complete
    const timer = setTimeout(handleAuthCallback, 100);
    
    return () => clearTimeout(timer);
  }, [navigate, toast]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo or Brand */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Quizano</h1>
          </div>
          
          {/* Status Icon */}
          <div className="mb-6 flex justify-center">
            {getStatusIcon()}
          </div>
          
          {/* Status Message */}
          <h2 className={`text-lg font-semibold mb-2 ${getStatusColor()}`}>
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          
          <p className="text-slate-600 text-sm mb-6">
            {message}
          </p>
          
          {/* Progress bar for loading */}
          {status === 'loading' && (
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: '60%' }}
              ></div>
            </div>
          )}
          
          {/* Error action */}
          {status === 'error' && (
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Return to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
