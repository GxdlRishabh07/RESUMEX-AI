-- ══════════════════════════════════════════════════════════════════
-- RESUMEX // AI  — Initial Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ─── 1. profiles ──────────────────────────────────────────────────
-- One row per authenticated user. Auto-created via trigger on signup.
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profile data, linked 1:1 to auth.users.';

-- ─── 2. resume_analyses ────────────────────────────────────────────
-- Stores every ATS audit and full optimization result.
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email          TEXT,                          -- user's email / gmail
  resume_text         TEXT NOT NULL,
  job_description     TEXT NOT NULL,
  experience_level    TEXT,
  resume_name         TEXT,                          -- auto-generated label
  initial_score       INTEGER CHECK (initial_score BETWEEN 0 AND 100),
  optimized_score     INTEGER CHECK (optimized_score BETWEEN 0 AND 100),
  score_boost         INTEGER,
  matched_keywords    JSONB,                         -- string[]
  missing_keywords    JSONB,                         -- string[]
  improvements_summary JSONB,                        -- string[]
  ats_formatting_tips JSONB,                         -- string[]
  optimized_resume    TEXT,
  raw_analysis        JSONB,                         -- { strengths, gapsIdentified }
  analysis_type       TEXT NOT NULL DEFAULT 'full'   -- 'score_only' | 'full'
                        CHECK (analysis_type IN ('score_only', 'full')),
  critical_gaps       JSONB,                         -- string[]
  formatting_issues   JSONB,                         -- string[]
  recommendations     JSONB,                         -- string[]
  summary             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id
  ON public.resume_analyses (user_id, created_at DESC);

COMMENT ON TABLE public.resume_analyses IS 'Stores ATS score audits and full optimization results per user.';

-- ─── 3. Row Level Security ─────────────────────────────────────────
-- CRITICAL: Every user can ONLY access their OWN rows.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- profiles: each user sees and edits only their own profile
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: own insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- resume_analyses: full CRUD scoped strictly to the owner
CREATE POLICY "analyses: own read"
  ON public.resume_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "analyses: own insert"
  ON public.resume_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analyses: own update"
  ON public.resume_analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analyses: own delete"
  ON public.resume_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ─── 4. Auto-create profile on signup ──────────────────────────────
-- Triggered whenever a new row is inserted into auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 5. updated_at auto-update ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════
-- DONE. Verify with:
--   SELECT * FROM public.profiles LIMIT 5;
--   SELECT * FROM public.resume_analyses LIMIT 5;
-- ══════════════════════════════════════════════════════════════════
