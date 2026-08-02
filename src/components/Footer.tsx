import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="footer-main" className="mt-16 border-t border-slate-800 py-8 text-center text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>ResumAI • Powered by Google Gemini 3.6 Flash</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server-side API Key Privacy</span>
          </span>
          <span>•</span>
          <span>Zero Client Key Exposure</span>
        </div>
      </div>
    </footer>
  );
};
