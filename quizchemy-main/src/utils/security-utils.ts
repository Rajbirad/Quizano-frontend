/**
 * Security utilities for OAuth token handling
 */

export const clearOAuthTokensFromUrl = (): boolean => {
  const hash = window.location.hash;
  
  if (hash && (hash.includes('access_token') || hash.includes('refresh_token') || hash.includes('id_token'))) {
    console.log('🔒 [Security] Clearing OAuth tokens from URL');
    
    // Clear the entire hash to remove all tokens
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    
    return true; // Tokens were found and cleared
  }
  
  return false; // No tokens found
};

export const sanitizeUrlForSecurity = (): void => {
  // Remove any sensitive parameters from URL
  const url = new URL(window.location.href);
  const sensitiveParams = ['access_token', 'refresh_token', 'id_token', 'code', 'state'];
  
  let hasChanges = false;
  sensitiveParams.forEach(param => {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      hasChanges = true;
    }
  });
  
  // Also clear hash if it contains tokens
  if (clearOAuthTokensFromUrl()) {
    hasChanges = true;
  }
  
  if (hasChanges) {
    console.log('🔒 [Security] URL sanitized - sensitive parameters removed');
    window.history.replaceState(null, '', url.pathname + url.search);
  }
};

export const setupSecurityMonitoring = (): (() => void) => {
  const checkForTokens = () => {
    if (window.location.hash && (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token')
    )) {
      console.warn('🚨 [Security Alert] OAuth tokens detected in URL - clearing immediately');
      clearOAuthTokensFromUrl();
    }
  };
  
  // Check every 500ms for any tokens that might appear
  const interval = setInterval(checkForTokens, 500);
  
  // Return cleanup function
  return () => clearInterval(interval);
};

export const logSecurityEvent = (event: string, details?: any): void => {
  console.log(`🔒 [Security] ${event}`, details || '');
};
