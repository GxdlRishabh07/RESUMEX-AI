/**
 * ForgotPasswordPage — RESUMEX // AI
 * Sends a password reset email via Supabase Auth.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const { error } = await resetPassword(email.trim());
    if (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } else {
      setSuccess(true);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'var(--font-sans)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 600px 300px at 50% 0%, rgba(37,99,235,0.12), transparent)' }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-surface-high-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 0 1px var(--border-ghost)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-tertiary)' }}>
              {success ? 'mark_email_read' : 'lock_reset'}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {success ? 'Email sent!' : 'Reset your password'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            {success
              ? `Check ${email} for a link to reset your password.`
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!success && (
          <div style={{ background: 'var(--color-surface-low)', border: '1px solid var(--border-ghost)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
            {error && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-error)' }}>error</span>
                <span style={{ fontSize: '13px', color: 'var(--color-error)' }}>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="forgot-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '6px' }}>
                  Email address
                </label>
                <input id="forgot-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" disabled={isSubmitting} className="input" style={{ fontSize: '14px' }} />
              </div>
              <button type="submit" disabled={isSubmitting || !email.trim()} className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '14px' }}>
                {isSubmitting ? (
                  <><span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Sending…</>
                ) : 'Send reset link'}
              </button>
            </form>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            ← Back to login
          </Link>
        </p>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
