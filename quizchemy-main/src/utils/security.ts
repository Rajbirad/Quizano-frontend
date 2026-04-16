// Security utilities for production-level protection

/**
 * Generate a random string for CSRF tokens
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format with strict regex
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Rate limiting utility
 */
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    attempt.lastAttempt = now;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return 0;
    
    const remainingTime = this.windowMs - (Date.now() - attempt.lastAttempt);
    return Math.max(0, remainingTime);
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

/**
 * Secure session storage
 */
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      // Encrypt sensitive data before storing (in production, use proper encryption)
      const encrypted = btoa(value); // Base64 encoding (replace with proper encryption)
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      return atob(encrypted); // Base64 decoding (replace with proper decryption)
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    sessionStorage.removeItem(key);
  }
};

/**
 * Content Security Policy headers (for server-side implementation)
 */
export const getCSPHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "media-src 'self' https: blob:",
      "frame-src https://accounts.google.com"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
};
