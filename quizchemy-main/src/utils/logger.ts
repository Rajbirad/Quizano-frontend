/**
 * Production Logger Utility
 * - Logs to console in development
 * - Sends to monitoring service in production
 * - Implements log levels and structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = !import.meta.env.PROD;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  /**
   * Format log message with context
   */
  private formatLog(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context instanceof Error ? undefined : context,
      error: context instanceof Error ? context : undefined,
    };
  }

  /**
   * Send log to monitoring service
   */
  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    // In production, integrate with monitoring service
    // Examples: Sentry, LogRocket, Datadog, New Relic
    if (!this.isDevelopment) {
      // Buffer logs to avoid overwhelming the service
      this.logBuffer.push(entry);

      if (this.logBuffer.length >= this.maxBufferSize) {
        await this.flushLogs();
      }
    }
  }

  /**
   * Flush buffered logs
   */
  async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      // TODO: Send to your monitoring service
      // Example: await monitoringService.sendBatch(this.logBuffer);
      
      // For now, just clear the buffer
      this.logBuffer = [];
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }

  /**
   * Debug level log (only in development)
   */
  debug(message: string, context?: any): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info level log
   */
  info(message: string, context?: any): void {
    const entry = this.formatLog('info', message, context);
    
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
    
    this.sendToMonitoring(entry);
  }

  /**
   * Warning level log
   */
  warn(message: string, context?: any): void {
    const entry = this.formatLog('warn', message, context);
    
    console.warn(`[WARN] ${message}`, context || '');
    this.sendToMonitoring(entry);
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error | any): void {
    const entry = this.formatLog('error', message, error);
    
    console.error(`[ERROR] ${message}`, error || '');
    this.sendToMonitoring(entry);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, endpoint: string, status?: number): void {
    const message = `API ${method} ${endpoint}`;
    
    if (status && status >= 400) {
      this.error(message, { method, endpoint, status });
    } else if (this.isDevelopment) {
      this.debug(message, { method, endpoint, status });
    }
  }

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string = 'ms'): void {
    const message = `Performance: ${metric} = ${value}${unit}`;
    
    if (this.isDevelopment) {
      console.log(`[PERF] ${message}`);
    }
    
    // Send to monitoring service
    this.sendToMonitoring({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context: { metric, value, unit },
    });
  }

  /**
   * Log user action
   */
  userAction(action: string, details?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.debug(`User action: ${action}`, details);
    } else {
      this.info(`User action: ${action}`, details);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Performance monitoring utilities
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring performance
   */
  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  /**
   * End measuring and log result
   */
  end(label: string): number {
    const startTime = this.marks.get(label);
    
    if (!startTime) {
      logger.warn(`Performance mark "${label}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);
    
    logger.performance(label, Math.round(duration));
    
    return duration;
  }

  /**
   * Measure async operation
   */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      return await fn();
    } finally {
      this.end(label);
    }
  }
}

export const perfMonitor = new PerformanceMonitor();
