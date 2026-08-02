import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, ArrowRight, Gauge } from 'lucide-react';

interface OptimizeButtonProps {
  onAnalyzeScore: () => void;
  onOptimize: () => void;
  isAnalyzing: boolean;
  isOptimizing: boolean;
  disabled: boolean;
}

const LOADING_MESSAGES = [
  'Extracting core ATS keywords from Job Description...',
  'Analyzing resume experience gaps & strengths...',
  'Rewriting bullet points with STAR action metrics...',
  'Injecting high-impact domain competencies...',
  'Formatting clean markdown & scoring ATS match...',
];

export const OptimizeButton: React.FC<OptimizeButtonProps> = ({
  onAnalyzeScore,
  onOptimize,
  isAnalyzing,
  isOptimizing,
  disabled,
}) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!isOptimizing) {
      setMsgIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [isOptimizing]);

  const isLoading = isAnalyzing || isOptimizing;

  return (
    <div id="container-optimize-btn" className="flex flex-col items-center justify-center my-8 space-y-3">
      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl">
        {/* Button 1: Check ATS Score First */}
        <button
          id="btn-analyze-score-main"
          type="button"
          onClick={onAnalyzeScore}
          disabled={disabled || isLoading}
          className={`flex-1 w-full px-6 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 flex items-center justify-center space-x-2.5 border ${
            isAnalyzing
              ? 'bg-slate-800 text-slate-300 border-slate-700 cursor-wait'
              : disabled
              ? 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-not-allowed shadow-none'
              : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-indigo-500/30 hover:border-indigo-400 hover:text-white active:scale-98'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Calculating Baseline ATS Score...</span>
            </>
          ) : (
            <>
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Check ATS Score First</span>
            </>
          )}
        </button>

        {/* Button 2: Full AI Optimization */}
        <button
          id="btn-optimize-main"
          type="button"
          onClick={onOptimize}
          disabled={disabled || isLoading}
          className={`relative group overflow-hidden flex-1 w-full px-6 py-4 rounded-2xl font-bold text-sm shadow-2xl transition-all duration-300 transform active:scale-98 ${
            isOptimizing
              ? 'bg-slate-800 text-slate-300 border border-slate-700 cursor-wait'
              : disabled
              ? 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 text-white hover:shadow-indigo-500/25 hover:scale-[1.02] border border-indigo-400/30'
          }`}
        >
          {/* Glow effect on hover */}
          {!disabled && !isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />
          )}

          <div className="relative flex items-center justify-center space-x-2.5">
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
                <div className="text-left">
                  <span className="block font-semibold text-xs text-slate-100">Optimizing Resume...</span>
                  <span className="block text-[10px] text-slate-400 animate-pulse">{LOADING_MESSAGES[msgIdx]}</span>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Optimize Resume for ATS</span>
                <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>
      </div>

      {/* Keyboard Shortcut Hint */}
      {!isLoading && !disabled && (
        <p className="text-[11px] text-slate-500 flex items-center space-x-1">
          <span>Tip: Press</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
            Enter
          </kbd>
          <span>to optimize</span>
        </p>
      )}
    </div>
  );
};
