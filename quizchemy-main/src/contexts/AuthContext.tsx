import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
}

const PROFILE_CACHE_KEY = 'auth-profile-cache';

const getCachedProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const buildFallbackProfile = (user: User): UserProfile => ({
  id: user.id,
  email: user.email || '',
  full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
  username:
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    user.email?.split('@')[0] ||
    null,
  avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(() => getCachedProfile());
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const setProfile = (nextProfile: UserProfile | null) => {
    setProfileState(nextProfile);
    try {
      if (nextProfile) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(nextProfile));
      else localStorage.removeItem(PROFILE_CACHE_KEY);
    } catch {
      // ignore storage failures
    }
  };

  const fetchProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    const fallbackProfile = buildFallbackProfile(currentUser);
    const cachedProfile = getCachedProfile();
    const mergedInitialProfile = cachedProfile?.id === currentUser.id
      ? {
          ...fallbackProfile,
          ...cachedProfile,
          full_name: cachedProfile.full_name || fallbackProfile.full_name,
          username: cachedProfile.username || fallbackProfile.username,
          avatar_url: cachedProfile.avatar_url || fallbackProfile.avatar_url,
        }
      : fallbackProfile;

    setProfile(mergedInitialProfile);
    setProfileLoading(true);

    try {
      const { data, error }: any = await supabase
        .from('user_profiles')
        .select('id, email, full_name, username, avatar_url')
        .eq('id' as any, currentUser.id as any)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        const typedData = data as UserProfile;
        setProfile({
          ...mergedInitialProfile,
          ...typedData,
          full_name: typedData.full_name || mergedInitialProfile.full_name,
          username: typedData.username || mergedInitialProfile.username,
          avatar_url: typedData.avatar_url || mergedInitialProfile.avatar_url,
          email: typedData.email || mergedInitialProfile.email,
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile(user);
  };

  useEffect(() => {
    const syncAuthState = async (nextSession: Session | null) => {
      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        setLoading(false);
        void fetchProfile(nextUser);
      } else {
        setProfile(null);
        setProfileLoading(false);
        setLoading(false);
      }
    };

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        await syncAuthState(session);
      } catch (error) {
        console.error('Session fetch error:', error);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        console.log('Auth state changed:', event, !!nextSession);
        await syncAuthState(nextSession);

        if (event === 'SIGNED_IN' && window.location.hash) {
          console.log('🔒 User signed in - clearing OAuth tokens from URL for security');
          setTimeout(() => {
            window.history.replaceState(null, '', window.location.pathname);
          }, 500);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }

      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileLoading(false);

      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    signOut,
    refreshProfile,
    setProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};