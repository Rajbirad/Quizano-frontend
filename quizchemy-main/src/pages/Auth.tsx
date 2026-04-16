import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
const Auth = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isSignIn, setIsSignIn] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignIn) {
      // Handle sign in
    } else {
      // Handle sign up
      toast({
        title: "Account created!",
        description: "Your account has been created successfully."
      });
    }
    navigate('/dashboard');
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleGoogleSignIn = () => {
    // Here we would typically integrate with a auth provider's Google sign-in
    toast({
      title: "Google Sign In",
      description: "Please integrate an auth provider to enable Google sign-in."
    });
  };
  return <Layout>
      <div className="py-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-16rem)]">
        <div className="max-w-md mx-auto relative">
          
          
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-white">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
                {!isSignIn && <p className="text-slate-600 mt-2 text-sm">
                    Let's get started with your 30 days free trial
                  </p>}
              </div>
              
              <form onSubmit={handleAuth} className="space-y-5">
                {!isSignIn && <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">Name</Label>
                    <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} className="border-slate-300 focus:border-primary/50" required={!isSignIn} />
                  </div>}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className="border-slate-300 focus:border-primary/50" required />
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
                
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800">
                  {isSignIn ? 'Sign In' : 'Sign Up'}
                </Button>
                
                <div className="text-center text-sm">
                  {isSignIn ? <p className="text-slate-600">
                      Don't have an account? <Button variant="link" className="p-0 h-auto text-primary font-medium" onClick={() => setIsSignIn(false)}>Sign Up</Button>
                    </p> : <p className="text-slate-600">
                      Already have an account? <Button variant="link" className="p-0 h-auto text-primary font-medium" onClick={() => setIsSignIn(true)}>Log In</Button>
                    </p>}
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
                  By signing {isSignIn ? 'in' : 'up'} {!isSignIn && 'to create an account'} I accept Company's{' '}
                  <Button variant="link" className="p-0 h-auto text-xs text-primary">Terms of Use</Button>
                  {' '}and{' '}
                  <Button variant="link" className="p-0 h-auto text-xs text-primary">Privacy Policy</Button>.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>;
};
export default Auth;
