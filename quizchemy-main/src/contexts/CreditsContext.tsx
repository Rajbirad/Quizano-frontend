import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { makeAuthenticatedRequest } from '@/lib/api-utils';

interface CreditsBalance {
  ai_podcast?: { balance: number; unlimited: boolean };
  ai_detection?: { balance: number; unlimited: boolean };
  ai_paraphraser?: { balance: number; unlimited: boolean };
  ai_mindmap?: { balance: number; unlimited: boolean };
  ai_slides?: { balance: number; unlimited: boolean };
  ai_infographic?: { balance: number; unlimited: boolean };
  ai_diagram?: { balance: number; unlimited: boolean };
  qa_generator?: { balance: number; unlimited: boolean };
  flashcards?: { balance: number; unlimited: boolean };
  quiz?: { balance: number; unlimited: boolean };
  notes?: { balance: number; unlimited: boolean };
  video_summarizer?: { balance: number; unlimited: boolean };
  audio_transcription?: { balance: number; unlimited: boolean };
  image_transcription?: { balance: number; unlimited: boolean };
  chat_files?: { balance: number; unlimited: boolean };
  presentations?: { balance: number; unlimited: boolean };
}

interface CreditsContextValue {
  credits: CreditsBalance | null;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  updateCredits: (newCredits: Partial<CreditsBalance>) => void;
}

const CreditsContext = createContext<CreditsContextValue | undefined>(undefined);

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<CreditsBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef<number>(0);

  const fetchCredits = useCallback(async (force = false) => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    // Cache for 30 seconds unless forced
    const now = Date.now();
    if (!force && lastFetchRef.current > 0 && (now - lastFetchRef.current) < 30000) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/user/credits', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setCredits(data);
        lastFetchRef.current = now;
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshCredits = useCallback(async () => {
    await fetchCredits(true);
  }, [fetchCredits]);

  const updateCredits = useCallback((newCredits: Partial<CreditsBalance>) => {
    setCredits(prev => prev ? { ...prev, ...newCredits } : newCredits as CreditsBalance);
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [user?.id]); // Scope to user ID to avoid re-fetching on auth object reference changes

  return (
    <CreditsContext.Provider value={{ credits, loading, refreshCredits, updateCredits }}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within CreditsProvider');
  }
  return context;
};
