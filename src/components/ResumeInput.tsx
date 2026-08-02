import React, { useRef } from 'react';
import { FileText, Trash2, Upload, FileCode } from 'lucide-react';

interface ResumeInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({ value, onChange, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onChange(text);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a plain text (.txt) or Markdown (.md) file, or paste your text directly.');
    }
  };

  return (
    <div id="card-resume-input" className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Your Current Resume</h3>
            <p className="text-[11px] text-slate-400">Paste your existing resume text below</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,text/plain"
            className="hidden"
          />
          <button
            type="button"
            id="btn-upload-resume-file"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs flex items-center space-x-1 border border-slate-800 transition-colors"
            title="Import from text/markdown file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload File</span>
          </button>

          {value && (
            <button
              type="button"
              id="btn-clear-resume"
              onClick={() => onChange('')}
              disabled={disabled}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs flex items-center space-x-1 border border-slate-800 transition-colors"
              title="Clear resume text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative flex-1 min-h-[260px]">
        <textarea
          id="textarea-resume-content"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Paste your complete resume here...\n\nExample:\nJohn Doe\nSoftware Developer\n\nExperience:\n- Built web applications using React and Node.js...\n- Managed database queries and REST APIs...`}
          className="w-full h-full p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none font-sans leading-relaxed"
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
