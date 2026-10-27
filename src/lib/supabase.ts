/**
 * Supabase Client — RESUMEX // AI
 * Single source-of-truth for all Supabase interactions.
 * Uses the anon/public key; Row Level Security enforces data ownership.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('<your-project-id>')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. The app will run in Guest Mode.'
  );
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ─── Database Type Definitions ──────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  user_email?: string | null;
  resume_text: string;
  job_description: string;
  experience_level: string | null;
  resume_name: string | null;
  initial_score: number | null;
  optimized_score: number | null;
  score_boost: number | null;
  matched_keywords: string[] | null;
  missing_keywords: string[] | null;
  improvements_summary: string[] | null;
  ats_formatting_tips: string[] | null;
  optimized_resume: string | null;
  raw_analysis: { strengths: string[]; gapsIdentified: string[] } | null;
  analysis_type: 'score_only' | 'full';
  critical_gaps: string[] | null;
  formatting_issues: string[] | null;
  recommendations: string[] | null;
  summary: string | null;
  created_at: string;
}
