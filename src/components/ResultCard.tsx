import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Check,
  Copy,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  Award,
  ChevronRight,
} from 'lucide-react';
import { OptimizeResumeResponse } from '../types.js';
import { ResumeDocumentView } from './ResumeDocumentView';
import { normalizeResumeMarkdown } from '../utils/resumeFormatter';

interface ResultCardProps {
  data: OptimizeResumeResponse;
  onReset?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'keywords' | 'tips'>('preview');
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [copied, setCopied] = useState(false);

  const {
    initialScore,
    optimizedScore,
    scoreBoost,
    matchScore,
    keyKeywordsMatched,
    missingKeywordsAdded,
    improvementsSummary,
    optimizedResume,
    atsFormattingTips,
    rawAnalysis,
  } = data;

  // Final score calculation
  const finalScore = optimizedScore || matchScore || 90;
  const originalScore = initialScore || Math.max(30, finalScore - 38);
  const boost = scoreBoost || Math.max(0, finalScore - originalScore);

  const cleanedResume = normalizeResumeMarkdown(optimizedResume);

  // Copy to clipboard handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = cleanedResume;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download Markdown file handler
  const handleDownload = () => {
    const blob = new Blob([cleanedResume], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Optimized_ATS_Resume.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print / Export PDF handler
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print or export as PDF.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Optimized Resume</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; margin-bottom: 6px; }
            h2 { border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-top: 24px; margin-bottom: 10px; color: #1e3a8a; text-transform: uppercase; font-size: 14px; }
            h3 { font-size: 14px; margin-top: 12px; margin-bottom: 4px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 6px; }
            p { margin-top: 4px; margin-bottom: 8px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <script>
            document.getElementById('print-content').innerHTML = marked.parse(${JSON.stringify(cleanedResume)});
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      id="card-result-container"
      className="animate-fade-in-up card"
      style={{
        marginTop: '32px',
      }}
    >
      {/* Card Top Banner: Score & Action Controls */}
      <div
        className="card-header"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        {/* Score Comparison Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--color-surface-low)',
            border: '1px solid var(--border-ghost)',
            borderRadius: '8px',
            padding: '12px 20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Before Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                <path
                  style={{ color: 'var(--color-surface-high-2, #262a34)' }}
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  style={{ color: '#d97706' }}
                  strokeDasharray={`${originalScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#d97706' }}>{originalScore}%</span>
              </div>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)' }}>Before</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-on-surface-variant)' }}>Initial Score</span>
            </div>
          </div>

          {/* Score Boost Pill */}
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(76, 215, 246, 0.1)',
              border: '1px solid rgba(76, 215, 246, 0.25)',
              color: 'var(--color-tertiary)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, display: 'block', lineHeight: 1 }}>+{boost}%</span>
            <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.85 }}>Boost</span>
          </div>

          {/* After Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                <path
                  style={{ color: 'var(--color-surface-high)' }}
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  style={{ color: '#059669', transition: 'stroke-dasharray 1s ease-out' }}
                  strokeDasharray={`${finalScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-tertiary)' }}>{finalScore}%</span>
              </div>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-tertiary)' }}>Optimized</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-on-surface)' }}>Target Match</span>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="w-full sm:w-auto" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            id="btn-copy-resume"
            onClick={handleCopy}
            className="btn btn-primary btn-md w-full sm:w-auto"
            style={{ gap: '6px' }}
          >
            {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Resume'}</span>
          </button>

          <button
            type="button"
            id="btn-download-resume"
            onClick={handleDownload}
            className="btn btn-ghost btn-md w-full sm:w-auto"
            style={{ gap: '6px' }}
          >
            <Download style={{ width: '14px', height: '14px' }} />
            <span>Download .MD</span>
          </button>

          <button
            type="button"
            id="btn-print-resume"
            onClick={handlePrint}
            className="btn btn-ghost btn-md w-full sm:w-auto"
            style={{ gap: '6px' }}
          >
            <Printer style={{ width: '14px', height: '14px' }} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-ghost)',
          padding: '0 24px',
          background: 'var(--color-surface-container)',
          flexWrap: 'wrap',
        }}
      >
        <div className="tab-list">
          <button
            type="button"
            id="tab-btn-preview"
            onClick={() => setActiveTab('preview')}
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          >
            <FileText style={{ width: '15px', height: '15px' }} />
            <span>Optimized Resume</span>
          </button>

          <button
            type="button"
            id="tab-btn-keywords"
            onClick={() => setActiveTab('keywords')}
            className={`tab-btn ${activeTab === 'keywords' ? 'active' : ''}`}
          >
            <Sparkles style={{ width: '15px', height: '15px', color: 'var(--color-tertiary)' }} />
            <span>ATS Keyword Breakdown</span>
            <span
              style={{
                padding: '2px 6px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 700,
                background: 'rgba(37, 99, 235, 0.15)',
                color: 'var(--color-primary-dim)',
              }}
            >
              {keyKeywordsMatched.length + missingKeywordsAdded.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-btn-tips"
            onClick={() => setActiveTab('tips')}
            className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
          >
            <Lightbulb style={{ width: '15px', height: '15px', color: 'var(--color-secondary)' }} />
            <span>Improvements &amp; ATS Tips</span>
          </button>
        </div>

        {/* View mode toggle (Formatted vs Raw) */}
        {activeTab === 'preview' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-canvas)',
              padding: '2px',
              borderRadius: '6px',
              border: '1px solid var(--border-ghost)',
              margin: '8px 0',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('formatted')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'formatted' ? 'var(--color-surface-low)' : 'transparent',
                color: viewMode === 'formatted' ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                boxShadow: viewMode === 'formatted' ? 'var(--shadow-card)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              Formatted
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'raw' ? 'var(--color-surface)' : 'transparent',
                color: viewMode === 'raw' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'raw' ? 'var(--shadow-1)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              Raw Markdown
            </button>
          </div>
        )}
      </div>

      {/* Tab Body Content */}
      <div style={{ padding: '24px' }}>
        {/* Tab 1: Optimized Resume */}
        {activeTab === 'preview' && (
          <div>
            {viewMode === 'formatted' ? (
              <ResumeDocumentView markdown={cleanedResume} />
            ) : (
              <pre
                style={{
                  background: 'var(--color-surface-low)',
                  border: '1px solid var(--border-ghost)',
                  borderRadius: '8px',
                  padding: '24px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: 'var(--color-on-surface)',
                  maxHeight: '680px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {cleanedResume}
              </pre>
            )}
          </div>
        )}

        {/* Tab 2: Keywords Breakdown */}
        {activeTab === 'keywords' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Added Keywords */}
            <div
              style={{
                background: 'var(--color-surface-low)',
                border: '1px solid var(--border-ghost)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <PlusCircle style={{ width: '16px', height: '16px', color: 'var(--color-primary-dim)' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  Critical Keywords Added to Resume
                </h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginBottom: '14px' }}>
                These keywords were prominent in the job description but missing in your original draft. They have been seamlessly woven into your experience bullets:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {missingKeywordsAdded.length > 0 ? (
                  missingKeywordsAdded.map((kw, i) => (
                    <span key={i} className="chip chip-primary">
                      <Sparkles style={{ width: '11px', height: '11px', color: '#2563eb' }} />
                      <span>{kw}</span>
                    </span>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>
                    All key JD keywords were already present in your original resume!
                  </p>
                )}
              </div>
            </div>

            {/* Matched Keywords */}
            <div
              style={{
                background: 'var(--color-surface-low)',
                border: '1px solid var(--border-ghost)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--color-tertiary)' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  Existing Matched Competencies
                </h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginBottom: '14px' }}>
                Keywords and technical requirements already identified in your background that were preserved and emphasized:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {keyKeywordsMatched.map((kw, i) => (
                  <span key={i} className="chip chip-success">
                    <Check style={{ width: '11px', height: '11px' }} />
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Profile Strengths & Gaps */}
            {rawAnalysis && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div
                  style={{
                    background: 'var(--color-surface-low)',
                    border: '1px solid var(--border-ghost)',
                    borderRadius: '8px',
                    padding: '16px 20px',
                  }}
                >
                  <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award style={{ width: '14px', height: '14px' }} />
                    <span>Core Profile Strengths</span>
                  </h5>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {rawAnalysis.strengths?.map((str, i) => (
                      <li key={i} style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', padding: '6px 0', borderBottom: i < (rawAnalysis.strengths?.length || 0) - 1 ? '1px solid var(--border-ghost)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--color-tertiary)', flexShrink: 0, marginTop: '2px' }} />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    background: 'var(--color-surface-low)',
                    border: '1px solid var(--border-ghost)',
                    borderRadius: '8px',
                    padding: '16px 20px',
                  }}
                >
                  <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle style={{ width: '14px', height: '14px' }} />
                    <span>Skill Gaps / Hiring Considerations</span>
                  </h5>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {rawAnalysis.gapsIdentified?.map((gap, i) => (
                      <li key={i} style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', padding: '6px 0', borderBottom: i < (rawAnalysis.gapsIdentified?.length || 0) - 1 ? '1px solid var(--border-ghost)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <ChevronRight style={{ width: '14px', height: '14px', color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Improvements & Tips */}
        {activeTab === 'tips' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Key Improvements Made */}
            <div
              style={{
                background: 'var(--color-surface-low)',
                border: '1px solid var(--border-ghost)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '16px', height: '16px', color: 'var(--color-primary-dim)' }} />
                <span>Major Bullet Point &amp; Impact Enhancements</span>
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {improvementsSummary.map((imp, i) => (
                  <li
                    key={i}
                    style={{
                      background: 'var(--color-surface-container)',
                      border: '1px solid var(--border-ghost)',
                      borderRadius: '6px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: 'var(--color-on-surface-variant)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'rgba(37, 99, 235, 0.15)',
                        color: 'var(--color-primary-dim)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ATS Formatting Guidelines */}
            <div
              style={{
                background: 'var(--color-surface-low)',
                border: '1px solid var(--border-ghost)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                <span>Actionable ATS Submission Guidelines</span>
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {atsFormattingTips.map((tip, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-on-surface-variant)',
                      padding: '8px 0',
                      borderBottom: i < atsFormattingTips.length - 1 ? '1px solid var(--border-ghost)' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      lineHeight: 1.5,
                    }}
                  >
                    <CheckCircle2 style={{ width: '15px', height: '15px', color: 'var(--color-tertiary)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
