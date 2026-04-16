import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(''); // Clear error when user types
  };
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Only redirect if user is verified and not coming from signup
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const justSignedUp = sessionStorage.getItem('justSignedUp');
      if (session?.user?.email_confirmed_at && !justSignedUp) {
        navigate('/app/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, validate email format
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        toast({
          title: "Weak password",
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Set a flag to indicate this is a fresh signup
      sessionStorage.setItem('justSignedUp', 'true');
      sessionStorage.setItem('signupEmail', email);
      sessionStorage.setItem('signupName', name);

      // Sign out any existing session first
      await supabase.auth.signOut();

      // Try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          data: {
            name: name
          }
        }
      });

      if (signUpError) {
        // Always check for existing user error first
        if (signUpError.message === 'User already registered') {
          setError('The email has already been taken.');
          sessionStorage.removeItem('justSignedUp');
          sessionStorage.removeItem('signupEmail');
          sessionStorage.removeItem('signupName');
          setLoading(false);
          return;
        }
        setError(signUpError.message);
        sessionStorage.removeItem('justSignedUp');
        sessionStorage.removeItem('signupEmail');
        sessionStorage.removeItem('signupName');
        setLoading(false);
        return;
      } 

      if (!signUpData || !signUpData.user) {
        setError('An error occurred during signup.');
        setLoading(false);
        return;
      }

      // Check if the response indicates the user already exists
      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        setError('The email has already been taken.');
        sessionStorage.removeItem('justSignedUp');
        sessionStorage.removeItem('signupEmail');
        sessionStorage.removeItem('signupName');
        setLoading(false);
        return;
      }

      // For a new signup, immediately redirect to verify-email
      navigate("/auth/verify-email", { 
        replace: true,  // Use replace to prevent going back
        state: { 
          email,
          message: "Please check your email to complete your registration."
        }
      });
      return;
      
      toast({
        title: "Unexpected error",
        description: "Failed to create account properly",
        variant: "destructive"
      });
      setLoading(false);
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          title: "Google Sign Up failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Google Sign Up failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  return <Layout>
      <div className="min-h-screen bg-slate-100 relative">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-20 pb-32">
          <div className="max-w-md mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Get Started</h1>
            <p className="text-primary-foreground/90 text-lg">
              Create your Quizano account
            </p>
          </div>
        </div>
        
        {/* Signup Card - Positioned to overlap header */}
        <div className="flex items-start justify-center px-4 -mt-16">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-xl rounded-xl overflow-hidden bg-white">
              <CardContent className="pt-8 px-8 pb-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign Up</h2>
                  <p className="text-slate-600 text-sm">
                    Let's get started with your 30 days free trial
                  </p>
                </div>
              
              <form onSubmit={handleSignup} className="space-y-5">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Name</Label>
                  <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} className="border-slate-300 focus:border-primary/50" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" value={email}                     onChange={handleEmailChange} className="border-slate-300 focus:border-primary/50" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="border-slate-300 focus:border-primary/50 pr-10" required />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
                
                <div className="text-center text-sm">
                  <p className="text-slate-600">
                    Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log In</Link>
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
                  By signing up to create an account I accept Company's{' '}
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
    </Layout>;
};
export default Signup;