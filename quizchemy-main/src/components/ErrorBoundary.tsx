import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Production-ready Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 * Logs error information and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service in production
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('Error captured by boundary:', error, errorInfo);
    } else {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>

            {!import.meta.env.PROD && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2 text-xs text-red-700 dark:text-red-400">
                    <summary className="cursor-pointer font-medium">
                      Stack trace
                    </summary>
                    <pre className="mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
