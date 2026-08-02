/**
 * Shared Type Definitions for AI Resume Optimizer
 */

export interface OptimizeResumeRequest {
  resume: string;
  jobDescription: string;
  targetRole?: string;
  experienceLevel?: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Executive';
}

export interface AtsAnalysisResponse {
  success: boolean;
  initialScore: number; // 0-100 initial ATS score before optimization
  matchedKeywords: string[];
  missingKeywords: string[];
  criticalGaps: string[];
  formattingIssues: string[];
  recommendations: string[];
  summary: string;
}

export interface OptimizeResumeResponse {
  success: boolean;
  initialScore: number; // 0-100 ATS score before optimization
  optimizedScore: number; // 0-100 ATS score after optimization
  scoreBoost: number; // Difference (+ percentage increase)
  matchScore: number; // Kept for compatibility (= optimizedScore)
  keyKeywordsMatched: string[];
  missingKeywordsAdded: string[];
  improvementsSummary: string[];
  optimizedResume: string; // Clean Markdown formatted resume
  atsFormattingTips: string[];
  rawAnalysis?: {
    strengths: string[];
    gapsIdentified: string[];
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
  code?: string;
}

export interface SampleData {
  title: string;
  role: string;
  resume: string;
  jobDescription: string;
}
