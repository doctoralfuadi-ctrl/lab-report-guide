-- ============================================================================
-- MidScope — Supabase Postgres schema (run in Supabase SQL Editor)
-- ============================================================================
-- All tables are tenant-scoped via auth.uid(). Row-Level Security is enforced
-- so user A can never read user B's rows.
-- ============================================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  date_of_birth DATE,
  sex TEXT CHECK (sex IN ('male','female','other')),
  ethnicity TEXT,
  pregnancy_status TEXT DEFAULT 'not_pregnant',
  pregnancy_week INTEGER,
  smoking_status TEXT DEFAULT 'never',
  alcohol_status TEXT DEFAULT 'none',
  exercise_level TEXT DEFAULT 'moderate',
  medications JSONB DEFAULT '[]'::jsonb,
  conditions JSONB DEFAULT '[]'::jsonb,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard','premium','royal')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_self ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- 2. LAB_REPORTS
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  raw_input JSONB,
  parsed_results JSONB,
  ai_interpretation TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY lab_reports_self ON public.lab_reports
  FOR ALL USING (auth.uid() = user_id);

-- 3. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('standard','premium','royal')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','trial')),
  payment_method TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_self ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- 4. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  provider TEXT,
  provider_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_self ON public.payments
  FOR ALL USING (auth.uid() = user_id);

-- 5. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, key)
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_self ON public.settings
  FOR ALL USING (auth.uid() = user_id);

-- SIGNUP TRIGGER: auto-create profile row on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STORAGE BUCKET POLICIES
-- Run after creating the 'lab-reports' bucket in Supabase Storage UI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('lab-reports', 'lab-reports', false);
-- CREATE POLICY lab_reports_bucket_self ON storage.objects
--   FOR ALL USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
