/**
 * ResumeDocumentView — RESUMEX // AI
 * Renders an optimized resume as a professional, executive-formatted resume document.
 * Includes paper theme toggle (Paper White vs Dark Sheet), print/PDF optimization,
 * and semantic ATS typography.
 */

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { normalizeResumeMarkdown } from '../utils/resumeFormatter';

interface ResumeDocumentViewProps {
  markdown: string;
  defaultTheme?: 'paper' | 'dark';
  showControls?: boolean;
}

export const ResumeDocumentView: React.FC<ResumeDocumentViewProps> = ({
  markdown,
  defaultTheme = 'paper',
  showControls = true,
}) => {
  const [theme, setTheme] = useState<'paper' | 'dark'>(defaultTheme);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const cleanMarkdown = normalizeResumeMarkdown(markdown);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFormatDropdown(false);
      }
    };
    if (showFormatDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFormatDropdown]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Convert markdown to clean, semantic HTML matching Executive Paper styling
  const markdownToStaticHtml = (md: string): string => {
    const lines = md.split('\n');
    const htmlParts: string[] = [];
    let inList = false;

    const parseInline = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#2563eb;text-decoration:none;">$1</a>');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (inList) {
          htmlParts.push('</ul>');
          inList = false;
        }
        continue;
      }

      if (line.startsWith('# ')) {
        if (inList) { htmlParts.push('</ul>'); inList = false; }
        htmlParts.push(`<h1 style="font-size:22pt;font-weight:800;text-transform:uppercase;text-align:center;margin:0 0 6pt 0;color:#0f172a;letter-spacing:0.5pt;font-family:Calibri,Arial,sans-serif;">${parseInline(line.slice(2).trim())}</h1>`);
      } else if (line.startsWith('## ')) {
        if (inList) { htmlParts.push('</ul>'); inList = false; }
        htmlParts.push(`<h2 style="font-size:12pt;font-weight:800;text-transform:uppercase;letter-spacing:0.8pt;color:#1e3a8a;border-bottom:2pt solid #2563eb;padding-bottom:3pt;margin-top:16pt;margin-bottom:6pt;font-family:Calibri,Arial,sans-serif;">${parseInline(line.slice(3).trim())}</h2>`);
      } else if (line.startsWith('### ')) {
        if (inList) { htmlParts.push('</ul>'); inList = false; }
        htmlParts.push(`<h3 style="font-size:11pt;font-weight:700;color:#0f172a;margin-top:10pt;margin-bottom:3pt;font-family:Calibri,Arial,sans-serif;">${parseInline(line.slice(4).trim())}</h3>`);
      } else if (/^[-*•]\s+/.test(line)) {
        if (!inList) {
          htmlParts.push('<ul style="margin:4pt 0 8pt 0;padding-left:18pt;list-style-type:disc;">');
          inList = true;
        }
        const itemContent = line.replace(/^[-*•]\s+/, '').trim();
        htmlParts.push(`<li style="font-size:10pt;color:#1e293b;margin-bottom:3pt;line-height:1.5;font-family:Calibri,Arial,sans-serif;">${parseInline(itemContent)}</li>`);
      } else {
        if (inList) { htmlParts.push('</ul>'); inList = false; }
        const isContact = (line.includes('|') || line.includes('@')) && i <= 3;
        if (isContact) {
          htmlParts.push(`<p style="text-align:center;color:#475569;font-size:10pt;margin-top:2pt;margin-bottom:12pt;font-family:Calibri,Arial,sans-serif;">${parseInline(line)}</p>`);
        } else {
          htmlParts.push(`<p style="font-size:10.5pt;color:#334155;margin-top:3pt;margin-bottom:6pt;line-height:1.5;font-family:Calibri,Arial,sans-serif;">${parseInline(line)}</p>`);
        }
      }
    }

    if (inList) {
      htmlParts.push('</ul>');
    }

    return htmlParts.join('\n');
  };

  const handleDownload = (format: 'md' | 'txt' | 'html' | 'doc' = 'md') => {
    let fileContent = cleanMarkdown;
    let mimeType = 'text/markdown;charset=utf-8';
    let fileExtension = 'md';

    if (format === 'txt') {
      // Strip markdown syntax for pure ATS plain text
      fileContent = cleanMarkdown
        .replace(/^#+\s+/gm, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      mimeType = 'text/plain;charset=utf-8';
      fileExtension = 'txt';
    } else if (format === 'doc') {
      // Standard Microsoft Word Office HTML document format
      const bodyHtml = markdownToStaticHtml(cleanMarkdown);
      fileContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Optimized ATS Resume</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 8.5in 11.0in;
      margin: 0.75in 0.75in 0.75in 0.75in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 20pt;
      font-weight: 800;
      text-transform: uppercase;
      text-align: center;
      margin: 0 0 4pt 0;
      color: #0f172a;
      letter-spacing: 0.5pt;
    }
    h2 {
      font-size: 11.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8pt;
      color: #1e3a8a;
      border-bottom: 2pt solid #2563eb;
      padding-bottom: 3pt;
      margin-top: 14pt;
      margin-bottom: 5pt;
    }
    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 9pt;
      margin-bottom: 3pt;
    }
    p {
      font-size: 10.5pt;
      color: #334155;
      margin-top: 2pt;
      margin-bottom: 5pt;
      line-height: 1.5;
    }
    ul {
      margin-top: 3pt;
      margin-bottom: 6pt;
      padding-left: 20pt;
    }
    li {
      font-size: 10pt;
      color: #1e293b;
      margin-bottom: 3pt;
      line-height: 1.5;
    }
    strong {
      font-weight: 700;
      color: #0f172a;
    }
    em {
      font-style: italic;
      color: #64748b;
    }
    a {
      color: #2563eb;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="Section1">
    ${bodyHtml}
  </div>
</body>
</html>`;
      mimeType = 'application/msword;charset=utf-8';
      fileExtension = 'doc';
    } else if (format === 'html') {
      const bodyHtml = markdownToStaticHtml(cleanMarkdown);
      fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Optimized ATS Resume</title>
  <style>
    @page { margin: 15mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #0f172a;
      background: #ffffff;
      max-width: 850px;
      margin: 0 auto;
      padding: 30px;
    }
    h1 { font-size: 24px; font-weight: 800; text-transform: uppercase; text-align: center; margin: 0 0 8px 0; letter-spacing: 0.04em; }
    h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #1e3a8a; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin: 20px 0 10px 0; }
    h3 { font-size: 13.5px; font-weight: 700; margin: 12px 0 4px 0; }
    p { font-size: 12.5px; color: #334155; margin: 4px 0 8px 0; }
    ul { margin: 6px 0 10px 0; padding-left: 20px; list-style-type: disc; }
    li { font-size: 12px; color: #1e293b; margin-bottom: 4px; }
    strong { font-weight: 700; color: #0f172a; }
    em { font-style: italic; color: #64748b; }
    a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
      mimeType = 'text/html;charset=utf-8';
      fileExtension = 'html';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Optimized_ATS_Resume.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setShowFormatDropdown(false);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isPaper = theme === 'paper';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* View Options Bar */}
      {showControls && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--color-surface-container)',
            borderRadius: '8px',
            border: '1px solid var(--border-ghost)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {/* Theme Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Preview Mode:
            </span>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--color-canvas)',
                padding: '2px',
                borderRadius: '6px',
                border: '1px solid var(--border-ghost)',
              }}
            >
              <button
                type="button"
                onClick={() => setTheme('paper')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: isPaper ? '#ffffff' : 'transparent',
                  color: isPaper ? '#0f172a' : 'var(--color-text-secondary)',
                  boxShadow: isPaper ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 150ms ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: isPaper ? '#2563eb' : 'inherit' }}>description</span>
                Executive Paper (White)
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: !isPaper ? 'var(--color-surface-high)' : 'transparent',
                  color: !isPaper ? 'var(--color-on-surface)' : 'var(--color-text-secondary)',
                  boxShadow: !isPaper ? 'var(--shadow-card)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 150ms ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: !isPaper ? 'var(--color-tertiary)' : 'inherit' }}>dark_mode</span>
                Dark Sheet
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
              title="Copy formatted resume text"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {/* Download Option with Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  id="btn-download-resume-sheet"
                  onClick={() => handleDownload('md')}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    gap: '5px',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRight: '1px solid rgba(255,255,255,0.12)',
                  }}
                  title="Download optimized resume as Markdown (.md)"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {downloaded ? 'check' : 'download'}
                  </span>
                  <span>{downloaded ? 'Downloaded!' : 'Download'}</span>
                </button>
                <button
                  type="button"
                  id="btn-download-format-toggle"
                  onClick={() => setShowFormatDropdown((prev) => !prev)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '4px 5px',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                  title="Select download format (.md, .txt, .html)"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    expand_more
                  </span>
                </button>
              </div>

              {showFormatDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    zIndex: 60,
                    minWidth: '210px',
                    background: 'var(--color-surface-high, #1e222d)',
                    border: '1px solid var(--border-ghost)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <button
                    type="button"
                    id="btn-download-format-doc"
                    onClick={() => handleDownload('doc')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      color: 'var(--color-on-surface)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563eb' }}>article</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Word Document (.doc)</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>Formatted for Microsoft Word</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-download-format-html"
                    onClick={() => handleDownload('html')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      color: 'var(--color-on-surface)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4ade80' }}>html</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>HTML Document (.html)</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>Styled web resume layout</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-download-format-md"
                    onClick={() => handleDownload('md')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      color: 'var(--color-on-surface)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#38bdf8' }}>description</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Markdown (.md)</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>Standard ATS format</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-download-format-txt"
                    onClick={() => handleDownload('txt')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      color: 'var(--color-on-surface)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#a78bfa' }}>text_snippet</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Plain Text (.txt)</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>Clean ATS text</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
              title="Print or export as PDF"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>print</span>
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Realistic Resume Sheet Container */}
      <div
        id="resume-document-sheet"
        className={`resume-sheet-container ${isPaper ? 'theme-paper' : 'theme-dark'}`}
        style={{
          width: '100%',
          maxWidth: '850px',
          margin: '0 auto',
          background: isPaper ? '#ffffff' : 'var(--color-surface-low)',
          color: isPaper ? '#0f172a' : 'var(--color-on-surface)',
          borderRadius: '8px',
          boxShadow: isPaper
            ? '0 10px 30px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.1)'
            : '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          border: isPaper ? '1px solid #e2e8f0' : '1px solid var(--border-ghost)',
          padding: '44px 48px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          lineHeight: '1.6',
          boxSizing: 'border-box',
          overflowX: 'auto',
          maxHeight: '680px',
          overflowY: 'auto',
          transition: 'background-color 200ms ease, color 200ms ease',
        }}
      >
        <div className="resume-sheet-content">
          <Markdown
            components={{
              // H1: Candidate Name
              h1: ({ children }) => (
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <h1
                    style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: isPaper ? '#0f172a' : 'var(--color-on-surface)',
                      margin: 0,
                      lineHeight: '1.2',
                    }}
                  >
                    {children}
                  </h1>
                </div>
              ),

              // H2: Section Titles (PROFESSIONAL SUMMARY, TECHNICAL SKILLS, etc.)
              h2: ({ children }) => {
                const title = String(children);
                return (
                  <div style={{ marginTop: '22px', marginBottom: '10px' }}>
                    <h2
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: isPaper ? '#1e3a8a' : 'var(--color-tertiary)',
                        margin: 0,
                        paddingBottom: '4px',
                        borderBottom: isPaper ? '2px solid #2563eb' : '2px solid var(--color-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{title}</span>
                    </h2>
                  </div>
                );
              },

              // H3: Job Title / Project / Institution
              h3: ({ children }) => (
                <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                  <h3
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: isPaper ? '#0f172a' : 'var(--color-on-surface)',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '4px',
                    }}
                  >
                    {children}
                  </h3>
                </div>
              ),

              // Paragraphs
              p: ({ children }) => (
                <p
                  style={{
                    fontSize: '12.5px',
                    color: isPaper ? '#334155' : 'var(--color-on-surface-variant)',
                    marginTop: '4px',
                    marginBottom: '8px',
                    lineHeight: '1.6',
                  }}
                >
                  {children}
                </p>
              ),

              // Lists & Bullets
              ul: ({ children }) => (
                <ul
                  style={{
                    margin: '6px 0 10px 0',
                    paddingLeft: '20px',
                    listStyleType: 'disc',
                  }}
                >
                  {children}
                </ul>
              ),

              li: ({ children }) => (
                <li
                  style={{
                    fontSize: '12px',
                    color: isPaper ? '#1e293b' : 'var(--color-on-surface-variant)',
                    marginBottom: '4px',
                    lineHeight: '1.55',
                  }}
                >
                  {children}
                </li>
              ),

              // Strong / Bold
              strong: ({ children }) => (
                <strong
                  style={{
                    fontWeight: 700,
                    color: isPaper ? '#0f172a' : 'var(--color-on-surface)',
                  }}
                >
                  {children}
                </strong>
              ),

              // Italics / Subtitles
              em: ({ children }) => (
                <em
                  style={{
                    fontStyle: 'italic',
                    fontSize: '12px',
                    color: isPaper ? '#64748b' : 'var(--color-text-subtle)',
                  }}
                >
                  {children}
                </em>
              ),

              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: isPaper ? '#2563eb' : 'var(--color-secondary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  {children}
                </a>
              ),

              // Horizontal Rule
              hr: () => (
                <hr
                  style={{
                    border: 'none',
                    borderTop: isPaper ? '1px solid #cbd5e1' : '1px solid var(--border-ghost)',
                    margin: '14px 0',
                  }}
                />
              ),
            }}
          >
            {cleanMarkdown}
          </Markdown>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-document-sheet, #resume-document-sheet * {
            visibility: visible;
          }
          #resume-document-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
};
