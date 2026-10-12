/**
 * SignupPage — RESUMEX // AI
 * Name + email + password + confirm password signup.
 * On success, Supabase sends a confirmation email.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EyeIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
    )}
  </svg>
);

const getStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const StrengthBar: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;
  const score = getStrength(password);
  const label = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '99px',
            background: i <= score ? colors[score] : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '11px', color: score < 3 ? '#f97316' : score < 4 ? '#eab308' : '#22c55e', fontWeight: 600 }}>
        {label}
      </span>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const { signUp, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate('/', { replace: true });
  }, [user, authLoading, navigate]);

  const validate = () => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email address is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (getStrength(password) < 2) return 'Please choose a stronger password.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsSubmitting(true);
    setError(null);

    const { error } = await signUp(email.trim(), password, fullName.trim());

    if (error) {
      setError(error.message || 'Signup failed. Please try again.');
    } else {
      setSuccess(true);
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: 'var(--color-canvas)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px', textAlign: 'center',
          animation: 'fadeInUp 0.4s ease forwards',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#10b981' }}>
              mark_email_read
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            Check your inbox!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>.
            Click the link to activate your account and start optimizing.
          </p>
          <Link to="/login" className="btn btn-primary btn-md" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
        <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: 'var(--color-canvas)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'var(--font-sans)', position: 'relative',
    }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 600px 300px at 50% 0%, rgba(37,99,235,0.12), transparent)' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.4s ease forwards' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-surface-high-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 0 1px var(--border-ghost), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-tertiary)' }}>neurology</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Free forever. No credit card required.
          </p>
        </div>

        <div style={{ background: 'var(--color-surface-low)', border: '1px solid var(--border-ghost)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-error)', flexShrink: 0, marginTop: '1px' }}>error</span>
              <span style={{ fontSize: '13px', color: 'var(--color-error)', lineHeight: '1.5' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '6px' }}>Full name</label>
              <input id="signup-name" type="text" autoComplete="name" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" disabled={isSubmitting} className="input" style={{ fontSize: '14px' }} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '6px' }}>Email address</label>
              <input id="signup-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" disabled={isSubmitting} className="input" style={{ fontSize: '14px' }} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" disabled={isSubmitting} className="input" style={{ fontSize: '14px', paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: '4px', display: 'flex', alignItems: 'center' }}>
                  <EyeIcon open={!showPassword} />
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '6px' }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input id="signup-confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" disabled={isSubmitting} className="input" style={{ fontSize: '14px', paddingRight: '44px', borderColor: confirmPassword && confirmPassword !== password ? 'rgba(255,180,171,0.5)' : undefined }} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: '4px', display: 'flex', alignItems: 'center' }}>
                  <EyeIcon open={!showConfirm} />
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>Passwords don't match</p>
              )}
            </div>

            <button id="btn-signup-submit" type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '4px', fontSize: '14px' }}>
              {isSubmitting ? (
                <><span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Creating account…</>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
