/**
 * History Service — RESUMEX // AI
 * Strict Multi-Tenant History Service with Per-User Isolation & Guest Mode Gating.
 *
 * Rules enforced:
 * 1. Guest Mode: Unauthenticated users have NO history displayed. fetchAllAnalyses(null) returns [].
 * 2. Strict User Isolation: User 1 ONLY sees User 1's records. User 2 ONLY sees User 2's records.
 *    - Cloud queries filter by user_id AND are enforced by Supabase Row-Level-Security (RLS).
 *    - Local storage cache is isolated per user: `resumex_history_${userId}`.
 * 3. Database Visibility: Saves `user_email` (e.g. Gmail) to Supabase so project owner can see
 *    all user histories alongside their email in the Supabase Table Editor.
 */

import { supabase, ResumeAnalysis } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { AtsAnalysisResponse, OptimizeResumeResponse } from '../types';

const MAX_LOCAL_ITEMS = 60;
const LEGACY_STORAGE_KEY = 'resumex_analysis_history';

// ─── Per-User Storage Helpers ────────────────────────────────────────────────

const getUserStorageKey = (userId: string): string => `resumex_history_${userId}`;

/**
 * Clean up legacy un-scoped storage key to prevent data bleeding between sessions
 */
const cleanupLegacyStorage = (): void => {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // Ignore storage access errors
  }
};

export const getLocalAnalysesForUser = (userId: string): ResumeAnalysis[] => {
  if (!userId) return [];
  cleanupLegacyStorage();
  try {
    const raw = localStorage.getItem(getUserStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure all returned items strictly belong to this user
    return parsed.filter(item => item && item.user_id === userId);
  } catch (err) {
    console.warn('[HistoryService] Failed to read user local storage:', err);
    return [];
  }
};

export const saveLocalAnalysisForUser = (userId: string, analysis: ResumeAnalysis): void => {
  if (!userId) return;
  cleanupLegacyStorage();
  try {
    const existing = getLocalAnalysesForUser(userId);
    const updated = [analysis, ...existing.filter(a => a.id !== analysis.id)].slice(0, MAX_LOCAL_ITEMS);
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('resumex:history_changed', { detail: { action: 'save', item: analysis, userId } }));
  } catch (err) {
    console.warn('[HistoryService] Failed to save to user local storage:', err);
  }
};

export const deleteLocalAnalysisForUser = (userId: string, analysisId: string): void => {
  if (!userId) return;
  try {
    const existing = getLocalAnalysesForUser(userId);
    const updated = existing.filter(a => a.id !== analysisId);
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('resumex:history_changed', { detail: { action: 'delete', id: analysisId, userId } }));
  } catch (err) {
    console.warn('[HistoryService] Failed to delete from user local storage:', err);
  }
};

// ─── UUID Helpers ────────────────────────────────────────────────────────────

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isValidUUID = (uuid?: string | null): boolean =>
  !!uuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);

// ─── Public API ──────────────────────────────────────────────────────────────

export interface SaveAnalysisInput {
  type: 'score_only' | 'full';
  resumeText: string;
  jobDescription: string;
  experienceLevel?: string;
  scoreData?: AtsAnalysisResponse | null;
  optimizeData?: OptimizeResumeResponse | null;
}

export interface FetchAnalysesResult {
  analyses: ResumeAnalysis[];
  isCloudSynced: boolean;
  cloudError?: string | null;
  isGuest: boolean;
  requiresEmailMigration?: boolean;
}

/**
 * Save an ATS score audit or full optimization result.
 * - Authenticated: Saves to user-isolated local storage AND syncs to Supabase cloud
 *   with the user's email/gmail included.
 * - Guest mode: Returns transient analysis for active UI, does NOT save to any persistent history.
 */
