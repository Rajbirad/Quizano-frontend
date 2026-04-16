/**
 * Security Utilities for Production
 * - Input sanitization
 * - XSS prevention
 * - CSRF protection
 * - Rate limiting
 * - Content Security Policy helpers
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate URL to prevent open redirect vulnerabilities
 */
export function isValidURL(url: string, allowedDomains?: string[]): boolean {
  try {
    const parsedURL = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(parsedURL.protocol)) {
      return false;
    }

    // Check against allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      return allowedDomains.some(domain => 
        parsedURL.hostname === domain || parsedURL.hostname.endsWith(`.${domain}`)
      );
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

/**
 * Rate limiter for client-side actions
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if action is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Record new attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    // Cleanup old entries
    if (this.attempts.size > 1000) {
      this.cleanup();
    }

    return true;
  }

  /**
   * Get remaining time until allowed
   */
  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;

    const oldestAttempt = Math.min(...attempts);
    const timeSinceOldest = Date.now() - oldestAttempt;
    
    return Math.max(0, this.windowMs - timeSinceOldest);
  }

  /**
   * Reset attempts for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now();
    Array.from(this.attempts.entries()).forEach(([key, times]) => {
      const recentAttempts = times.filter(time => now - time < this.windowMs);
      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    });
  }
}

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in dev
    "'unsafe-eval'", // Required for Vite in dev
    'https://cdn.jsdelivr.net',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://*.supabase.co',
  ],
  'media-src': [
    "'self'",
    'blob:',
    'https:',
  ],
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    process.env.VITE_API_URL || 'http://127.0.0.1:8000',
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_CONFIG)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Secure storage wrapper
 */
export class SecureStorage {
  private readonly prefix: string;
  private readonly storage: Storage;

  constructor(prefix: string = 'secure_', useSessionStorage: boolean = false) {
    this.prefix = prefix;
    this.storage = useSessionStorage ? sessionStorage : localStorage;
  }

  /**
   * Set item with encryption (basic obfuscation)
   */
  setItem(key: string, value: any): void {
    try {
      const data = JSON.stringify(value);
      const encoded = btoa(data);
      this.storage.setItem(this.prefix + key, encoded);
    } catch (error) {
      console.error('SecureStorage: Failed to set item', error);
    }
  }

  /**
   * Get item with decryption
   */
  getItem<T>(key: string): T | null {
    try {
      const encoded = this.storage.getItem(this.prefix + key);
      if (!encoded) return null;

      const data = atob(encoded);
      return JSON.parse(data);
    } catch (error) {
      console.error('SecureStorage: Failed to get item', error);
      return null;
    }
  }

  /**
   * Remove item
   */
  removeItem(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    const keys = Object.keys(this.storage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => this.storage.removeItem(key));
  }
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(2)}MB limit`,
    };
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Debounce function for rate limiting
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Detect and prevent brute force attacks
 */
export class BruteForceProtection {
  private attempts: Map<string, { count: number; lockedUntil?: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly lockoutDuration: number;

  constructor(maxAttempts: number = 5, lockoutDuration: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.lockoutDuration = lockoutDuration;
  }

  /**
   * Record failed attempt
   */
  recordFailure(identifier: string): void {
    const now = Date.now();
    const attempt = this.attempts.get(identifier) || { count: 0 };

    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      return; // Still locked
    }

    attempt.count += 1;

    if (attempt.count >= this.maxAttempts) {
      attempt.lockedUntil = now + this.lockoutDuration;
    }

    this.attempts.set(identifier, attempt);
  }

  /**
   * Check if identifier is locked
   */
  isLocked(identifier: string): boolean {
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || !attempt.lockedUntil) {
      return false;
    }

    if (Date.now() >= attempt.lockedUntil) {
      this.attempts.delete(identifier);
      return false;
    }

    return true;
  }

  /**
   * Get remaining lockout time
   */
  getRemainingLockoutTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || !attempt.lockedUntil) {
      return 0;
    }

    return Math.max(0, attempt.lockedUntil - Date.now());
  }

  /**
   * Reset attempts
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export singleton instances
export const rateLimiter = new ClientRateLimiter();
export const bruteForceProtection = new BruteForceProtection();
export const secureStorage = new SecureStorage();
