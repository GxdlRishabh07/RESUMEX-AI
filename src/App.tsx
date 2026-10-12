import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
import { supabase, ResumeAnalysis } from './lib/supabase.js';
import { useAuth } from './context/AuthContext.js';
import { saveAnalysis } from './services/historyService.js';
import { updateRateLimitFromHeaders } from './services/rateLimitService.js';

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
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

  // Load analysis from navigation state if coming from Dashboard
  useEffect(() => {
    const analysis = (location.state as any)?.analysis as ResumeAnalysis | undefined;
    if (analysis) {
      if (analysis.resume_text) setResumeText(analysis.resume_text);
      if (analysis.job_description) setJdText(analysis.job_description);
      if (analysis.experience_level) {
        setExperienceLevel(analysis.experience_level as any);
      }
      if (analysis.initial_score !== null) {
        setInitialScoreData({
          success: true,
          initialScore: analysis.initial_score,
          matchedKeywords: analysis.matched_keywords || [],
          missingKeywords: analysis.missing_keywords || [],
          criticalGaps: analysis.critical_gaps || [],
          formattingIssues: analysis.formatting_issues || [],
          recommendations: analysis.recommendations || [],
          summary: analysis.summary || '',
        });
      }
      if (analysis.optimized_resume) {
        setResult({
          success: true,
          initialScore: analysis.initial_score || 0,
          optimizedScore: analysis.optimized_score || 0,
          matchScore: analysis.optimized_score || 0,
          scoreBoost: analysis.score_boost || 0,
          keyKeywordsMatched: analysis.matched_keywords || [],
          missingKeywordsAdded: analysis.missing_keywords || [],
          improvementsSummary: analysis.improvements_summary || [],
          atsFormattingTips: analysis.ats_formatting_tips || [],
          optimizedResume: analysis.optimized_resume,
          rawAnalysis: analysis.raw_analysis || undefined,
        });
      }
    }
  }, [location.state]);

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

      updateRateLimitFromHeaders(response.headers);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to calculate initial ATS score');
      }

      setInitialScoreData(data as AtsAnalysisResponse);

      // Save to hybrid history (localStorage + Supabase)
      saveAnalysis({
        type: 'score_only',
        resumeText,
        jobDescription: jdText,
        experienceLevel,
        scoreData: data as AtsAnalysisResponse,
      }, user);

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

      updateRateLimitFromHeaders(response.headers);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to optimize resume');
      }

      setResult(data as OptimizeResumeResponse);

      // Save to hybrid history (localStorage + Supabase)
      saveAnalysis({
        type: 'full',
        resumeText,
        jobDescription: jdText,
        experienceLevel,
        scoreData: initialScoreData,
        optimizeData: data as OptimizeResumeResponse,
      }, user);

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
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Top Navbar (fixed) */}
      <Navbar onLoadSample={() => handleLoadSample(0)} />

      {/* Main Container — pt-16 to clear fixed navbar */}
      <main
        className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          maxWidth: '1400px',
          paddingTop: '64px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Hero Banner */}
        <HeroSection />

        {/* Dismissible Error Alert */}
        <ErrorAlert
          error={error}
          onDismiss={() => setError(null)}
          onRetry={handleOptimize}
        />

        {/* Input Workstation Section */}
        <div
          id="workstation-grid"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
          style={{ marginTop: '8px' }}
        >
          {/* Resume Input Panel */}
          <ResumeInput
            value={resumeText}
            onChange={setResumeText}
            disabled={isLoading}
            onLoadSample={() => handleLoadSample(0)}
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

        {/* Primary Action Buttons */}
        <OptimizeButton
          onAnalyzeScore={handleAnalyzeScore}
          onOptimize={handleOptimize}
          isAnalyzing={isAnalyzing}
          isOptimizing={isOptimizing}
          disabled={!resumeText.trim() || !jdText.trim()}
        />

        {/* Guest Mode History Notice */}
        {!user && (initialScoreData || result) && (
          <div
            id="guest-mode-save-prompt"
            style={{
              marginTop: '16px',
              padding: '12px 18px',
              borderRadius: '10px',
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ color: '#eab308', fontSize: '20px' }}>info</span>
              <span style={{ fontSize: '13px', color: 'var(--color-on-surface)' }}>
                <strong>Guest Mode:</strong> Past analyses are not stored in guest mode. <strong>Login to see your analysis history</strong> and save your optimizations.
              </span>
            </div>
            <Link
              to="/login"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none', whiteSpace: 'nowrap', fontSize: '12px', padding: '5px 12px' }}
            >
              Sign In to Save
            </Link>
          </div>
        )}

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