export const saveAnalysis = async (
  input: SaveAnalysisInput,
  user: User | null
): Promise<ResumeAnalysis> => {
  const { type, resumeText, jobDescription, experienceLevel, scoreData, optimizeData } = input;

  const firstLine = jobDescription.trim().split('\n')[0].slice(0, 60);
  const resumeName = firstLine ? `${firstLine}…` : 'Untitled Analysis';

  const analysisId = generateUUID();
  const userId = user?.id && isValidUUID(user.id) ? user.id : 'guest-session';
  const userEmail = user?.email || null;

  const record: ResumeAnalysis = {
    id: analysisId,
    user_id: userId,
    user_email: userEmail,
    resume_text: resumeText.trim(),
    job_description: jobDescription.trim(),
    experience_level: experienceLevel || 'Mid-Level',
    resume_name: resumeName,
    analysis_type: type,
    initial_score: null,
    optimized_score: null,
    score_boost: null,
    matched_keywords: null,
    missing_keywords: null,
    improvements_summary: null,
    ats_formatting_tips: null,
    optimized_resume: null,
    raw_analysis: null,
    critical_gaps: null,
    formatting_issues: null,
    recommendations: null,
    summary: null,
    created_at: new Date().toISOString(),
  };

  if (type === 'score_only' && scoreData) {
    record.initial_score = scoreData.initialScore;
    record.matched_keywords = scoreData.matchedKeywords || [];
    record.missing_keywords = scoreData.missingKeywords || [];
    record.critical_gaps = scoreData.criticalGaps || [];
    record.formatting_issues = scoreData.formattingIssues || [];
    record.recommendations = scoreData.recommendations || [];
    record.summary = scoreData.summary || null;
  }

  if (type === 'full' && optimizeData) {
    record.initial_score = optimizeData.initialScore;
    record.optimized_score = optimizeData.optimizedScore;
    record.score_boost = optimizeData.scoreBoost;
    record.matched_keywords = optimizeData.keyKeywordsMatched || [];
    record.missing_keywords = optimizeData.missingKeywordsAdded || [];
    record.improvements_summary = optimizeData.improvementsSummary || [];
    record.ats_formatting_tips = optimizeData.atsFormattingTips || [];
    record.optimized_resume = optimizeData.optimizedResume;
    record.raw_analysis = optimizeData.rawAnalysis || null;

    if (scoreData) {
      record.critical_gaps = scoreData.criticalGaps || null;
      record.formatting_issues = scoreData.formattingIssues || null;
      record.recommendations = scoreData.recommendations || null;
      record.summary = scoreData.summary || null;
    }
  }

  // GUEST MODE: Do not persist to any account history
  if (!user || !isValidUUID(user.id)) {
    console.info('[HistoryService] Guest mode analysis executed (not saved to account history).');
    return record;
  }

  // AUTHENTICATED USER: Save to user's isolated local cache
  saveLocalAnalysisForUser(user.id, record);

  // Sync to Supabase cloud
  try {
    // Attempt insert including user_email
    const insertPayload: any = {
      ...record,
      user_id: user.id,
      user_email: userEmail,
    };

    const { error: dbError } = await supabase.from('resume_analyses').insert(insertPayload);

    if (dbError) {
      // Check if user_email column does not exist yet (code 42703)
      if (dbError.code === '42703' || dbError.message?.includes('user_email')) {
        console.warn(
          '[HistoryService] Column user_email does not exist yet in Supabase. Retrying insert without user_email...'
        );
        const { user_email, ...payloadWithoutEmail } = insertPayload;
        const { error: retryError } = await supabase.from('resume_analyses').insert(payloadWithoutEmail);
        if (retryError) {
          console.warn('[HistoryService] Supabase fallback insert warning:', retryError.message);
        } else {
          console.log('[HistoryService] Saved to Supabase (without user_email column). Run migration 002 to add user_email.');
        }
      } else if (dbError.code === 'PGRST205' || dbError.message?.includes('schema cache')) {
        console.info('[HistoryService] Table resume_analyses not created in Supabase yet. Analysis saved to local cache.');
      } else {
        console.warn('[HistoryService] Supabase insert warning:', dbError.message);
      }
    } else {
      console.log('[HistoryService] Successfully synced analysis to Supabase with user_email:', userEmail);
    }
  } catch (cloudErr) {
    console.warn('[HistoryService] Supabase cloud connection error:', cloudErr);
  }

  return record;
};

/**
 * Fetch all analyses strictly for the authenticated user.
 * - Guest mode (!user): Returns empty array [] immediately.
 * - Authenticated: Returns ONLY analyses matching user.id from both cloud and user storage.
 */
export const fetchAllAnalyses = async (user: User | null): Promise<FetchAnalysesResult> => {
  // GUEST MODE: Strictly no history shown
  if (!user || !isValidUUID(user.id)) {
    return {
      analyses: [],
      isCloudSynced: false,
      cloudError: null,
      isGuest: true,
      requiresEmailMigration: false,
    };
  }

  const userId = user.id;
  const localList = getLocalAnalysesForUser(userId);
  let cloudList: ResumeAnalysis[] = [];
  let isCloudSynced = false;
  let cloudError: string | null = null;
  let requiresEmailMigration = false;

  try {
    // Strictly filter by user_id (and RLS guarantees security at Postgres level)
    const { data, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      cloudList = data as ResumeAnalysis[];
      isCloudSynced = true;
    } else if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        cloudError = 'Table "resume_analyses" not found in Supabase. Using resilient local history.';
      } else {
        cloudError = error.message;
      }
    }

    // Check if user_email column is present
    const { error: colError } = await supabase.from('resume_analyses').select('user_email').limit(1);
    if (colError && colError.code === '42703') {
      requiresEmailMigration = true;
    }
  } catch (err: any) {
    cloudError = err?.message || 'Failed to connect to Supabase';
  }

  // Merge cloud items and user local items, deduplicated by id
  const map = new Map<string, ResumeAnalysis>();

  // Add cloud items (all verified to belong to userId)
  cloudList.forEach(item => {
    if (item.user_id === userId) {
      map.set(item.id, item);
    }
  });

  // Add local items (all verified to belong to userId)
  localList.forEach(item => {
    if (item.user_id === userId && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    analyses: merged,
    isCloudSynced,
    cloudError,
    isGuest: false,
    requiresEmailMigration,
  };
};

/**
 * Delete an analysis from both user-isolated local storage and Supabase cloud.
 */
export const removeAnalysis = async (id: string, user: User | null): Promise<void> => {
  if (!user || !isValidUUID(user.id)) return;

  deleteLocalAnalysisForUser(user.id, id);

  try {
    await supabase
      .from('resume_analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  } catch (err) {
    console.warn('[HistoryService] Failed to delete from Supabase:', err);
  }
};
