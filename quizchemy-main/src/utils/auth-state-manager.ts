/**
 * Production-level authentication state manager
 * Handles all authentication redirects and state management
 */

export type AuthAction = 'LOGIN' | 'LOGOUT' | 'AUTO_REDIRECT' | 'MANUAL_REDIRECT';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  lastAction: AuthAction | null;
  redirectBlocked: boolean;
}

class AuthStateManager {
  private static instance: AuthStateManager;
  private state: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    lastAction: null,
    redirectBlocked: false
  };

  private constructor() {}

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  // Set authentication state
  setAuthenticated(isAuthenticated: boolean, action: AuthAction): void {
    this.state.isAuthenticated = isAuthenticated;
    this.state.lastAction = action;
    this.state.isLoading = false;
    
    console.log('[AuthStateManager] State updated:', {
      isAuthenticated,
      action,
      redirectBlocked: this.state.redirectBlocked
    });
  }

  // Block redirects temporarily (used during logout)
  blockRedirects(blocked: boolean = true): void {
    this.state.redirectBlocked = blocked;
    console.log('[AuthStateManager] Redirects blocked:', blocked);
  }

  // Check if auto-redirect to dashboard should happen
  shouldRedirectToDashboard(): boolean {
    const should = this.state.isAuthenticated && 
                   !this.state.redirectBlocked && 
                   this.state.lastAction !== 'LOGOUT';
    
    console.log('[AuthStateManager] Should redirect to dashboard:', should, this.state);
    return should;
  }

  // Check if redirect to login should happen
  shouldRedirectToLogin(): boolean {
    const should = !this.state.isAuthenticated && 
                   !this.state.redirectBlocked && 
                   this.state.lastAction !== 'LOGOUT';
    
    console.log('[AuthStateManager] Should redirect to login:', should, this.state);
    return should;
  }

  // Get current state
  getState(): AuthState {
    return { ...this.state };
  }

  // Clear all state (nuclear option)
  reset(): void {
    this.state = {
      isAuthenticated: false,
      isLoading: false,
      lastAction: 'LOGOUT',
      redirectBlocked: false
    };
    console.log('[AuthStateManager] State reset');
  }

  // Handle logout process
  initiateLogout(): void {
    console.log('[AuthStateManager] Logout initiated');
    this.state.lastAction = 'LOGOUT';
    this.state.redirectBlocked = true;
    this.state.isAuthenticated = false;
  }

  // Complete logout process
  completeLogout(): void {
    console.log('[AuthStateManager] Logout completed');
    this.reset();
    // Keep redirects blocked for a short time to prevent race conditions
    setTimeout(() => {
      this.state.redirectBlocked = false;
    }, 1000);
  }
}

export default AuthStateManager;
