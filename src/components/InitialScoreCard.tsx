import React from 'react';
import {
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  XCircle,
  FileSearch,
  ListFilter,
  Check,
} from 'lucide-react';
import { AtsAnalysisResponse } from '../types.js';

interface InitialScoreCardProps {
  data: AtsAnalysisResponse;
  onProceedToOptimize: () => void;
  isOptimizing?: boolean;
}

export const InitialScoreCard: React.FC<InitialScoreCardProps> = ({
  data,
  onProceedToOptimize,
  isOptimizing,
}) => {
  const {
    initialScore,
    matchedKeywords,
    missingKeywords,
    criticalGaps,
    formattingIssues,
    recommendations,
    summary,
  } = data;

  const getScoreConfig = (score: number) => {
    if (score >= 75) return { color: 'var(--color-tertiary)', bg: 'rgba(76, 215, 246, 0.08)', border: 'rgba(76, 215, 246, 0.2)', label: 'Good Initial Match', trackFill: 'progress-fill-success' };
    if (score >= 50) return { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', label: 'Moderate Match — Gaps Found', trackFill: 'progress-fill-warning' };
    return { color: 'var(--color-error)', bg: 'rgba(255, 180, 171, 0.08)', border: 'rgba(255, 180, 171, 0.2)', label: 'Low ATS Match — Optimization Required', trackFill: '' };
  };

  const cfg = getScoreConfig(initialScore);

  return (
    <div
      id="card-initial-score-container"
      className="animate-fade-in-up card"
      style={{
        marginTop: '24px',
      }}
    >
      {/* Card Header */}
      <div
        className="card-header"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Score + Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Circular Score */}
          <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
              <path
                style={{ color: 'var(--color-surface-high-2, #262a34)' }}
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                style={{ color: cfg.color, transition: 'stroke-dasharray 1s ease-out' }}
                strokeDasharray={`${initialScore}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{initialScore}%</span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>ATS Score</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: cfg.bg,
                  color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                {cfg.label}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Pre-Optimization Baseline</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              Initial ATS Match Score
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', lineHeight: 1.5, maxWidth: '540px' }}>{summary}</p>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          id="btn-proceed-optimize-from-score"
          onClick={onProceedToOptimize}
          disabled={isOptimizing}
          className="btn btn-primary btn-lg"
          style={{ flexShrink: 0, gap: '8px' }}
        >
          <Sparkles style={{ width: '15px', height: '15px', color: '#fbbf24' }} />
          <span>Apply AI Optimization Now</span>
          <ArrowRight style={{ width: '15px', height: '15px' }} />
        </button>
      </div>

      {/* Grid Details */}
      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Keywords Analysis */}
        <div
          style={{
            background: 'var(--color-surface-low)',
            border: '1px solid var(--border-ghost)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-ghost)',
            }}
          >
            <ListFilter style={{ width: '14px', height: '14px', color: 'var(--color-primary-dim)' }} />
            <span>Keyword Coverage Audit</span>
          </h4>

          {/* Missing Keywords */}
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-error)',
                marginBottom: '8px',
              }}
            >
              <XCircle style={{ width: '13px', height: '13px' }} />
              Missing High-Priority Keywords ({missingKeywords.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {missingKeywords.map((kw, i) => (
                <span key={i} className="chip chip-error">{kw}</span>
              ))}
            </div>
          </div>

          {/* Matched Keywords */}
          <div>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-tertiary)',
                marginBottom: '8px',
              }}
            >
              <CheckCircle2 style={{ width: '13px', height: '13px' }} />
              Currently Matched ({matchedKeywords.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {matchedKeywords.map((kw, i) => (
                <span key={i} className="chip chip-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Check style={{ width: '10px', height: '10px' }} />
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Gaps & Bullet Weaknesses */}
        <div
          style={{
            background: 'var(--color-surface-low)',
            border: '1px solid var(--border-ghost)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-ghost)',
            }}
          >
            <FileSearch style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
            <span>Critical Gaps &amp; Formatting Weaknesses</span>
          </h4>

          {criticalGaps.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#b45309',
                  marginBottom: '8px',
                }}
              >
                <AlertTriangle style={{ width: '13px', height: '13px' }} />
                Qualification Gaps
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {criticalGaps.map((gap, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-on-surface-variant)',
                      padding: '6px 0',
                      borderBottom: i < criticalGaps.length - 1 ? '1px solid var(--border-ghost)' : 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {formattingIssues.length > 0 && (
            <div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '8px',
                }}
              >
                <Gauge style={{ width: '13px', height: '13px', color: 'var(--color-primary-dim)' }} />
                Formatting &amp; Structure Issues
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {formattingIssues.map((issue, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-on-surface-variant)',
                      padding: '6px 0',
                      borderBottom: i < formattingIssues.length - 1 ? '1px solid var(--border-ghost)' : 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
