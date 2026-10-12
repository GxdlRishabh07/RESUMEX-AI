/**
 * AuthCallbackPage — Handles Supabase auth redirects (email confirmation, password reset).
 * Supabase's detectSessionInUrl handles token exchange automatically.
 * This component just provides a loading state and then redirects.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      // After Supabase processes the token in URL, redirect appropriately
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      if (type === 'recovery') {
        // Password recovery flow — could add a password update page here
        navigate('/login', { replace: true });
      } else if (user) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(56,189,248,0.15)', borderTopColor: 'var(--color-secondary)', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: 'var(--color-text-subtle)', fontSize: '14px' }}>Verifying your account…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
