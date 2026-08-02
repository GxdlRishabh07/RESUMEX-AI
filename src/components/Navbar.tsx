import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, FileCheck } from 'lucide-react';

interface NavbarProps {
  onLoadSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoadSample }) => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'error'>('checking');

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.status === 'online' && data.gemini?.ok) {
        setHealthStatus('online');
      } else {
        setHealthStatus('error');
      }
    } catch {
      setHealthStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <header id="navbar-header" className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div id="brand-icon-box" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ResumAI
              </span>
              <span id="version-badge" className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                ATS Optimizer
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Engineered with Gemini 3.6 Flash
            </p>
          </div>
        </div>

        {/* Status Indicator & Quick Load */}
        <div className="flex items-center space-x-3">
          {/* System API Health Pill */}
          <div 
            id="system-status-indicator"
            onClick={checkHealth}
            title="Click to re-check Gemini API connection status"
            className="cursor-pointer hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 hover:border-slate-600 transition-colors"
          >
            {healthStatus === 'checking' && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Checking API...</span>
              </>
            )}
            {healthStatus === 'online' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">Gemini Ready</span>
              </>
            )}
            {healthStatus === 'error' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-medium">API Offline</span>
              </>
            )}
          </div>

          {/* Quick Demo Button */}
          <button
            id="btn-load-sample-header"
            onClick={onLoadSample}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-600 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo Sample</span>
          </button>
        </div>
      </div>
    </header>
  );
};
