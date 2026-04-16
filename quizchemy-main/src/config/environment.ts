/**
 * Environment Configuration
 * Handles environment-specific settings for development, staging, and production
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  env: Environment;
  apiUrl: string;
  appUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableDebug: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  maxUploadSize: number; // in bytes
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  features: {
    enableAIChat: boolean;
    enablePodcast: boolean;
    enableMindMap: boolean;
    enableVideoAnalysis: boolean;
  };
}

/**
 * Get current environment
 */
export function getCurrentEnvironment(): Environment {
  const mode = import.meta.env.MODE;
  
  if (mode === 'production') return 'production';
  if (mode === 'staging') return 'staging';
  return 'development';
}

/**
 * Development configuration
 */
const developmentConfig: EnvironmentConfig = {
  env: 'development',
  apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8083',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://vusjibqsihfeuscntbje.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1c2ppYnFzaWhmZXVzY250YmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTE4MDcsImV4cCI6MjA2OTcyNzgwN30.T9-L5yx3XlbGwSMmqvKimkYj6fo7WuTCRlGsOYY50OQ',
  enableDebug: true,
  enableAnalytics: false,
  enableErrorReporting: false,
  maxUploadSize: 100 * 1024 * 1024, // 100MB
  rateLimit: {
    maxRequests: 1000, // Very high for development
    windowMs: 60000,
  },
  features: {
    enableAIChat: true,
    enablePodcast: true,
    enableMindMap: true,
    enableVideoAnalysis: true,
  },
};

/**
 * Staging configuration
 */
const stagingConfig: EnvironmentConfig = {
  env: 'staging',
  apiUrl: import.meta.env.VITE_API_URL || 'https://staging-api.quizano.com',
  appUrl: import.meta.env.VITE_APP_URL || 'https://staging.quizano.com',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://vusjibqsihfeuscntbje.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  enableDebug: true,
  enableAnalytics: true,
  enableErrorReporting: true,
  maxUploadSize: 50 * 1024 * 1024, // 50MB
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
  },
  features: {
    enableAIChat: true,
    enablePodcast: true,
    enableMindMap: true,
    enableVideoAnalysis: true,
  },
};

/**
 * Production configuration
 */
const productionConfig: EnvironmentConfig = {
  env: 'production',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.quizano.com',
  appUrl: import.meta.env.VITE_APP_URL || 'https://quizano.com',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://vusjibqsihfeuscntbje.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  enableDebug: false,
  enableAnalytics: true,
  enableErrorReporting: true,
  maxUploadSize: 20 * 1024 * 1024, // 20MB
  rateLimit: {
    maxRequests: 50,
    windowMs: 60000,
  },
  features: {
    enableAIChat: true,
    enablePodcast: true,
    enableMindMap: true,
    enableVideoAnalysis: true,
  },
};

/**
 * Get configuration for current environment
 */
export function getConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();

  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    default:
      return developmentConfig;
  }
}

/**
 * Validate environment configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const config = getConfig();
  const errors: string[] = [];

  // Validate required fields
  if (!config.apiUrl) {
    errors.push('API URL is not configured');
  }

  if (!config.supabaseUrl) {
    errors.push('Supabase URL is not configured');
  }

  if (!config.supabaseAnonKey) {
    errors.push('Supabase Anon Key is not configured');
  }

  // Validate URLs
  try {
    new URL(config.apiUrl);
  } catch {
    errors.push('API URL is not a valid URL');
  }

  try {
    new URL(config.appUrl);
  } catch {
    errors.push('App URL is not a valid URL');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export singleton config
export const config = getConfig();

// Validate on load in production
if (config.env === 'production') {
  const validation = validateConfig();
  if (!validation.valid) {
    console.error('Environment configuration errors:', validation.errors);
  }
}
