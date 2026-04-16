
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Testimonials } from '@/components/home/Testimonials';
import { RevolutionizeStudy } from '@/components/home/RevolutionizeStudy';
import { FAQ } from '@/components/home/FAQ';
import { CallToAction } from '@/components/home/CallToAction';
import { supabase } from '@/integrations/supabase/client';
import { LoadingTransition } from '@/components/ui/page-transition';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const hash = window.location.hash;
        
        // If there are OAuth tokens in URL, let Supabase process them first
        if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
          console.log('🔐 OAuth tokens detected - letting Supabase process authentication...');
          setIsProcessingOAuth(true);
          
          // Don't clear tokens immediately - let Supabase process them first
          // They will be cleared by AuthContext after successful authentication
          
          // Wait for authentication to complete
          const maxWaitTime = 5000; // Give more time for OAuth processing
          const startTime = Date.now();
          
          while (Date.now() - startTime < maxWaitTime) {
            if (user) {
              console.log('✅ OAuth authentication successful, redirecting to dashboard');
              navigate('/app/dashboard', { replace: true });
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          console.error('❌ OAuth authentication timeout');
          setIsProcessingOAuth(false);
        }
        
        // If user is already authenticated (not from OAuth), redirect to dashboard
        if (user && !isProcessingOAuth && !authLoading && !hash) {
          console.log('👤 User already authenticated, redirecting to dashboard');
          navigate('/app/dashboard', { replace: true });
        }
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setIsProcessingOAuth(false);
      }
    };

    if (!authLoading) {
      handleOAuthCallback();
    }
  }, [navigate, user, authLoading, isProcessingOAuth]);

  // Show loading state while processing authentication
  if (authLoading || isProcessingOAuth) {
    return (
      <LoadingTransition 
        isLoading={true} 
        loadingText={isProcessingOAuth ? "Completing sign-in..." : "Loading..."}
      >
        <div />
      </LoadingTransition>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className="flex-1 w-full mx-auto">
        <Hero />
        <WhyChooseUs />
        <HowItWorks />
        <RevolutionizeStudy />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </main>
      <footer className="py-4 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Quizano. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
