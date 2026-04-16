import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MindMapItem {
  id: string;
  title: string;
  content: any;
  content_source: string;
  created_at: string;
  user_id: string;
  share_id?: string;
  complexity_level?: string;
  content_length?: number;
  processing_time?: number;
  is_public: boolean;
}

const CACHE_KEY = 'recent_mindmaps_cache';

export const useRecentMindMaps = () => {
  const { user } = useAuth();
  const [mindmaps, setMindMaps] = useState<MindMapItem[]>(() => {
    // Load cached data immediately on mount
    if (!user) return [];
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${user.id}`);
      if (cached) {
        const { data } = JSON.parse(cached);
        return data || [];
      }
    } catch (err) {
      console.warn('Failed to load cached mindmaps:', err);
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentMindMaps = useCallback(async () => {
    if (!user) return;

    // Only show loading spinner if we don't have cached data
    const hasCachedData = mindmaps.length > 0;
    if (!hasCachedData) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('mindmaps')
        .select('id, title, content, content_source, created_at, user_id, share_id, complexity_level, content_length, processing_time, is_public')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (supabaseError) {
        throw supabaseError;
      }

      setMindMaps(data || []);
      // Cache the fresh data
      try {
        localStorage.setItem(`${CACHE_KEY}_${user.id}`, JSON.stringify({
          data: data || [],
          timestamp: Date.now()
        }));
      } catch (err) {
        console.warn('Failed to cache mindmaps:', err);
      }
    } catch (err: any) {
      console.error('Error fetching recent mindmaps:', err);
      if (!hasCachedData) {
        setError(err.message || 'Failed to load mindmaps');
      }
      // Don't clear mindmaps on error - keep showing cached data
    } finally {
      setLoading(false);
    }
  }, [user, mindmaps.length]);

  useEffect(() => {
    fetchRecentMindMaps();
  }, [fetchRecentMindMaps]);

  return {
    mindmaps,
    loading,
    error,
    refetch: fetchRecentMindMaps,
  };
};
