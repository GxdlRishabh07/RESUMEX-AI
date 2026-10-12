import React, { useEffect, useState } from 'react';

interface OptimizeButtonProps {
  onAnalyzeScore: () => void;
  onOptimize: () => void;
  isAnalyzing: boolean;
  isOptimizing: boolean;
  disabled: boolean;
}

const LOADING_MESSAGES = [
  'Extracting core ATS keywords from Job Description...',
  'Analyzing resume experience gaps & strengths...',
  'Rewriting bullet points with STAR action metrics...',
  'Injecting high-impact domain competencies...',
  'Formatting clean output & scoring ATS match...',
];

export const OptimizeButton: React.FC<OptimizeButtonProps> = ({
  onAnalyzeScore,
  onOptimize,
  isAnalyzing,
  isOptimizing,
  disabled,
}) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!isOptimizing) {
      setMsgIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isOptimizing]);

  const isLoading = isAnalyzing || isOptimizing;

  return (
    <div
      id="container-optimize-btn"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '32px 0',
        gap: '16px',
      }}
    >
      {/* Separator */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to right, transparent, var(--color-surface-highest, #31353f))',
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-on-surface-variant)',
            padding: '2px 12px',
            borderRadius: '9999px',
            background: 'var(--color-surface-high-2, #262a34)',
            whiteSpace: 'nowrap',
          }}
        >
          Analyze or Optimize
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to left, transparent, var(--color-surface-highest, #31353f))',
          }}
        />
      </div>

      {/* Action Buttons Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '860px',
        }}
        className="sm:flex-row sm-flex-row-override"
      >
        {/* Button 1: Check ATS Score */}
        <button
          id="btn-analyze-score-main"
          type="button"
          onClick={onAnalyzeScore}
          disabled={disabled || isLoading}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 28px',
            borderRadius: '12px',
            background: 'var(--color-surface-container)',
            border: '1px solid var(--border-ghost)',
            color: 'var(--color-secondary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
            opacity: disabled || isLoading ? 0.55 : 1,
            transition: 'background 150ms ease, box-shadow 150ms ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isLoading) {
              e.currentTarget.style.background = 'var(--color-surface-high-2, #262a34)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-container)';
          }}
        >
          {isAnalyzing ? (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}
              >
                sync
              </span>
              <span>Calculating Baseline ATS Score…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                speed
              </span>
              <span>Check ATS Score First</span>
            </>
          )}
        </button>

        {/* Button 2: Optimize Resume */}
        <button
          id="btn-optimize-main"
          type="button"
          onClick={onOptimize}
          disabled={disabled || isLoading}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 28px',
            borderRadius: '12px',
            background: 'var(--color-primary)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'var(--color-on-primary-container)',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.01em',
            cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
            opacity: disabled || isAnalyzing ? 0.55 : 1,
            transition: 'all 150ms ease',
            boxShadow: '0 0 24px rgba(37,99,235,0.45)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isLoading) {
              e.currentTarget.style.boxShadow = '0 0 32px rgba(76, 215, 246, 0.55)';
              e.currentTarget.style.filter = 'brightness(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 24px rgba(37,99,235,0.45)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          {isOptimizing ? (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', color: 'var(--color-tertiary)', animation: 'spin 1s linear infinite' }}
              >
                sync
              </span>
              <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '15px' }}>Optimizing with Gemini…</span>
                <span style={{ display: 'block', fontSize: '11px', opacity: 0.75, animation: 'fade-pulse 2s ease infinite' }}>
                  {LOADING_MESSAGES[msgIdx]}
                </span>
              </div>
            </>
          ) : (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', color: 'var(--color-tertiary)' }}
              >
                auto_awesome
              </span>
              <span>Optimize Resume for ATS</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                arrow_forward
              </span>
            </>
          )}
        </button>
      </div>

      {/* Fast-Toggles row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          paddingTop: '4px',
        }}
      >
        {[
          'STAR Achievement Conversion',
          'Strict Factual Guardrails',
          'Format for Workday / Lever',
        ].map((label) => (
          <label
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              defaultChecked
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                accentColor: 'var(--color-primary)',
                cursor: 'pointer',
              }}
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-on-surface)',
              }}
            >
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Keyboard Shortcut Hint */}
      {!isLoading && !disabled && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-text-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>Tip: Press</span>
          <kbd
            style={{
              padding: '2px 6px',
              fontSize: '11px',
              background: 'var(--color-surface-high-2, #262a34)',
              border: '1px solid var(--border-ghost)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            Ctrl
          </kbd>
          <span>+</span>
          <kbd
            style={{
              padding: '2px 6px',
              fontSize: '11px',
              background: 'var(--color-surface-high-2, #262a34)',
              border: '1px solid var(--border-ghost)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            Enter
          </kbd>
          <span>to optimize</span>
        </p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-pulse { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
        @media (min-width: 640px) {
          .sm-flex-row-override { flex-direction: row !important; }
        }
      `}</style>
    </div>
  );
};
