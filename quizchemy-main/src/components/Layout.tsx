
import React, { useState, useEffect } from 'react';
import { Nav } from './Nav';
import { AuthenticatedLayout } from './layout/AuthenticatedLayout';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Update localStorage for backward compatibility
        localStorage.setItem('isLoggedIn', session ? 'true' : 'false');
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      localStorage.setItem('isLoggedIn', session ? 'true' : 'false');
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Always use simple layout if hideNav is true
  if (hideNav) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 w-full mx-auto">
          {children}
        </main>
      </div>
    );
  }

  // If user is logged in and nav should be shown, use AuthenticatedLayout
  if (session && user) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // If user is not logged in and nav should be shown, use marketing layout
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className="flex-1 w-full mx-auto">
        {children}
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
