import React from 'react';
import { Briefcase, Trash2, Layers } from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/samples.js';

interface JobDescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  experienceLevel: string;
  onExperienceLevelChange: (level: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Executive') => void;
  onSelectSample: (index: number) => void;
  disabled?: boolean;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  experienceLevel,
  onExperienceLevelChange,
  onSelectSample,
  disabled,
}) => {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div id="card-jd-input" className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Target Job Description</h3>
            <p className="text-[11px] text-slate-400">Paste the job posting you want to apply for</p>
          </div>
        </div>

        {/* Preset Samples Selector */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              id="select-sample-dataset"
              onChange={(e) => {
                const idx = parseInt(e.target.value, 10);
                if (!isNaN(idx)) onSelectSample(idx);
              }}
              defaultValue=""
              disabled={disabled}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="" disabled>
                ✨ Load Preset Samples...
              </option>
              {SAMPLE_DATASETS.map((sample, i) => (
                <option key={i} value={i}>
                  {sample.title}
                </option>
              ))}
            </select>
          </div>

          {value && (
            <button
              type="button"
              id="btn-clear-jd"
              onClick={() => onChange('')}
              disabled={disabled}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs flex items-center space-x-1 border border-slate-800 transition-colors"
              title="Clear job description"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Experience Level Bar */}
      <div className="flex items-center space-x-2 mb-3 bg-slate-950/40 p-2 rounded-xl border border-slate-800/80 text-xs text-slate-400">
        <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="font-medium text-slate-300 shrink-0">Target Level:</span>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {(['Entry-Level', 'Mid-Level', 'Senior', 'Executive'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onExperienceLevelChange(lvl)}
              disabled={disabled}
              className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
                experienceLevel === lvl
                  ? 'bg-indigo-600 text-white shadow border border-indigo-400'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative flex-1 min-h-[220px]">
        <textarea
          id="textarea-jd-content"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Paste target job description here...\n\nExample:\nWe are seeking a Senior Full Stack Engineer proficient in React, TypeScript, Node.js, Express, REST APIs, Microservices, and CI/CD pipelines...`}
          className="w-full h-full p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none font-sans leading-relaxed"
        />
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
        {charCount > 0 && charCount < 30 && (
          <span className="text-amber-400">Min 30 characters recommended</span>
        )}
      </div>
    </div>
  );
};
