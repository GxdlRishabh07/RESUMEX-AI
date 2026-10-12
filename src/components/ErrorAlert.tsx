import React from 'react';
import { ApiErrorResponse } from '../types.js';

interface ErrorAlertProps {
  error: ApiErrorResponse | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  return (
    <div
      id="alert-error-container"
      className="animate-fade-in-up"
      style={{
        margin: '16px 0',
        padding: '16px',
        borderRadius: '8px',
        background: 'rgba(147, 0, 10, 0.15)',
        border: '1px solid rgba(255, 180, 171, 0.2)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            padding: '8px',
            background: 'rgba(255, 180, 171, 0.1)',
            borderRadius: '6px',
            color: 'var(--color-error)',
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            error
          </span>
        </div>
        <div>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--color-error)',
              marginBottom: '4px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {error.error || 'Optimization Error'}
          </h4>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 180, 171, 0.85)',
              lineHeight: 1.5,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {error.details}
          </p>
          {error.code && (
            <span
              style={{
                display: 'inline-block',
                marginTop: '8px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                background: 'rgba(255, 180, 171, 0.08)',
                border: '1px solid rgba(255, 180, 171, 0.15)',
                color: 'var(--color-error)',
              }}
            >
              Code: {error.code}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid rgba(255, 180, 171, 0.3)',
              borderRadius: '6px',
              color: 'var(--color-error)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>refresh</span>
            <span>Retry</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: '6px',
            color: 'var(--color-error)',
            cursor: 'pointer',
          }}
          aria-label="Dismiss error"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
        </button>
      </div>
    </div>
  );
};
