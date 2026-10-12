import React, { useRef, useState, useCallback } from 'react';
import { parseResumeFile, ParseResult } from '../utils/fileParser.js';

interface ResumeInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onLoadSample?: () => void;
}

interface UploadedFileInfo {
  name: string;
  size: number;
  type: ParseResult['fileType'];
  pageCount?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: ParseResult['fileType']): string {
  switch (type) {
    case 'pdf':
      return 'picture_as_pdf';
    case 'docx':
    case 'doc':
      return 'article';
    case 'txt':
    case 'md':
      return 'description';
    default:
      return 'attach_file';
  }
}

function getFileTypeBadge(type: ParseResult['fileType']): { label: string; bg: string; color: string } {
  switch (type) {
    case 'pdf':
      return { label: 'PDF', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
    case 'docx':
      return { label: 'DOCX', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' };
    case 'doc':
      return { label: 'DOC', bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' };
    case 'md':
      return { label: 'MD', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' };
    default:
      return { label: 'TXT', bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' };
  }
}

export const ResumeInput: React.FC<ResumeInputProps> = ({
  value,
  onChange,
  disabled,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [parsingStatus, setParsingStatus] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  // Detect resume sections
  const detectSections = (text: string): string => {
    const parts: string[] = [];
    if (/summary|profile|objective|overview/i.test(text)) parts.push('Summary');
    if (/skill|expertise|proficiency|competenc|technolog/i.test(text)) parts.push('Skills');
    if (/experience|employment|work history|career/i.test(text)) parts.push('Experience');
    if (/education|degree|university|bachelor|master|phd/i.test(text)) parts.push('Education');
    if (/project|portfolio|publication/i.test(text)) parts.push('Projects');
    if (/certif|licens/i.test(text)) parts.push('Certifications');
    if (parts.length === 0 && text.trim().length > 0) parts.push('Content');
    return parts.join(', ');
  };

  const detectedSections = value.trim() ? detectSections(value) : '';

  // Process file upload (either via file dialog or drag & drop)
  const processFile = async (file: File) => {
    setParseError(null);
    setIsParsing(true);
    setParsingStatus(`Reading ${file.name}...`);

    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setParsingStatus('Extracting PDF text layer & layout...');
      } else if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
        setParsingStatus('Parsing Word document elements...');
      } else {
        setParsingStatus('Reading document content...');
      }

      const result = await parseResumeFile(file);

      if (!result.text || !result.text.trim()) {
        throw new Error('The file was parsed but contained no readable text.');
      }

      onChange(result.text);
      setUploadedFile({
        name: result.fileName,
        size: result.fileSize,
        type: result.fileType,
        pageCount: result.pageCount,
      });
    } catch (err: any) {
      console.error('File parsing error:', err);
      setParseError(err?.message || 'Failed to extract text from file. Please paste text directly.');
    } finally {
      setIsParsing(false);
      setParsingStatus('');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so selecting the same file triggers change
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isParsing) {
      setIsDragging(true);
    }
  }, [disabled, isParsing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isParsing) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [disabled, isParsing]);

  const handleClear = () => {
    onChange('');
    setUploadedFile(null);
    setParseError(null);
  };

  return (
    <article
      id="card-resume-input"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: isDragging
          ? '2px dashed var(--color-tertiary)'
          : undefined,
        boxShadow: isDragging
          ? '0 0 24px rgba(76, 215, 246, 0.25), 0 8px 32px -4px rgba(0,0,0,0.5)'
          : undefined,
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
        position: 'relative',
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
        className="hidden"
        id="fileUploaderInput"
        disabled={disabled || isParsing}
      />

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
              style={{ fontSize: '22px', color: 'var(--color-secondary)' }}
            >
              description
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
              Your Current Resume
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
              Upload PDF / DOCX / DOC or paste text below
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Sample SWE */}
          {onLoadSample && (
            <button
              type="button"
              id="resumeSampleBtn"
              onClick={onLoadSample}
              disabled={disabled || isParsing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'var(--color-surface-high-2, #262a34)',
                border: 'none',
                color: 'var(--color-on-surface-variant)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: disabled || isParsing ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'color 150ms ease, background 150ms ease',
                opacity: disabled || isParsing ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isParsing) e.currentTarget.style.color = 'var(--color-on-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-on-surface-variant)';
              }}
              title="Load example Software Engineer resume"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                data_object
              </span>
              <span className="hidden sm:inline">Sample SWE</span>
            </button>
          )}

          {/* Upload Button */}
          <button
            type="button"
            id="btn-upload-resume"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isParsing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(76, 215, 246, 0.08) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: 'var(--color-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: disabled || isParsing ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 150ms ease',
              opacity: disabled || isParsing ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled && !isParsing) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(76, 215, 246, 0.15) 100%)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(76, 215, 246, 0.08) 100%)';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
            }}
            title="Upload PDF, DOCX, DOC, or TXT file"
          >
            {isParsing ? (
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: '16px', color: 'var(--color-tertiary)' }}
              >
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                upload_file
              </span>
            )}
            <span>Upload Resume</span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#bae6fd',
                letterSpacing: '0.02em',
                fontWeight: 700,
              }}
            >
              PDF / DOC
            </span>
          </button>
        </div>
      </div>

      {/* Parsing Active Progress Banner */}
      {isParsing && (
        <div
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(90deg, rgba(0, 120, 140, 0.3) 0%, rgba(13, 21, 39, 0.8) 100%)',
            borderBottom: '1px solid rgba(76, 215, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            className="material-symbols-outlined animate-spin"
            style={{ fontSize: '18px', color: 'var(--color-tertiary)' }}
          >
            progress_activity
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-tertiary)',
              }}
            >
              {parsingStatus || 'Processing file...'}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--color-on-surface-variant)',
              fontStyle: 'italic',
            }}
          >
            Client-side parsing
          </span>
        </div>
      )}

      {/* Error Alert inside card if parsing fails */}
      {parseError && (
        <div
          style={{
            padding: '10px 20px',
            background: 'rgba(239, 68, 68, 0.12)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px', color: '#f87171', flexShrink: 0 }}
            >
              error
            </span>
            <span style={{ fontSize: '12px', color: '#fca5a5', lineHeight: 1.4 }}>
              {parseError}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setParseError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss error"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
      )}

      {/* Uploaded File Indicator Banner */}
      {uploadedFile && value.trim().length > 0 && !isParsing && (
        <div
          style={{
            padding: '8px 20px',
            background: 'rgba(22, 33, 56, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            borderBottom: '1px solid var(--border-ghost)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexWrap: 'wrap' }}>
            {/* File type badge */}
            {(() => {
              const badge = getFileTypeBadge(uploadedFile.type);
              return (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: badge.bg,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              );
            })()}

            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', color: 'var(--color-secondary)' }}
            >
              {getFileIcon(uploadedFile.type)}
            </span>

            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-on-surface)',
                maxWidth: '260px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={uploadedFile.name}
            >
              {uploadedFile.name}
            </span>

            <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              ({formatFileSize(uploadedFile.size)}
              {uploadedFile.pageCount ? ` • ${uploadedFile.pageCount} ${uploadedFile.pageCount === 1 ? 'page' : 'pages'}` : ''}
              {` • ${wordCount} words`})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(0, 120, 140, 0.4)',
                color: 'var(--color-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-tertiary)',
                  display: 'inline-block',
                }}
              />
              Parsed
            </span>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isParsing}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
              title="Upload another file"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sync</span>
              <span>Replace</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Content Banner (when text entered manually without a file upload) */}
      {!uploadedFile && value.trim().length > 0 && !isParsing && (
        <div
          style={{
            padding: '8px 20px',
            background: 'rgba(38, 42, 52, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-ghost)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--color-tertiary)',
                display: 'inline-block',
                animation: 'pulse-dot 2s ease infinite',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-on-surface)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Resume Content
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              ({wordCount} words • {charCount} chars)
            </span>
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(0, 120, 140, 0.4)',
              color: 'var(--color-tertiary)',
              flexShrink: 0,
            }}
          >
            Ready
          </span>
        </div>
      )}

      {/* Editor Viewport */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--color-canvas)',
          flex: 1,
          position: 'relative',
        }}
      >
        {/* Drag and drop overlay indicator */}
        {isDragging && (
          <div
            style={{
              position: 'absolute',
              inset: '12px',
              borderRadius: '8px',
              background: 'rgba(13, 21, 39, 0.92)',
              border: '2px dashed var(--color-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              gap: '8px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '40px', color: 'var(--color-secondary)' }}
            >
              upload_file
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
              Drop your PDF, DOCX, or DOC file here
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              Text will be automatically extracted and populated
            </span>
          </div>
        )}

        <div
          style={{
            borderRadius: '8px',
            background: 'var(--color-surface-low)',
            padding: '8px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
            minHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <textarea
            id="textarea-resume-content"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isParsing}
            placeholder={`Upload a PDF / DOCX file above, drop a file here, or paste your resume...\n\nExample:\nAlex Chen\nStaff Full Stack Systems Engineer | San Francisco, CA\n\nPROFESSIONAL SUMMARY\nHigh-impact software architect with 8+ years experience scaling distributed cloud systems...\n\nTECHNICAL EXPERTISE\n- Languages: TypeScript, JavaScript, Go, Python, SQL\n- Frameworks: React, Next.js, Node.js, Express\n- Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD`}
            style={{
              width: '100%',
              flex: 1,
              minHeight: '260px',
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
          padding: '8px 20px',
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
            {charCount.toLocaleString()} chars
          </span>
          {detectedSections && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--color-surface-high-2, #262a34)',
                color: 'var(--color-secondary)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {detectedSections} detected
            </span>
          )}
        </div>

        <button
          type="button"
          id="btn-clear-resume"
          onClick={handleClear}
          disabled={disabled || isParsing || !value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: value ? 'var(--color-on-surface-variant)' : 'var(--color-text-subtle)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: disabled || isParsing || !value ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-sans)',
            padding: '2px 4px',
            borderRadius: '4px',
            transition: 'color 150ms ease',
            opacity: !value || isParsing ? 0.4 : 1,
          }}
          onMouseEnter={(e) => {
            if (value && !disabled && !isParsing) e.currentTarget.style.color = 'var(--color-error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = value ? 'var(--color-on-surface-variant)' : 'var(--color-text-subtle)';
          }}
          title="Clear resume content"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
            delete_sweep
          </span>
          <span>Clear</span>
        </button>
      </div>
    </article>
  );
};
