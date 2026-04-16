import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from 'lucide-react';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { email, message } = location.state || {};

  const resendVerification = async () => {
    try {
      // First check if email exists in session storage as backup
      const emailToUse = email || sessionStorage.getItem('signupEmail');
      
      if (!emailToUse) {
        toast({
          title: "Error",
          description: "No email address found. Please sign up again.",
          variant: "destructive"
        });
        cleanupAndRedirectToLogin();
        return;
      }

      // First try to get the user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, sign up again
      if (!session) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: emailToUse,
          password: sessionStorage.getItem('tempPassword') || '',
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          }
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }
      }

      // Now resend the verification email
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
      });

      if (resendError) {
        throw new Error(resendError.message);
      }

      toast({
        title: "Verification email sent",
        description: `A new verification link has been sent to ${emailToUse}. Please check your inbox and spam folder.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend verification",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Clean up signup session storage
      sessionStorage.removeItem('justSignedUp');
      sessionStorage.removeItem('signupEmail');
      sessionStorage.removeItem('signupName');
      
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  // Cleanup helper
  const cleanupAndRedirectToLogin = async () => {
    // Clear all signup-related data
    sessionStorage.removeItem('justSignedUp');
    sessionStorage.removeItem('signupEmail');
    sessionStorage.removeItem('signupName');
    
    try {
      // Force sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }

    // Redirect to login with replace to prevent back navigation
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    // Handle navigation when component mounts
    const storedEmail = sessionStorage.getItem('signupEmail');
    const justSignedUp = sessionStorage.getItem('justSignedUp');

    // Redirect to login if not coming from signup
    if (!justSignedUp || !storedEmail) {
      cleanupAndRedirectToLogin();
      return;
    }

    // Update state with stored email if needed
    if (!email && storedEmail) {
      navigate("", { 
        replace: true,
        state: { 
          email: storedEmail,
          message: "We've sent a verification link to your email. Please check your inbox to complete registration."
        }
      });
      return;
    }

    // Block back navigation
    const blockBackNavigation = (e: PopStateEvent) => {
      // Stop the default back behavior
      e.preventDefault();
      // Clean up and redirect to login
      cleanupAndRedirectToLogin();
    };

    // Prevent back navigation
    window.history.pushState(null, "", window.location.href);
    window.addEventListener('popstate', blockBackNavigation);

    // Remove the event listener when component unmounts
    return () => {
      window.removeEventListener('popstate', blockBackNavigation);
    };
  }, [email, navigate]);

  if (!email && !sessionStorage.getItem('signupEmail')) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            {message || `We've sent a verification link to ${email}`}
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or click below to resend.
          </p>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={resendVerification}
            >
              Resend verification email
            </Button>
            
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            You need to verify your email before accessing the application.
            After verification, you can log in again.
          </p>
        </div>
      </Card>
    </div>
  );
}
