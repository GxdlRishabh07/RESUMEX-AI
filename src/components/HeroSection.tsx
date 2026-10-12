import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero-section"
      style={{
        textAlign: 'center',
        paddingTop: '48px',
        paddingBottom: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      {/* Enterprise Tag Badge */}
      <div>
        <div className="ai-badge">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px' }}
          >
            memory
          </span>
          <span>Enterprise-Grade ATS Resume Optimization Engine</span>
        </div>
      </div>

      {/* Main Headline */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5.5vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: 'var(--color-on-surface)',
          margin: 0,
          maxWidth: '860px',
        }}
      >
        Tailor Your Resume to Any Job{' '}
        <span className="headline-accent">Description</span>{' '}
        in Seconds
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(15px, 2vw, 17px)',
          fontWeight: 400,
          lineHeight: 1.65,
          color: 'var(--color-on-surface-variant)',
          maxWidth: '680px',
          margin: 0,
        }}
      >
        Pass automated ATS scanners like Workday, Greenhouse &amp; Lever. Gemini neural models analyze
        missing key skills, rewrite bullet points into measurable STAR achievements, and dramatically boost
        your interview callback rate.
      </p>

      {/* Trust Pillars Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          paddingTop: '4px',
        }}
      >
        <div className="trust-pill">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: 'var(--color-tertiary)' }}
          >
            verified
          </span>
          <span>Factual Accuracy Guaranteed</span>
        </div>
        <div className="trust-pill">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: 'var(--color-secondary)' }}
          >
            radar
          </span>
          <span>Semantic Keyword Extraction &amp; Injection</span>
        </div>
        <div className="trust-pill">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: 'var(--color-tertiary)' }}
          >
            bolt
          </span>
          <span>Instant ATS Score Benchmark</span>
        </div>
        <div className="trust-pill">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: 'var(--color-primary-dim)' }}
          >
            lock
          </span>
          <span>100% Privacy &amp; Zero Training Retention</span>
        </div>
      </div>
    </section>
  );
};
