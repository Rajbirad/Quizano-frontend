/**
 * Production-ready API Client with:
 * - Request/Response interceptors
 * - Automatic retries with exponential backoff
 * - Request timeout handling
 * - Rate limiting
 * - Error handling
 * - Request cancellation
 */

import { API_CONFIG } from '@/config/api';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipRetry?: boolean;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private pendingRequests: Map<string, AbortController> = new Map();
  private requestQueue: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly RATE_LIMIT_WINDOW = 1000; // 1 second
  private readonly MAX_REQUESTS_PER_WINDOW = 10;

  /**
   * Check if request should be rate limited
   */
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const lastRequest = this.requestQueue.get(endpoint) || 0;
    
    if (now - lastRequest < this.RATE_LIMIT_WINDOW) {
      const requestCount = Array.from(this.requestQueue.values()).filter(
        time => now - time < this.RATE_LIMIT_WINDOW
      ).length;
      
      return requestCount >= this.MAX_REQUESTS_PER_WINDOW;
    }
    
    return false;
  }

  /**
   * Record request for rate limiting
   */
  private recordRequest(endpoint: string): void {
    this.requestQueue.set(endpoint, Date.now());
    
    // Clean up old entries
    const now = Date.now();
    Array.from(this.requestQueue.entries()).forEach(([key, time]) => {
      if (now - time > this.RATE_LIMIT_WINDOW * 10) {
        this.requestQueue.delete(key);
      }
    });
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    );
  }

  /**
   * Sleep for exponential backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make API request with retries and timeout
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.MAX_RETRIES,
      retryDelay = this.RETRY_DELAY,
      skipRetry = false,
      ...fetchConfig
    } = config;

    // Check rate limiting
    if (this.checkRateLimit(endpoint)) {
      throw this.createError('Rate limit exceeded. Please try again later.', 429);
    }

    // Record request
    this.recordRequest(endpoint);

    // Create abort controller
    const abortController = new AbortController();
    const requestKey = `${endpoint}-${Date.now()}`;
    this.pendingRequests.set(requestKey, abortController);

    let lastError: Error | null = null;
    const maxAttempts = skipRetry ? 1 : retries + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Add exponential backoff delay for retries
        if (attempt > 0) {
          const delay = retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }

        const url = endpoint.startsWith('http') 
          ? endpoint 
          : `${API_CONFIG.BASE_URL}${endpoint}`;

        const response = await Promise.race([
          fetch(url, {
            ...fetchConfig,
            signal: abortController.signal,
            headers: {
              'Content-Type': 'application/json',
              ...fetchConfig.headers,
            },
          }),
          this.createTimeout(timeout),
        ]);

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw this.createError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }

        // Parse response
        const data = await response.json();
        
        // Clean up
        this.pendingRequests.delete(requestKey);
        
        return data as T;
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error.name === 'AbortError' ||
          error.status === 400 || // Bad Request
          error.status === 401 || // Unauthorized
          error.status === 403 || // Forbidden
          error.status === 404 || // Not Found
          error.status === 422    // Unprocessable Entity
        ) {
          break;
        }

        // Log retry attempt in development
        if (!import.meta.env.PROD && attempt < maxAttempts - 1) {
          console.warn(`Request failed, retrying... (${attempt + 1}/${maxAttempts})`, error.message);
        }
      }
    }

    // Clean up
    this.pendingRequests.delete(requestKey);

    // Throw last error if all retries failed
    throw lastError || this.createError('Request failed after all retries');
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    this.pendingRequests.forEach(controller => controller.abort());
    this.pendingRequests.clear();
  }

  /**
   * Cancel specific request
   */
  cancel(requestKey: string): void {
    const controller = this.pendingRequests.get(requestKey);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * Create standardized error
   */
  private createError(message: string, status?: number, details?: any): ApiError {
    return {
      message,
      status,
      code: status ? `HTTP_${status}` : 'UNKNOWN_ERROR',
      details,
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Upload file with progress
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // Upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (error) {
            reject(this.createError('Invalid JSON response', xhr.status));
          }
        } else {
          reject(this.createError(`Upload failed: ${xhr.statusText}`, xhr.status));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(this.createError('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(this.createError('Upload cancelled'));
      });

      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_CONFIG.BASE_URL}${endpoint}`;

      xhr.open('POST', url);
      xhr.send(formData);
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export helper to get auth headers
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    // Get token from Supabase session
    const token = localStorage.getItem('sb-vusjibqsihfeuscntbje-auth-token');
    
    if (token) {
      const session = JSON.parse(token);
      return {
        'Authorization': `Bearer ${session.access_token}`,
      };
    }
  } catch (error) {
    console.error('Error getting auth headers:', error);
  }
  
  return {};
};
