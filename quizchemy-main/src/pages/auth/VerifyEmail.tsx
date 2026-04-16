import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // If we have a valid user and they're confirmed, redirect to dashboard
        if (user?.email_confirmed_at) {
          sessionStorage.removeItem('justSignedUp');
          sessionStorage.removeItem('signupEmail');
          sessionStorage.removeItem('signupName');
          navigate('/app/dashboard', { replace: true });
          return;
        }

        // Check if we have tokens in the URL (coming from email verification)
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session with the tokens
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          // Get updated session to check verification status
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user?.email_confirmed_at) {
            sessionStorage.removeItem('justSignedUp');
            sessionStorage.removeItem('signupEmail');
            sessionStorage.removeItem('signupName');
            navigate('/app/dashboard', { replace: true });
            return;
          }
        }

        setVerifying(false);
      } catch (error) {
        console.error('Error verifying email:', error);
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [user, navigate]);

  const email = location.state?.email || sessionStorage.getItem('signupEmail');
  const message = location.state?.message || "Please verify your email to continue.";

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Verify Your Email</h2>
              <p className="text-slate-600">{message}</p>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm text-center text-slate-500">
                A verification link has been sent to:<br/>
                <span className="font-medium text-slate-700">{email}</span>
              </p>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      await supabase.auth.resend({
                        type: 'signup',
                        email: email,
                      });
                     
                    } catch (error) {
                      console.error('Error resending verification email:', error);
                    }
                  }}
                >
                  Resend verification email
                </Button>

                <Button 
                  variant="ghost"
                  className="w-full"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    sessionStorage.removeItem('justSignedUp');
                    sessionStorage.removeItem('signupEmail');
                    sessionStorage.removeItem('signupName');
                    navigate('/login', { replace: true });
                  }}
                >
                  Back to login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
