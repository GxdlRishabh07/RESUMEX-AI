/**
 * ProtectedRoute — Guards routes that require authentication.
 * Shows a loading skeleton during session hydration.
 * Redirects unauthenticated users to /login.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoadingScreen: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid rgba(56,189,248,0.15)',
        borderTopColor: 'var(--color-secondary)',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <span style={{ color: 'var(--color-text-subtle)', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>
      Loading session…
    </span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    // Preserve the intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
