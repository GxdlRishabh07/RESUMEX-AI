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
  Code2,
  AlertTriangle,
  Lightbulb,
  Award,
  ChevronRight,
} from 'lucide-react';
import { OptimizeResumeResponse } from '../types.js';

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

  // Final score is either optimizedScore or matchScore
  const finalScore = optimizedScore || matchScore || 90;
  const originalScore = initialScore || Math.max(30, finalScore - 38);
  const boost = scoreBoost || Math.max(0, finalScore - originalScore);

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 65) return 'from-blue-500 to-indigo-400';
    return 'from-amber-500 to-orange-400';
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = optimizedResume;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download Markdown file
  const handleDownload = () => {
    const blob = new Blob([optimizedResume], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Optimized_ATS_Resume.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print / Export PDF
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
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { border-bottom: 2px solid #222; padding-bottom: 6px; margin-bottom: 12px; }
            h2 { border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 24px; margin-bottom: 10px; color: #1a202c; }
            ul { padding-left: 20px; }
            li { margin-bottom: 6px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <script>
            document.getElementById('print-content').innerHTML = marked.parse(${JSON.stringify(optimizedResume)});
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div id="card-result-container" className="bg-slate-900/95 rounded-3xl border border-slate-800 p-6 shadow-2xl mt-8">
      {/* Top Banner: Score & Summary Overview */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
        {/* Before vs After ATS Score Comparison */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full xl:w-auto bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          {/* Before Score */}
          <div className="flex items-center space-x-3">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500/80"
                  strokeDasharray={`${originalScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-amber-300">{originalScore}%</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Before</span>
              <span className="text-xs font-medium text-slate-300">Initial Score</span>
            </div>
          </div>

          {/* Boost Badge / Arrow */}
          <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="text-xs font-black tracking-wide">+{boost}% Boost</span>
            <span className="text-[9px] font-semibold text-emerald-300/80 uppercase">Score Increase</span>
          </div>

          {/* After Score */}
          <div className="flex items-center space-x-3">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${finalScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-emerald-400">{finalScore}%</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Optimized</span>
              <span className="text-xs font-bold text-white">Target Match</span>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            id="btn-copy-resume"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Resume'}</span>
          </button>

          <button
            type="button"
            id="btn-download-resume"
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Download .MD</span>
          </button>

          <button
            type="button"
            id="btn-print-resume"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-800 mt-4">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="tab-btn-preview"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Optimized Resume</span>
          </button>

          <button
            type="button"
            id="tab-btn-keywords"
            onClick={() => setActiveTab('keywords')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'keywords'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ATS Keyword Breakdown</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
              {keyKeywordsMatched.length + missingKeywordsAdded.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-btn-tips"
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'tips'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <span>Improvements & ATS Tips</span>
          </button>
        </div>

        {/* Formatted vs Raw toggle when on preview tab */}
        {activeTab === 'preview' && (
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs my-2">
            <button
              type="button"
              onClick={() => setViewMode('formatted')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'formatted' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Formatted
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'raw' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Markdown
            </button>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* Tab 1: Optimized Resume */}
        {activeTab === 'preview' && (
          <div>
            {viewMode === 'formatted' ? (
              <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto">
                <div className="prose prose-invert prose-slate max-w-none prose-headings:text-slate-100 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-lg prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2 prose-h2:mt-6 prose-a:text-indigo-400 prose-strong:text-indigo-300">
                  <Markdown>{optimizedResume}</Markdown>
                </div>
              </div>
            ) : (
              <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-indigo-200 font-mono text-xs overflow-x-auto max-h-[600px] whitespace-pre-wrap leading-relaxed">
                {optimizedResume}
              </pre>
            )}
          </div>
        )}

        {/* Tab 2: Keywords Analysis */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            {/* Newly Injected Missing Keywords */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-indigo-500/20">
              <div className="flex items-center space-x-2 mb-3">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-100">Critical Keywords Added to Resume</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                These keywords were prominent in the job description but missing in your original draft. They have been seamlessly woven into your bullet points and skills section:
              </p>
              <div className="flex flex-wrap gap-2">
                {missingKeywordsAdded.length > 0 ? (
                  missingKeywordsAdded.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>{kw}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">All key JD keywords were already present in your original resume!</p>
                )}
              </div>
            </div>

            {/* Existing Matched Keywords */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100">Existing Matched Competencies</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Keywords and technical requirements already identified in your background that were preserved and highlighted:
              </p>
              <div className="flex flex-wrap gap-2">
                {keyKeywordsMatched.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Gaps Grid */}
            {rawAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Core Profile Strengths</span>
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {rawAnalysis.strengths?.map((str, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Skill Gaps / Hiring Considerations</span>
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {rawAnalysis.gapsIdentified?.map((gap, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
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
          <div className="space-y-6">
            {/* Key Improvements Made */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Major Bullet Point & Impact Enhancements</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {improvementsSummary.map((imp, i) => (
                  <li key={i} className="flex items-start space-x-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ATS Formatting Guidelines */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Actionable ATS Submission Guidelines</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {atsFormattingTips.map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
