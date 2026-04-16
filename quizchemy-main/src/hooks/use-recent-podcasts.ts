import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeAuthenticatedRequest } from '@/lib/api-utils';

interface PodcastItem {
  id: string;
  title: string;
  description: string;
  language?: string;
  num_hosts?: number;
  estimated_duration_minutes?: number;
  cover_image_url?: string;
  audio_url?: string;
  has_audio?: boolean;
  has_cover?: boolean;
  created_at: string;
  language_name?: string; // For backward compatibility
}

interface PodcastsResponse {
  success: boolean;
  podcasts: PodcastItem[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

const CACHE_KEY = 'recent_podcasts_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useRecentPodcasts = () => {
  const { user } = useAuth();
  const [podcasts, setPodcasts] = useState<PodcastItem[]>(() => {
    // Load cached data immediately on mount
    if (!user) return [];
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${user.id}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Show cached data regardless of age (will refresh in background)
        return data || [];
      }
    } catch (err) {
      console.warn('Failed to load cached podcasts:', err);
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchRecentPodcasts = useCallback(async () => {
    if (!user) return;

    // Only show loading spinner if we don't have cached data
    const hasCachedData = podcasts.length > 0;
    if (!hasCachedData) {
      setLoading(true);
    }
    setError(null);

    try {
      // Call backend API to get podcasts with presigned URLs
      const response = await makeAuthenticatedRequest('/api/podcasts?page=1&page_size=10', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch podcasts');
      }

      const data: PodcastsResponse = await response.json();
      
      if (data.success && data.podcasts) {
        setPodcasts(data.podcasts);
        // Cache the fresh data
        try {
          localStorage.setItem(`${CACHE_KEY}_${user.id}`, JSON.stringify({
            data: data.podcasts,
            timestamp: Date.now()
          }));
        } catch (err) {
          console.warn('Failed to cache podcasts:', err);
        }
      } else if (!hasCachedData) {
        setPodcasts([]);
      }
    } catch (err: any) {
      console.error('Error fetching recent podcasts:', err);
      if (!hasCachedData) {
        setError(err.message || 'Failed to load podcasts');
      }
      // Don't clear podcasts on error - keep showing cached data
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [user, podcasts.length]);

  useEffect(() => {
    fetchRecentPodcasts();
  }, [fetchRecentPodcasts]);

  return {
    podcasts,
    loading,
    error,
    refetch: fetchRecentPodcasts,
  };
};
