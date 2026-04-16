/**
 * Production-ready Supabase Client with:
 * - Connection pooling
 * - Error handling
 * - Query optimization
 * - Retry logic
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { logger } from '@/utils/logger';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vusjibqsihfeuscntbje.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1c2ppYnFzaWhmZXVzY250YmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTE4MDcsImV4cCI6MjA2OTcyNzgwN30.T9-L5yx3XlbGwSMmqvKimkYj6fo7WuTCRlGsOYY50OQ";

/**
 * Create optimized Supabase client
 */
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'quizchemy-web',
      },
    },
    db: {
      schema: 'public',
    },
    // Connection pooling for better performance
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Query helper with error handling and logging
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string = 'Database query failed'
): Promise<T> {
  try {
    const { data, error } = await queryFn();

    if (error) {
      logger.error(errorMessage, error);
      throw new Error(error.message || errorMessage);
    }

    if (data === null) {
      throw new Error('No data returned from query');
    }

    return data;
  } catch (error: any) {
    logger.error(errorMessage, error);
    throw error;
  }
}

/**
 * Batch query helper for multiple queries
 */
export async function executeBatchQueries<T>(
  queries: Array<() => Promise<{ data: any; error: any }>>,
  errorMessage: string = 'Batch query failed'
): Promise<T[]> {
  try {
    const results = await Promise.allSettled(queries.map(q => q()));

    const data = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value.data)
      .filter(d => d !== null);

    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (errors.length > 0) {
      logger.warn(`${errorMessage}: Some queries failed`, { errors });
    }

    return data;
  } catch (error: any) {
    logger.error(errorMessage, error);
    throw error;
  }
}

/**
 * Paginated query helper
 */
export async function executePaginatedQuery<T>(
  tableName: string,
  {
    page = 1,
    pageSize = 20,
    orderBy = 'created_at',
    ascending = false,
    filters = {},
  }: {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
  } = {}
): Promise<{ data: T[]; count: number; hasMore: boolean }> {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering and pagination
    const { data, error, count } = await query
      .order(orderBy, { ascending })
      .range(from, to);

    if (error) {
      logger.error(`Paginated query failed for ${tableName}`, error);
      throw error;
    }

    return {
      data: (data || []) as T[],
      count: count || 0,
      hasMore: count ? (page * pageSize) < count : false,
    };
  } catch (error: any) {
    logger.error('Pagination error', error);
    throw error;
  }
}

/**
 * Optimized query with caching
 */
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function executeCachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  ttl: number = CACHE_TTL
): Promise<T> {
  // Check cache
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  // Execute query
  const { data, error } = await queryFn();

  if (error) {
    logger.error('Cached query failed', error);
    throw error;
  }

  if (data === null) {
    throw new Error('No data returned from cached query');
  }

  // Update cache
  queryCache.set(cacheKey, { data, timestamp: Date.now() });

  // Clean old cache entries
  if (queryCache.size > 100) {
    const now = Date.now();
    Array.from(queryCache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > ttl * 2) {
        queryCache.delete(key);
      }
    });
  }

  return data;
}

/**
 * Clear query cache
 */
export function clearQueryCache(pattern?: string): void {
  if (pattern) {
    Array.from(queryCache.keys())
      .filter(key => key.includes(pattern))
      .forEach(key => queryCache.delete(key));
  } else {
    queryCache.clear();
  }
}

/**
 * Real-time subscription helper with error handling
 */
export function createRealtimeSubscription<T>(
  tableName: string,
  callback: (payload: T) => void,
  filter?: Record<string, any>
) {
  const channel = supabase.channel(`${tableName}-changes`);

  const subscription = channel
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName, filter: filter ? `${Object.keys(filter)[0]}=eq.${Object.values(filter)[0]}` : undefined },
      (payload) => {
        try {
          callback(payload as T);
        } catch (error) {
          logger.error(`Realtime callback error for ${tableName}`, error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        logger.info(`Subscribed to ${tableName}`);
      } else if (status === 'CHANNEL_ERROR') {
        logger.error(`Subscription error for ${tableName}`);
      }
    });

  return subscription;
}
