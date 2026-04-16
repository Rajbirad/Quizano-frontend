/**
 * Cache clearing utilities for authentication and app state management
 */

export const clearAuthCache = async (): Promise<void> => {
  try {
    // Clear localStorage auth data
    const authKeys = [
      'isLoggedIn',
      'sb-supabase-auth-token',
      'supabase.auth.token',
      'fromLogout'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear browser caches if available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    console.log('Auth cache cleared successfully');
  } catch (error) {
    console.error('Error clearing auth cache:', error);
  }
};

export const clearAllCache = async (): Promise<void> => {
  try {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Clear IndexedDB if needed (for Supabase offline storage)
    if ('indexedDB' in window) {
      try {
        const dbs = await indexedDB.databases();
        await Promise.all(
          dbs.map(db => {
            if (db.name) {
              return new Promise<void>((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!);
                deleteReq.onsuccess = () => resolve();
                deleteReq.onerror = () => reject(deleteReq.error);
              });
            }
          })
        );
      } catch (error) {
        console.warn('Could not clear IndexedDB:', error);
      }
    }
    
    console.log('All cache cleared successfully');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

export const isAuthCached = (): boolean => {
  const hasLocalAuth = localStorage.getItem('isLoggedIn') === 'true';
  const hasSupabaseToken = !!(
    localStorage.getItem('sb-supabase-auth-token') ||
    sessionStorage.getItem('sb-supabase-auth-token')
  );
  
  return hasLocalAuth || hasSupabaseToken;
};

export const debugAuthState = (): void => {
  console.log('=== Auth State Debug ===');
  console.log('localStorage.isLoggedIn:', localStorage.getItem('isLoggedIn'));
  console.log('localStorage.fromLogout:', localStorage.getItem('fromLogout'));
  console.log('localStorage.sb-supabase-auth-token:', !!localStorage.getItem('sb-supabase-auth-token'));
  console.log('sessionStorage.sb-supabase-auth-token:', !!sessionStorage.getItem('sb-supabase-auth-token'));
  console.log('========================');
};
