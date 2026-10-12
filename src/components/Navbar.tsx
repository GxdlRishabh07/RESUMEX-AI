import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { fetchRateLimit, getCachedRateLimit, RateLimitInfo } from '../services/rateLimitService.js';

interface NavbarProps {
  onLoadSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoadSample }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'error'>('checking');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>(getCachedRateLimit());
  const [rateLimitOpen, setRateLimitOpen] = useState(false);

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.status === 'online' && data.gemini?.ok) {
        setHealthStatus('online');
      } else {
        setHealthStatus('error');
      }
    } catch {
      setHealthStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
    fetchRateLimit().then(info => {
      if (info) setRateLimit(info);
    });

    const handleRateLimitUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RateLimitInfo>;
      if (customEvent.detail) {
        setRateLimit(customEvent.detail);
      }
    };
    window.addEventListener('resumex:rate_limit_updated', handleRateLimitUpdate);

    const timer = setInterval(() => {
      setRateLimit(prev => {
        if (prev.resetInSeconds <= 1) {
          fetchRateLimit();
          return { ...prev, resetInSeconds: 0 };
        }
        return { ...prev, resetInSeconds: prev.resetInSeconds - 1 };
      });
    }, 1000);

    return () => {
      window.removeEventListener('resumex:rate_limit_updated', handleRateLimitUpdate);
      clearInterval(timer);
    };
  }, []);

  // Close rate limit popover on outside click
  useEffect(() => {
    if (!rateLimitOpen) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#rate-limit-container')) {
        setRateLimitOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [rateLimitOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-menu-container')) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [userMenuOpen]);

  const formatResetTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header
      id="navbar-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 50,
        backgroundColor: 'rgba(9, 13, 22, 0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="px-6"
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* LEFT: Brand + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              id="brand-icon-box"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--color-surface-high-2, #262a34)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', color: 'var(--color-tertiary)' }}
              >
                neurology
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'var(--color-on-surface)',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                RESUMEX{' '}
                <span style={{ color: 'var(--color-tertiary)' }}>//</span>
                {' '}AI
              </span>
              <span
                id="version-badge"
                style={{
                  padding: '1px 7px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  backgroundColor: 'rgba(0, 120, 140, 0.3)',
                  color: 'var(--color-tertiary)',
                  borderRadius: '9999px',
                }}
              >
                v2.4 Pro
              </span>
            </div>
          </div>

          {/* Navigation Links — desktop only */}
          <nav
            id="navbar-links"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            className="hidden xl:flex"
          >
            <a
              id="nav-optimizer-studio"
              href="/"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-on-surface)',
                background: 'var(--color-surface-high-2, #262a34)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                textDecoration: 'none',
                transition: 'all 150ms ease',
              }}
              aria-current="page"
            >
              Optimizer Studio
            </a>

            {/* History link */}
            <Link
              to="/dashboard"
              id="nav-link-history"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-secondary)',
                textDecoration: 'none',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
              History
            </Link>
          </nav>
        </div>

        {/* RIGHT: Status, Scans, User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* ATS Engine Status */}
          {healthStatus === 'online' && (
            <div
              id="ats-engine-status"
              className="hidden 2xl:flex"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'var(--color-surface-container)',
                border: '1px solid var(--border-ghost)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--color-tertiary)',
                  boxShadow: '0 0 8px var(--color-tertiary)',
                  animation: 'pulse-dot 2s ease infinite',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                ATS Engine Active • Gemini Neural Rewrite Ready
              </span>
            </div>
          )}

          {/* Optimizer Rate Limit & Live Quota Badge */}
          <div id="rate-limit-container" style={{ position: 'relative' }}>
            <button
              id="system-status-indicator"
              onClick={() => setRateLimitOpen(v => !v)}
              title={`Optimizer Rate Limit: ${rateLimit.remaining} of ${rateLimit.limit} scans remaining. Resets in ${formatResetTime(rateLimit.resetInSeconds)}. Click to view rate limit details.`}
              className="hidden md:flex"
              style={{
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '8px',
                background: rateLimitOpen
                  ? 'rgba(0, 229, 255, 0.12)'
                  : (rateLimit.remaining <= 3 ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-surface-container)'),
                border: rateLimitOpen
                  ? '1px solid var(--color-tertiary)'
                  : (rateLimit.remaining <= 3 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-ghost)'),
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-on-surface-variant)',
                fontFamily: 'var(--font-sans)',
                transition: 'all 150ms ease',
                boxShadow: rateLimitOpen ? '0 0 14px rgba(0, 229, 255, 0.25)' : 'none',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '16px',
                  color: rateLimit.remaining <= 3 ? '#ef4444' : 'var(--color-tertiary)',
                  animation: rateLimit.remaining <= 3 ? 'pulse-dot 1.5s ease infinite' : 'none',
                }}
              >
                token
              </span>
              <span
                style={{
                  color: rateLimit.remaining <= 3 ? '#ef4444' : 'var(--color-on-surface)',
                  fontWeight: 800,
                }}
              >
                {rateLimit.remaining} / {rateLimit.limit}
              </span>
              <span style={{ color: 'var(--color-on-surface-variant)', opacity: 0.85 }}>
                Scans Left
              </span>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-subtle)',
                  transform: rateLimitOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms ease',
                }}
              >
                expand_more
              </span>
            </button>

            {/* Interactive Rate Limit Popover */}
            {rateLimitOpen && (
              <div
                id="rate-limit-popover"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '320px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--border-ghost)',
                  borderRadius: '14px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.65)',
                  zIndex: 110,
                  overflow: 'hidden',
                  animation: 'fadeInDropdown 0.15s ease',
                  padding: '16px',
                }}
              >
                {/* Popover Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'rgba(0, 229, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-tertiary)' }}>
                        speed
                      </span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                        Optimizer Rate Limit
                      </h4>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-subtle)' }}>
                        Real-time scan quota tracking
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '99px',
                      background: rateLimit.remaining > 5 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: rateLimit.remaining > 5 ? '#10b981' : '#ef4444',
                      border: `1px solid ${rateLimit.remaining > 5 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {rateLimit.remaining > 0 ? 'Active' : 'Limit Reached'}
                  </span>
                </div>

                {/* Live Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--color-text-subtle)' }}>Remaining Quota</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>
                      {rateLimit.remaining} of {rateLimit.limit} Scans Left
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '99px',
                      background: 'var(--color-surface-high-2, #262a34)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, (rateLimit.remaining / rateLimit.limit) * 100))}%`,
                        height: '100%',
                        background:
                          rateLimit.remaining > 10
                            ? 'linear-gradient(90deg, #00e5ff, #38bdf8)'
                            : rateLimit.remaining > 3
                            ? '#f59e0b'
                            : '#ef4444',
                        borderRadius: '99px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* 3 Metric Summary Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--color-surface-container)',
                      border: '1px solid var(--border-ghost)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--color-text-subtle)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                      Limit
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-on-surface)' }}>
                      {rateLimit.limit}
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'var(--color-surface-container)',
                      border: '1px solid var(--border-ghost)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--color-text-subtle)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                      Used
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-on-surface)' }}>
                      {rateLimit.used}
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'var(--color-surface-container)',
                      border: '1px solid var(--border-ghost)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--color-text-subtle)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                      Left
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-tertiary)' }}>
                      {rateLimit.remaining}
                    </span>
                  </div>
                </div>

                {/* Live Countdown Timer Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(56, 189, 248, 0.06)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    borderRadius: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#38bdf8' }}>
                    schedule
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>Window resets in</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                      {formatResetTime(rateLimit.resetInSeconds)}{' '}
                      <span style={{ fontSize: '10px', fontWeight: 400, opacity: 0.8 }}>
                        ({rateLimit.windowMinutes}m rolling window)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descriptive Explanation */}
                <p
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: '11px',
                    lineHeight: '1.45',
                    color: 'var(--color-text-subtle)',
                  }}
                >
                  You have a rate limit of <strong>{rateLimit.limit} optimizer scans per {rateLimit.windowMinutes} minutes</strong>. Currently you have <strong>{rateLimit.remaining} scans left</strong>.
                </p>

                {/* Action button: Refresh */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const info = await fetchRateLimit();
                    setRateLimit(info);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--color-surface-high-2, #262a34)',
                    border: '1px solid var(--border-ghost)',
                    color: 'var(--color-on-surface)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface-high-2, #262a34)')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--color-tertiary)' }}>
                    refresh
                  </span>
                  Check Live Limit Status
                </button>
              </div>
            )}
          </div>

          {/* History button — mobile */}
          <Link
            to="/dashboard"
            id="btn-history-mobile"
            title="View history"
            className="flex xl:hidden"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--color-surface-container)',
              border: '1px solid var(--border-ghost)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-secondary)',
              textDecoration: 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
          </Link>

          {/* User Menu */}
          {user ? (
            <div id="user-menu-container" style={{ position: 'relative' }}>
              <button
                id="btn-user-menu"
                onClick={() => setUserMenuOpen(v => !v)}
                title={displayName}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px 4px 4px',
                  borderRadius: '99px',
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--border-ghost)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-on-surface)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:block">
                  {displayName}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-subtle)' }}>
                  {userMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: '220px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--border-ghost)',
                  borderRadius: '12px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'fadeInDropdown 0.15s ease',
                }}>
                  {/* User info header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-ghost)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-subtle)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '6px' }}>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 10px', borderRadius: '8px',
                        fontSize: '13px', color: 'var(--color-on-surface)',
                        textDecoration: 'none', transition: 'background 150ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-high)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-secondary)' }}>history</span>
                      Analysis History
                    </Link>

                    <button
                      onClick={onLoadSample}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 10px', borderRadius: '8px', width: '100%',
                        fontSize: '13px', color: 'var(--color-on-surface)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', transition: 'background 150ms ease', textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-high)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-text-subtle)' }}>science</span>
                      Load Demo Sample
                    </button>

                    <div style={{ height: '1px', background: 'var(--border-ghost)', margin: '4px 0' }} />

                    <button
                      id="btn-logout-menu"
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 10px', borderRadius: '8px', width: '100%',
                        fontSize: '13px', color: 'var(--color-error)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', transition: 'background 150ms ease', textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,180,171,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in: show login button */
            <Link
              to="/login"
              id="btn-login-nav"
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary-container)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 0 16px rgba(37,99,235,0.4)',
                transition: 'filter 150ms ease',
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
        @keyframes fadeInDropdown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        #navbar-header button:focus-visible { outline: 2px solid var(--color-secondary); outline-offset: 2px; }
        @media (max-width: 768px) { #ats-engine-status { display: none !important; } }
        @media (max-width: 640px) { #system-status-indicator { display: none !important; } #navbar-links { display: none !important; } }
      `}</style>
    </header>
  );
};
