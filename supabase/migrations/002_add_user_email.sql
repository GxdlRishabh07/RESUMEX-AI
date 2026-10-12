-- ══════════════════════════════════════════════════════════════════
-- RESUMEX // AI  — Migration 002: Add user_email to resume_analyses
-- Run this in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- Add user_email column so admin can see user emails in Supabase Table Editor
ALTER TABLE public.resume_analyses
  ADD COLUMN IF NOT EXISTS user_email TEXT;

COMMENT ON COLUMN public.resume_analyses.user_email IS 'Email / Gmail of the user who performed the analysis';

-- Verify column was added:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resume_analyses' AND column_name = 'user_email';
