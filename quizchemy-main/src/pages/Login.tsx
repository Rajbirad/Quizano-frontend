import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isValidEmail, loginRateLimiter, sanitizeInput } from '@/utils/security';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    // Only redirect if we're not in a loading state and have a user
    if (user && !authLoading) {
      navigate('/app/dashboard', { replace: true });
    }
    // Clear loading state if we're not authenticated
    if (!user && !authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    setEmailError('');
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    if (!password.trim()) {
      setError("Please enter your password");
      return false;
    }
    
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Rate limiting check
    const clientId = `${email}-${navigator.userAgent}`;
    if (!loginRateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(loginRateLimiter.getRemainingTime(clientId) / 1000 / 60);
      setError(`Too many attempts. Please wait ${remainingTime} minutes before trying again.`);
      return;
    }
    
    setLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message === "Email not confirmed") {
          errorMessage = "Please check your email for the verification link. We've sent a new one to your inbox.";
          
          // Try to resend verification email
          await supabase.auth.resend({
            type: 'signup',
            email: sanitizedEmail,
          });
        } else if (error.message === "Invalid login credentials") {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes("too_many_requests")) {
          errorMessage = "Too many login attempts. Please wait before trying again.";
        }
        
        setError(errorMessage);
      } else if (data.user) {
        // Navigation will be handled by AuthContext
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        if (error.message.includes("rate_limit")) {
          toast({
            title: "Too many requests",
            description: "Please wait before requesting another password reset. Check your email for the previous reset link.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Password reset failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Password reset sent",
          description: "Check your email for password reset instructions"
        });
      }
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Google Sign In failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Google Sign In failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };


  return (
    <Layout>
     <div className="min-h-screen bg-slate-100 relative">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-20 pb-32">
          <div className="max-w-md mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome back</h1>
            <p className="text-primary-foreground/90 text-lg">
              Sign in to your Quizano account
            </p>
          </div>
        </div>
        
        {/* Login Card - Positioned to overlap header */}
        <div className="flex items-start justify-center px-4 -mt-16">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-xl rounded-xl overflow-hidden bg-white">
              <CardContent className="pt-8 px-8 pb-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign In</h2>
                  <p className="text-slate-600 text-sm">
                    Welcome back! Please sign in to your account
                  </p>
                </div>
                
                <form 
                  onSubmit={handleLogin} 
                  className="space-y-5">
                  {(error || emailError) && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                      {error || emailError}
                    </div>
                  )}
                
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={email} 
                      onChange={e => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }} 
                      className={`border-slate-300 focus:border-primary/50 transition-colors ${
                        emailError ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      required 
                      disabled={loading}
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1">
                        {emailError}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={handlePasswordChange} 
                        className="border-slate-300 focus:border-primary/50 pr-10 transition-colors" 
                        required 
                        disabled={loading}
                      />
                      <button 
                        type="button" 
                        onClick={togglePasswordVisibility} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                
                <div className="text-center text-sm">
                  <p className="text-slate-600">
                    Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign Up</Link>
                  </p>
                  <p className="text-slate-600 mt-2">
                    Forgot your password? <button onClick={handleForgotPassword} className="text-primary font-medium hover:underline">Reset it</button>
                  </p>
                </div>
                
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full absolute"></div>
                  <span className="relative bg-white px-2 text-sm text-slate-500">or continue with</span>
                </div>
                
                <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 border-slate-300 text-slate-700 hover:bg-slate-50">
                  <img src="/images/google-logo.png" alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </Button>
                
                <p className="text-xs text-center text-slate-500 mt-4">
                    By signing in I accept Company's{' '}
                    <Button variant="link" className="p-0 h-auto text-xs text-primary">Terms of Use</Button>
                    {' '}and{' '}
                    <Button variant="link" className="p-0 h-auto text-xs text-primary">Privacy Policy</Button>.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Login;