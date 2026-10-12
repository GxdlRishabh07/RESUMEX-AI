import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="footer-main"
      style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        background: 'rgba(9, 13, 22, 0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 -1px 8px rgba(0,0,0,0.4)',
        padding: '8px 0',
        marginTop: '64px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '0 24px',
        }}
      >
        {/* Left: Latency + Neural Model */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '15px', color: 'var(--color-tertiary)' }}
            >
              speed
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-on-surface-variant)' }}>
              Latency:{' '}
              <span style={{ color: 'var(--color-on-surface)' }}>140ms</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '15px', color: 'var(--color-secondary)' }}
            >
              psychology
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-on-surface-variant)' }}>
              Neural Model:{' '}
              <span style={{ color: 'var(--color-on-surface)' }}>Gemini 1.5 Pro Neural Rewrite</span>
            </span>
          </div>
        </div>

        {/* Right: Security Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'var(--color-surface-container)',
              border: '1px solid var(--border-ghost)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '14px', color: 'var(--color-tertiary)' }}
            >
              verified_user
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              SOC-2 Type II
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'var(--color-surface-container)',
              border: '1px solid var(--border-ghost)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '14px', color: 'var(--color-tertiary)' }}
            >
              shield
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              ATS Shield Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
