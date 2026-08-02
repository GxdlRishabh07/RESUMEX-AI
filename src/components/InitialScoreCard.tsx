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

  const getScoreBadge = (score: number) => {
    if (score >= 75) return { color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', label: 'Good Initial Match' };
    if (score >= 50) return { color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', label: 'Moderate Match (Gaps Found)' };
    return { color: 'text-rose-400 border-rose-500/30 bg-rose-500/10', label: 'Low ATS Match (Requires Optimization)' };
  };

  const badge = getScoreBadge(initialScore);

  return (
    <div id="card-initial-score-container" className="bg-slate-900/95 rounded-3xl border border-indigo-500/30 p-6 shadow-2xl mt-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-5 w-full md:w-auto">
          {/* Initial Score Circular Gauge */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="transition-all duration-1000 ease-out text-amber-400"
                strokeDasharray={`${initialScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{initialScore}%</span>
              <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">Current ATS</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                {badge.label}
              </span>
              <span className="text-xs text-slate-400">Pre-Optimization Baseline</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Initial ATS Match Score</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">{summary}</p>
          </div>
        </div>

        {/* CTA to Full Optimization */}
        <div className="w-full md:w-auto shrink-0 flex justify-end">
          <button
            type="button"
            id="btn-proceed-optimize-from-score"
            onClick={onProceedToOptimize}
            disabled={isOptimizing}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 hover:shadow-lg hover:shadow-indigo-500/25 text-white transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 border border-indigo-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Apply AI Optimization Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Keywords Analysis */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <ListFilter className="w-4 h-4 text-indigo-400" />
            <span>Keyword Coverage Audit</span>
          </h4>

          {/* Missing Keywords */}
          <div>
            <span className="text-xs font-semibold text-rose-400 flex items-center space-x-1.5 mb-2">
              <XCircle className="w-3.5 h-3.5" />
              <span>Missing High-Priority Keywords ({missingKeywords.length})</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Matched Keywords */}
          <div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Currently Matched Keywords ({matchedKeywords.length})</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {matchedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{kw}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Gaps & Bullet Weaknesses */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <FileSearch className="w-4 h-4 text-amber-400" />
            <span>Critical Gaps & Formatting Weaknesses</span>
          </h4>

          {criticalGaps.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Identified Qualifications Gaps</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                {criticalGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {formattingIssues.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>Formatting & Structure Issues</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                {formattingIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
