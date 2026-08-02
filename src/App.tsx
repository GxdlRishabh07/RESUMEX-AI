import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { ResumeInput } from './components/ResumeInput.js';
import { JobDescriptionInput } from './components/JobDescriptionInput.js';
import { OptimizeButton } from './components/OptimizeButton.js';
import { InitialScoreCard } from './components/InitialScoreCard.js';
import { ResultCard } from './components/ResultCard.js';
import { ErrorAlert } from './components/ErrorAlert.js';
import { Footer } from './components/Footer.js';
import { SAMPLE_DATASETS } from './data/samples.js';
import { OptimizeResumeResponse, AtsAnalysisResponse, ApiErrorResponse } from './types.js';

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Entry-Level' | 'Mid-Level' | 'Senior' | 'Executive'>('Mid-Level');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [initialScoreData, setInitialScoreData] = useState<AtsAnalysisResponse | null>(null);
  const [result, setResult] = useState<OptimizeResumeResponse | null>(null);
  const [error, setError] = useState<ApiErrorResponse | null>(null);

  // Load a demo sample
  const handleLoadSample = (index: number = 0) => {
    const sample = SAMPLE_DATASETS[index] || SAMPLE_DATASETS[0];
    setResumeText(sample.resume);
    setJdText(sample.jobDescription);
    setError(null);
    setInitialScoreData(null);
    setResult(null);
  };

  // Handler: Calculate Initial ATS Score Audit
  const handleAnalyzeScore = async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      setError({
        success: false,
        error: 'Missing Required Fields',
        details: 'Please enter both your Resume and the target Job Description before analyzing your ATS score.',
        code: 'MISSING_INPUTS',
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jdText,
          experienceLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to calculate initial ATS score');
      }

      setInitialScoreData(data as AtsAnalysisResponse);

      // Smooth scroll to initial score card
      setTimeout(() => {
        const scoreElement = document.getElementById('card-initial-score-container');
        if (scoreElement) {
          scoreElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: any) {
      console.error('ATS score analysis error:', err);
      setError({
        success: false,
        error: 'ATS Analysis Failed',
        details: err?.message || 'Unable to connect to AI server. Please try again.',
        code: 'NETWORK_OR_SERVER_ERROR',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Main Optimize Handler
  const handleOptimize = async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      setError({
        success: false,
        error: 'Missing Required Fields',
        details: 'Please enter both your Resume and the target Job Description before optimizing.',
        code: 'MISSING_INPUTS',
      });
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jdText,
          experienceLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to optimize resume');
      }

      setResult(data as OptimizeResumeResponse);

      // Smooth scroll to result
      setTimeout(() => {
        const resultElement = document.getElementById('card-result-container');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    } catch (err: any) {
      console.error('Optimization error:', err);
      setError({
        success: false,
        error: 'Optimization Request Failed',
        details: err?.message || 'Unable to connect to AI server. Please try again.',
        code: 'NETWORK_OR_SERVER_ERROR',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const isLoading = isAnalyzing || isOptimizing;

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isLoading && resumeText.trim() && jdText.trim()) {
          e.preventDefault();
          handleOptimize();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resumeText, jdText, isLoading]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar onLoadSample={() => handleLoadSample(0)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Banner */}
        <HeroSection />

        {/* Dismissible Error Alert */}
        <ErrorAlert
          error={error}
          onDismiss={() => setError(null)}
          onRetry={handleOptimize}
        />

        {/* Input Workstation Section */}
        <div id="workstation-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 items-stretch">
          {/* Resume Input Panel */}
          <ResumeInput
            value={resumeText}
            onChange={setResumeText}
            disabled={isLoading}
          />

          {/* Job Description Input Panel */}
          <JobDescriptionInput
            value={jdText}
            onChange={setJdText}
            experienceLevel={experienceLevel}
            onExperienceLevelChange={setExperienceLevel}
            onSelectSample={handleLoadSample}
            disabled={isLoading}
          />
        </div>

        {/* Primary Action Buttons: Check ATS Score & Full Optimization */}
        <OptimizeButton
          onAnalyzeScore={handleAnalyzeScore}
          onOptimize={handleOptimize}
          isAnalyzing={isAnalyzing}
          isOptimizing={isOptimizing}
          disabled={!resumeText.trim() || !jdText.trim()}
        />

        {/* Pre-Optimization Initial ATS Score Card */}
        {initialScoreData && (
          <InitialScoreCard
            data={initialScoreData}
            onProceedToOptimize={handleOptimize}
            isOptimizing={isOptimizing}
          />
        )}

        {/* Results Output Section */}
        {result && <ResultCard data={result} />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
