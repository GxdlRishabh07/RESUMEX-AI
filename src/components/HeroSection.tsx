import React from 'react';
import { Target, Zap, ShieldCheck, Cpu } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section id="hero-section" className="relative pt-8 pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
      {/* Decorative Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Eyebrow */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        <span>Enterprise-Grade ATS Resume Optimization Engine</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
        Tailor Your Resume to Any Job Description in{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Seconds
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
        Pass automated ATS scanners like Workday, Greenhouse & Lever. Gemini 3.6 Flash analyzes missing key skills, rewrites bullet points into measurable STAR achievements, and dramatically boosts your match score.
      </p>

      {/* Value Proposition Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Factual Accuracy Guaranteed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Target className="w-4 h-4 text-blue-400" />
          <span>Keywords Extraction & Injection</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Instant ATS Score Benchmark</span>
        </div>
      </div>
    </section>
  );
};
