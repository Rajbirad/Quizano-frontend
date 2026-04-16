import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'recent_activities';
const CACHE_DURATION = 5 * 60 * 1000;

interface Activity {
  id: string;
  type: 'flashcard_set' | 'quiz' | 'document' | 'ai_chat' | 'study_session';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  data: any;
}

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false); // Only show loading for initial load if no cache
  const [refreshing, setRefreshing] = useState(false); // For background updates

  const fetchAndUpdateCache = useCallback(async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: flashcardSets } = await supabase
        .from('flashcard_sets_normalized')
        .select('*')
        // @ts-ignore - temporary fix for type issue
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: quizzes } = await supabase
        .from('quizzes_normalized')
        .select('*')
        // @ts-ignore - temporary fix for type issue
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const flashcardActivities = (flashcardSets || []).map((set: any) => ({
        id: `flashcard_${set.id}`,
        type: 'flashcard_set' as const,
        title: set.title || 'Untitled Flashcard Set',
        description: `Created flashcard set with ${set.total_cards || 0} cards`,
        timestamp: set.created_at,
        icon: 'layers',
        data: set
      }));

      const quizActivities = (quizzes || []).map((quiz: any) => ({
        id: `quiz_${quiz.id}`,
        type: 'quiz' as const,
        title: quiz.title || 'Untitled Quiz',
        description: `Created quiz with ${quiz.total_questions || 0} questions`,
        timestamp: quiz.created_at,
        icon: 'help-circle',
        data: quiz
      }));

      const allActivities = [...flashcardActivities, ...quizActivities];
      const sortedActivities = allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(sortedActivities);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: sortedActivities,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadActivities = async () => {
      // First, try to load from cache immediately
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // Always show cached data immediately for better UX
          setActivities(data);
          setLoading(false);
          
          // If cache is fresh, we're done
          if (Date.now() - timestamp < CACHE_DURATION) {
            return;
          }
          // If cache is stale, refresh in background
          await fetchAndUpdateCache(true);
          return;
        } catch (error) {
          console.error('Error parsing cached activities:', error);
        }
      }
      
      // No cache found, show loading and fetch fresh data
      setLoading(true);
      await fetchAndUpdateCache(false);
    };

    loadActivities();
  }, [fetchAndUpdateCache]);

  const fetchActivities = useCallback(async () => {
    await fetchAndUpdateCache(true); // Background refresh for manual calls
  }, [fetchAndUpdateCache]);

  const deleteActivity = useCallback(async (activity: Activity) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let deleteResult;
      
      if (activity.type === 'flashcard_set') {
        // Delete flashcard set - clean the ID by removing any prefix
        const cleanId = activity.id.replace(/^flashcard_/, '');
        deleteResult = await supabase
          .from('flashcard_sets_normalized')
          .delete()
          // @ts-ignore - temporary fix for type issue
          .eq('id', cleanId)
          // @ts-ignore - temporary fix for type issue
          .eq('user_id', user.id);
      } else if (activity.type === 'quiz') {
        // Delete quiz - clean the ID by removing any prefix
        const cleanId = activity.id.replace(/^quiz_/, '');
        deleteResult = await supabase
          .from('quizzes_normalized')
          .delete()
          // @ts-ignore - temporary fix for type issue
          .eq('id', cleanId)
          // @ts-ignore - temporary fix for type issue
          .eq('user_id', user.id);
      }

      if (deleteResult?.error) {
        throw deleteResult.error;
      }

      // Update local state immediately
      setActivities(prev => prev.filter(a => a.id !== activity.id));
      
      // Clear cache and trigger fresh fetch to ensure consistency
      localStorage.removeItem(CACHE_KEY);
      
      // Fetch fresh data in the background
      setTimeout(() => {
        fetchAndUpdateCache(true);
      }, 100);

      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }, []);

  return { 
    activities, 
    loading, // Only true for initial load when no cache
    refreshing, // True when updating in background
    fetchActivities,
    deleteActivity
  };
};
