import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { ApiErrorResponse } from '../types.js';

interface ErrorAlertProps {
  error: ApiErrorResponse | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  return (
    <div id="alert-error-container" className="my-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 shadow-xl flex items-start justify-between space-x-4 animate-shake">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-rose-100">{error.error || 'Optimization Error'}</h4>
          <p className="text-xs text-rose-300 mt-1 leading-relaxed">{error.details}</p>
          {error.code && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-900/60 border border-rose-700/50 text-rose-400">
              Code: {error.code}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-800 hover:bg-rose-700 text-rose-100 flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-100 hover:bg-rose-900/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
