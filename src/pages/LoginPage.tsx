/**
 * LoginPage — RESUMEX // AI
 * Email + password login backed by Supabase Auth.
 * Redirects authenticated users away automatically.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EyeIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

export const LoginPage: React.FC = () => {
  const { signIn, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true });
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    setError(null);

    const { error } = await signIn(email.trim(), password);

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : error.message
      );
      setIsSubmitting(false);
    }
    // On success, onAuthStateChange fires → user updates → useEffect redirects
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 600px 300px at 50% 0%, rgba(37,99,235,0.12), transparent)',
      }} />

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.4s ease forwards',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--color-surface-high-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 0 1px var(--border-ghost), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-tertiary)' }}>
              neurology
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px',
            color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '6px',
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Sign in to your RESUMEX AI account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--color-surface-low)',
          border: '1px solid var(--border-ghost)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Error banner */}
          {error && (
            <div style={{
              marginBottom: '20px', padding: '12px 16px',
              background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)',
              borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-error)', flexShrink: 0, marginTop: '1px' }}>
                error
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-error)', lineHeight: '1.5' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isSubmitting}
                className="input"
                style={{ fontSize: '14px' }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '12px', color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="input"
                  style={{ fontSize: '14px', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-subtle)', padding: '4px',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <EyeIcon open={!showPassword} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting || !email.trim() || !password}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '4px', fontSize: '14px' }}
            >
              {isSubmitting ? (
                <>
                  <span style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                    display: 'inline-block', animation: 'spin 0.8s linear infinite',
                  }} />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
