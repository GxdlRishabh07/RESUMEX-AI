// Polyfill Promise.withResolvers for browsers that may not have it yet
if (typeof Promise !== 'undefined' && typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export interface ParseResult {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'unknown';
  pageCount?: number;
  wordCount: number;
}

/**
 * Lazy loads and configures PDF.js
 */
async function getPdfJs() {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }
  }
  return pdfjsLib;
}

/**
 * Extracts plain text from a PDF ArrayBuffer page-by-page, preserving line layout
 */
async function parsePdfArrayBuffer(arrayBuffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  const pdfjsLib = await getPdfJs();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Sort and group text items to maintain readable line layout
    let lastY: number | null = null;
    let pageLines: string[] = [];
    let currentLine = '';

    for (const item of textContent.items) {
      if ('str' in item) {
        const textStr = item.str;
        // item.transform: [scaleX, skewY, skewX, scaleY, transformX, transformY]
        const currentY = item.transform ? Math.round(item.transform[5]) : null;

        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 4) {
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }
          currentLine = textStr;
        } else {
          if (currentLine.length > 0 && !currentLine.endsWith(' ') && textStr.length > 0 && !textStr.startsWith(' ')) {
            currentLine += ' ';
          }
          currentLine += textStr;
        }

        if (currentY !== null) {
          lastY = currentY;
        }
      }
    }

    if (currentLine.trim()) {
      pageLines.push(currentLine.trim());
    }

    const pageFullText = pageLines.join('\n');
    if (pageFullText.trim()) {
      pageTexts.push(pageFullText.trim());
    }
  }

  const combinedText = pageTexts.join('\n\n');
  return {
    text: combinedText,
    pageCount: numPages,
  };
}

/**
 * Extracts text from DOCX using Mammoth (lazy-loaded)
 */
async function parseDocxArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammothModule = await import('mammoth');
  const mammoth = (mammothModule as any).default || mammothModule;
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

/**
 * Server-side fallback parser for .doc, scanned, or complex documents
 */
async function parseViaServer(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Convert arrayBuffer to base64
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const response = await fetch('/api/parse-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileBase64: base64,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.details || data.error || 'Server failed to extract text from document');
  }

  return data.text || '';
}

/**
 * Basic binary text extractor for legacy .doc (CFB/OLE) fallback
 */
function extractAsciiAndUnicodeStrings(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  let currentAscii = '';

  // Scan for printable ASCII sequences (>= 4 chars)
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
      currentAscii += String.fromCharCode(b);
    } else {
      if (currentAscii.trim().length >= 4) {
        chunks.push(currentAscii.trim());
      }
      currentAscii = '';
    }
  }
  if (currentAscii.trim().length >= 4) {
    chunks.push(currentAscii.trim());
  }

  // Filter out typical Word internal metadata identifiers
  const cleanChunks = chunks.filter((chunk) => {
    if (chunk.length < 3) return false;
    if (/^(Microsoft|CompObj|WordDocument|SummaryInformation|DocumentSummaryInformation|Table|Data)$/i.test(chunk)) {
      return false;
    }
    const letterCount = (chunk.match(/[a-zA-Z0-9]/g) || []).length;
    return letterCount / chunk.length > 0.4;
  });

  return cleanChunks.join('\n');
}

/**
 * Primary document parser function:
 * Accepts a File object (.pdf, .docx, .doc, .txt, .md) and returns extracted plain text
 */
export async function parseResumeFile(file: File): Promise<ParseResult> {
  const fileName = file.name;
  const extension = fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  const fileSize = file.size;

  if (fileSize > 20 * 1024 * 1024) {
    throw new Error('File size exceeds 20MB limit. Please upload a smaller file.');
  }

  let extractedText = '';
  let pageCount: number | undefined;
  let detectedType: ParseResult['fileType'] = 'unknown';

  // 1. Plain Text / Markdown
  if (extension === 'txt' || extension === 'md' || file.type.startsWith('text/')) {
    detectedType = extension === 'md' ? 'md' : 'txt';
    extractedText = await file.text();
  }
  // 2. PDF Document
  else if (extension === 'pdf' || file.type === 'application/pdf') {
    detectedType = 'pdf';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfResult = await parsePdfArrayBuffer(arrayBuffer);
      extractedText = pdfResult.text;
      pageCount = pdfResult.pageCount;
    } catch (clientErr: any) {
      console.warn('Client-side PDF parse failed, attempting server fallback...', clientErr);
      try {
        extractedText = await parseViaServer(file);
      } catch {
        throw new Error(
          clientErr?.message?.includes('Password')
            ? 'This PDF is password protected. Please remove the password and try again.'
            : 'Could not extract text from this PDF. It may be an image-only scan or corrupted. Please copy and paste the text directly.'
        );
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(
        'No readable text could be found in this PDF. If this is a scanned image, please copy and paste the text or convert it with OCR.'
      );
    }
  }
  // 3. Modern DOCX Document
  else if (
    extension === 'docx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    detectedType = 'docx';
    try {
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await parseDocxArrayBuffer(arrayBuffer);
    } catch (docxErr: any) {
      console.warn('Client DOCX parse failed, trying server fallback...', docxErr);
      try {
        extractedText = await parseViaServer(file);
      } catch {
        throw new Error('Failed to parse Word document (.docx). Please check if the file is corrupted.');
      }
    }
  }
  // 4. Legacy DOC Document (Word 97-2003)
  else if (extension === 'doc' || file.type === 'application/msword') {
    detectedType = 'doc';
    // Try mammoth first in case it is a renamed .docx
    try {
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await parseDocxArrayBuffer(arrayBuffer);
    } catch {
      // It's a genuine binary .doc
      try {
        extractedText = await parseViaServer(file);
      } catch (serverErr) {
        console.warn('Server .doc parse failed, attempting binary text stream extraction...', serverErr);
        const arrayBuffer = await file.arrayBuffer();
        extractedText = extractAsciiAndUnicodeStrings(arrayBuffer);
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Unable to extract text from this legacy .doc file. Please save it as .docx or .pdf and re-upload.');
    }
  } else {
    // Unknown format — attempt plain text or server
    try {
      extractedText = await file.text();
      detectedType = 'txt';
    } catch {
      extractedText = await parseViaServer(file);
    }
  }

  // Clean up extracted text: normalize excessive whitespace/newlines
  const normalizedText = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const words = normalizedText ? normalizedText.split(/\s+/).length : 0;

  return {
    text: normalizedText,
    fileName,
    fileSize,
    fileType: detectedType,
    pageCount,
    wordCount: words,
  };
}
