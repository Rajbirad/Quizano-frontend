import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingTransition } from '@/components/ui/page-transition';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  redirectTo
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <LoadingTransition 
        isLoading={true} 
        loadingText="Verifying authentication..."
      >
        <div />
      </LoadingTransition>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return (
      <Navigate 
        to={redirectTo || "/login"} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated but trying to access login/signup pages
  if (!requireAuth && user && ['/login', '/signup', '/auth'].includes(location.pathname)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};