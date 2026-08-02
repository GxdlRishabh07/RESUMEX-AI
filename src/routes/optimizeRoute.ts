/**
 * API Routes for Resume Optimization & Health Verification
 */

import { Router, Request, Response } from 'express';
import { optimizeResumeWithGemini, analyzeAtsScoreWithGemini, testGeminiConnection } from '../services/geminiService.js';
import { OptimizeResumeRequest, ApiErrorResponse } from '../types.js';

export const apiRouter = Router();

/**
 * GET /api/health
 * Verifies server operational status and tests Gemini API connection
 */
apiRouter.get('/health', async (req: Request, res: Response) => {
  try {
    const geminiTest = await testGeminiConnection();
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      gemini: geminiTest,
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err?.message || 'Server health check failed',
      gemini: { ok: false, message: 'Unreachable' },
    });
  }
});

/**
 * POST /api/analyze-score
 * Generates initial ATS score & detailed audit before optimization
 */
apiRouter.post('/analyze-score', async (req: Request, res: Response) => {
  try {
    const { resume, jobDescription, experienceLevel } = req.body as OptimizeResumeRequest;

    if (!resume || !resume.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: 'The candidate resume text is required.',
        code: 'MISSING_RESUME',
      });
    }

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: 'The target job description text is required.',
        code: 'MISSING_JOB_DESCRIPTION',
      });
    }

    if (resume.trim().length < 30 || jobDescription.trim().length < 30) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Input Length',
        details: 'Minimum 30 characters required for both resume and job description.',
        code: 'INPUT_TOO_SHORT',
      });
    }

    console.log(`[API] Processing ATS pre-optimization audit...`);

    const result = await analyzeAtsScoreWithGemini({
      resume: resume.trim(),
      jobDescription: jobDescription.trim(),
      experienceLevel,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[API Error] ATS Score analysis failed:', error);
    return res.status(500).json({
      success: false,
      error: 'ATS Analysis Error',
      details: error?.message || 'Failed to calculate initial ATS score.',
      code: 'ANALYSIS_ERROR',
    });
  }
});

/**
 * POST /api/optimize-resume
 * Receives candidate resume + job description, validates inputs, calls Gemini
 */
apiRouter.post('/optimize-resume', async (req: Request, res: Response) => {
  try {
    const { resume, jobDescription, targetRole, experienceLevel } = req.body as OptimizeResumeRequest;

    // 1. Validation: Check missing fields
    if (!resume || typeof resume !== 'string' || !resume.trim()) {
      const errRes: ApiErrorResponse = {
        success: false,
        error: 'Validation Error',
        details: 'The candidate resume text is required. Please paste your resume.',
        code: 'MISSING_RESUME',
      };
      return res.status(400).json(errRes);
    }

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      const errRes: ApiErrorResponse = {
        success: false,
        error: 'Validation Error',
        details: 'The target job description text is required. Please paste the job description.',
        code: 'MISSING_JOB_DESCRIPTION',
      };
      return res.status(400).json(errRes);
    }

    // 2. Validation: Minimum length
    if (resume.trim().length < 30) {
      const errRes: ApiErrorResponse = {
        success: false,
        error: 'Invalid Input Length',
        details: 'The resume text is too short. Please provide a complete resume (minimum 30 characters).',
        code: 'RESUME_TOO_SHORT',
      };
      return res.status(400).json(errRes);
    }

    if (jobDescription.trim().length < 30) {
      const errRes: ApiErrorResponse = {
        success: false,
        error: 'Invalid Input Length',
        details: 'The job description text is too short. Please provide a complete job description (minimum 30 characters).',
        code: 'JD_TOO_SHORT',
      };
      return res.status(400).json(errRes);
    }

    // 3. Validation: Maximum length protection
    if (resume.length > 50000 || jobDescription.length > 50000) {
      const errRes: ApiErrorResponse = {
        success: false,
        error: 'Payload Too Large',
        details: 'Inputs exceed the maximum allowed length of 50,000 characters.',
        code: 'INPUT_TOO_LARGE',
      };
      return res.status(400).json(errRes);
    }

    console.log(`[API] Processing resume optimization request. Resume length: ${resume.length}, JD length: ${jobDescription.length}`);

    // 4. Call Gemini Service
    const result = await optimizeResumeWithGemini({
      resume: resume.trim(),
      jobDescription: jobDescription.trim(),
      experienceLevel,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[API Error] Optimization failed:', error);

    const errorMessage = error?.message || 'An unexpected error occurred during AI processing.';
    
    // Distinguish API Key errors or rate limits
    if (errorMessage.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'Configuration Error',
        details: 'Gemini API key is not configured on the server. Please check environment variables.',
        code: 'API_KEY_MISSING',
      });
    }

    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        success: false,
        error: 'Rate Limit Exceeded',
        details: 'The AI service is experiencing high traffic. Please wait a few seconds and try again.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'AI Optimization Error',
      details: errorMessage,
      code: 'GEMINI_SERVICE_ERROR',
    });
  }
});
