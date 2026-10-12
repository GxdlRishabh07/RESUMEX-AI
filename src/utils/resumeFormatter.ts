/**
 * Resume Markdown Normalizer & Formatter — RESUMEX // AI
 * Sanitizes raw AI outputs, fixes escaped newlines, cleans up collapsed headers,
 * and ensures standard ATS-compliant Markdown structure.
 */

export function normalizeResumeMarkdown(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Convert literal escaped backslash-n (\n, \\n, \r\n) into true newlines
  text = text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, '  ');

  // Also catch multi-escaped cases
  text = text.replace(/\\\\n/g, '\n');

  // 2. Unescape common HTML/JSON entities
  text = text
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/&amp;/g, '&');

  // 3. Fix collapsed section headers where AI didn't put a newline before ##
  // E.g. "...data extraction.\n## TECHNICAL SKILLS" or "...GxdlRishabh07## PROFESSIONAL SUMMARY"
  text = text.replace(/([^\n])\s*(#{1,4}\s+)/g, '$1\n\n$2');

  // 4. Standardize common section headers if they're missing markdown symbols
  const sectionKeywords = [
    'PROFESSIONAL SUMMARY',
    'EXECUTIVE SUMMARY',
    'SUMMARY',
    'TECHNICAL SKILLS',
    'SKILLS & COMPETENCIES',
    'CORE COMPETENCIES',
    'SKILLS',
    'PROFESSIONAL EXPERIENCE',
    'WORK EXPERIENCE',
    'EXPERIENCE',
    'PROJECTS',
    'KEY PROJECTS',
    'EDUCATION',
    'EDUCATION & CERTIFICATIONS',
    'CERTIFICATIONS',
    'AWARDS & ACHIEVEMENTS',
    'AWARDS',
  ];

  sectionKeywords.forEach((section) => {
    // Match line that is just the section title, make sure it has ##
    const regex = new RegExp(`(^|\\n)\\s*(?:#{1,3}\\s*)?(${section})\\s*($|\\n)`, 'gi');
    text = text.replace(regex, (_match, before, title) => {
      return `${before}\n## ${title.toUpperCase()}\n`;
    });
  });

  // 5. Ensure bullet points (- , * , • ) start on their own lines (without breaking hyphens in date ranges)
  text = text.replace(/([.:;!]\s*)([•\-\*]\s+)/g, '$1\n$2');
  text = text.replace(/([a-zA-Z0-9])\s+(•\s+)/g, '$1\n$2');

  // 6. Ensure candidate name (first line if not a header) is promoted to H1
  const lines = text.split('\n');
  const firstNonEmptyIndex = lines.findIndex((l) => l.trim().length > 0);

  if (firstNonEmptyIndex !== -1) {
    const firstLine = lines[firstNonEmptyIndex].trim();
    // If first line doesn't start with '#' and is short (< 60 chars) without colons, treat as Name (H1)
    if (
      !firstLine.startsWith('#') &&
      firstLine.length < 60 &&
      !firstLine.includes(':') &&
      !firstLine.includes('|')
    ) {
      lines[firstNonEmptyIndex] = `# ${firstLine.toUpperCase()}`;
      text = lines.join('\n');
    }
  }

  // 7. Clean up excessive consecutive blank lines (limit to max 2)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
