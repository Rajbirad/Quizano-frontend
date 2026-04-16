import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const handlePasswordRecovery = async () => {
      // Check URL parameters first
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const emailParam = searchParams.get('email');

      if (type === 'recovery' && accessToken && refreshToken) {
        setIsValidToken(true);
        if (emailParam) {
          setEmail(emailParam);
        }
        
        // Set the session for password recovery
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired.",
            variant: "destructive"
          });
          navigate('/login');
        }
      } else {
        // Check if we have an existing session and if it's a recovery session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.recovery_sent_at) {
          setIsValidToken(true);
          setEmail(session.user.email || '');
        } else {
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired.",
            variant: "destructive"
          });
          navigate('/login');
        }
      }
    };

    handlePasswordRecovery();
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password updated successfully",
          description: "Your password has been reset. You can now sign in with your new password."
        });
        // Sign out the user after password reset to ensure clean state
        await supabase.auth.signOut();
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="py-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-16rem)]">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Invalid Reset Link</h2>
            <p className="text-slate-600 mb-6">This password reset link is invalid or has expired.</p>
            <Button onClick={() => navigate('/login')}>Back to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="py-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-16rem)]">
        <div className="max-w-md mx-auto relative">
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-white">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Reset Your Password</h2>
                <p className="text-slate-600 mt-2 text-sm">
                  Enter your new password below
                </p>
              </div>
              
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="border-slate-300 focus:border-primary/50" 
                    required 
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your new password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="border-slate-300 focus:border-primary/50 pr-10" 
                      required 
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      onClick={togglePasswordVisibility} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm your new password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className="border-slate-300 focus:border-primary/50 pr-10" 
                      required 
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      onClick={toggleConfirmPasswordVisibility} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </Button>
                
                <div className="text-center text-sm">
                  <p className="text-slate-600">
                    Remember your password? <Button variant="link" onClick={() => navigate('/login')} className="p-0 h-auto text-primary font-medium">Sign In</Button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;