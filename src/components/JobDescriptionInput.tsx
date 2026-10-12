import React, { useState, useRef } from 'react';
import { SAMPLE_DATASETS } from '../data/samples.js';

interface JobDescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  experienceLevel: string;
  onExperienceLevelChange: (level: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Executive') => void;
  onSelectSample: (index: number) => void;
  disabled?: boolean;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  experienceLevel,
  onExperienceLevelChange,
  onSelectSample,
  disabled,
}) => {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const [presetOpen, setPresetOpen] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  // Keyword count estimate
  const keywordCount = value.trim()
    ? Math.min(
        Math.round(value.split(/\b[A-Z][a-z]*(?:\.[a-z]+)?\b/g).length * 0.6 + wordCount / 10),
        99,
      )
    : 0;

  const levels = ['Entry-Level', 'Mid-Level', 'Senior', 'Staff / Exec'] as const;
  const levelMap: Record<string, 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Executive'> = {
    'Entry-Level': 'Entry-Level',
    'Mid-Level': 'Mid-Level',
    'Senior': 'Senior',
    'Staff / Exec': 'Executive',
  };

  const displayLevel = experienceLevel === 'Executive' ? 'Staff / Exec' : experienceLevel;

  return (
    <article
      id="card-jd-input"
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 300ms ease',
      }}
    >
      {/* Card Header */}
      <div
        className="card-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
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
              style={{ fontSize: '22px', color: 'var(--color-tertiary)' }}
            >
              work
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-on-surface)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Target Job Description
            </h2>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-on-surface-variant)',
                margin: '2px 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Paste the job posting you want to target
            </p>
          </div>
        </div>

        {/* Preset Role Dropdown */}
        <div
          ref={presetRef}
          style={{ position: 'relative', flexShrink: 0 }}
          id="presetRoleContainer"
        >
          <button
            id="presetDropdownToggle"
            type="button"
            disabled={disabled}
            onClick={() => setPresetOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'var(--color-surface-highest, #31353f)',
              border: 'none',
              color: 'var(--color-tertiary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'filter 150ms ease',
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_fix_high</span>
            <span id="currentPresetTitle" className="hidden sm:inline">Staff Cloud Architect</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>expand_more</span>
          </button>

          {presetOpen && (
            <div
              id="presetMenu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '260px',
                borderRadius: '12px',
                background: 'var(--color-surface-high-2, #262a34)',
                border: '1px solid var(--border-ghost)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                padding: '6px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {SAMPLE_DATASETS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelectSample(i);
                    setPresetOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-highest, #31353f)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-tertiary)' }}>
                    {sample.title}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                    {sample.jobDescription?.substring(0, 60)}…
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seniority Experience Selector Bar */}
      <div
        style={{
          padding: '10px 24px',
          background: 'rgba(38, 42, 52, 0.6)',
          borderBottom: '1px solid var(--border-ghost)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-tertiary)' }}>
            layers
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Target Level:</span>
        </div>

        <div
          id="seniorityToggleGroup"
          className="segmented-track"
          style={{ display: 'inline-flex', gap: '2px' }}
        >
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`segmented-btn${displayLevel === lvl ? ' active' : ''}`}
              onClick={() => onExperienceLevelChange(levelMap[lvl])}
              disabled={disabled}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Job Description Input Viewport */}
      <div
        style={{
          padding: '16px 24px',
          background: 'var(--color-canvas)',
          flex: 1,
        }}
      >
        <div
          style={{
            borderRadius: '8px',
            background: 'var(--color-surface-low)',
            padding: '8px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
            minHeight: '240px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <textarea
            id="textarea-jd-content"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={`Paste target job description here...\n\nExample:\nRole: Staff Software Engineer - Distributed Cloud Architecture\nCompany: HyperScale Data Technologies\n\nWe are seeking an experienced Staff Full Stack Systems Engineer...`}
            style={{
              width: '100%',
              flex: 1,
              minHeight: '220px',
              background: 'transparent',
              color: 'var(--color-on-surface)',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              lineHeight: 1.7,
              outline: 'none',
              resize: 'none',
              border: 'none',
              padding: '6px 8px',
            }}
          />
        </div>
      </div>

      {/* Telemetry Footer */}
      <div
        style={{
          padding: '8px 24px',
          background: 'var(--color-surface-container)',
          borderTop: '1px solid var(--border-ghost)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--color-surface-high-2, #262a34)',
              color: 'var(--color-on-surface)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {wordCount} words
          </span>
          {keywordCount > 0 && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--color-surface-high-2, #262a34)',
                color: 'var(--color-tertiary)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {keywordCount} Keywords Extracted
            </span>
          )}
          {value.trim().length > 0 && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--color-surface-high-2, #262a34)',
                color: 'var(--color-on-surface)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              Target: {experienceLevel}
            </span>
          )}
        </div>

        <button
          type="button"
          id="btn-clear-jd"
          onClick={() => onChange('')}
          disabled={disabled || !value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: value ? 'var(--color-on-surface-variant)' : 'var(--color-text-subtle)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: disabled || !value ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-sans)',
            padding: '2px 4px',
            borderRadius: '4px',
            transition: 'color 150ms ease',
            opacity: !value ? 0.4 : 1,
          }}
          onMouseEnter={(e) => { if (value && !disabled) e.currentTarget.style.color = 'var(--color-error)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = value ? 'var(--color-on-surface-variant)' : 'var(--color-text-subtle)'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete_sweep</span>
          <span>Clear</span>
        </button>
      </div>

      {/* Close dropdown on outside click */}
      {presetOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
          }}
          onClick={() => setPresetOpen(false)}
        />
      )}
    </article>
  );
};
