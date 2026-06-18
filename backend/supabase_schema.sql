-- ============================================================================
-- MidScope — Supabase Postgres schema  (run in Supabase SQL Editor)
-- ============================================================================
-- All tables are tenant-scoped via auth.uid().  Row-Level Security is enforced
-- so user A can never read user B's rows.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";


-- ---------------------------------------------------------------------------
-- 1) profiles — extends auth.users (Layer 1 + 2 of the Smart Health Profile)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
    id                       uuid primary key references auth.users(id) on delete cascade,
    email                    text,
    full_name                text,
    locale                   text default 'en',
    plan                     text default 'standard' check (plan in ('standard','premium','royal')),
    master_unlock            boolean default false,
    trial_expires_at         timestamptz,

    -- Layer 1 — permanent
    date_of_birth            date,
    sex                      text check (sex in ('male','female','other')),
    height_cm                numeric(5,1),
    blood_group              text,
    allergies                text[]  default array[]::text[],
    chronic_diseases         text[]  default array[]::text[],
    surgical_history         text[]  default array[]::text[],
    family_history           text[]  default array[]::text[],

    -- Layer 2 — semi-permanent
    weight_kg                numeric(5,1),
    smoking_status           text,
    exercise_habits          text,
    baseline_bp_systolic     int,
    baseline_bp_diastolic    int,
    long_term_medications    text[]  default array[]::text[],
    supplements              text[]  default array[]::text[],

    created_at               timestamptz default now(),
    updated_at               timestamptz default now()
);

create index if not exists profiles_plan_idx on public.profiles(plan);


-- ---------------------------------------------------------------------------
-- 2) lab_reports — every analysis the user runs (Lab / Radiology / ECG / manual)
-- ---------------------------------------------------------------------------
create table if not exists public.lab_reports (
    id                  uuid primary key default uuid_generate_v4(),
    user_id             uuid not null references public.profiles(id) on delete cascade,
    kind                text not null check (kind in ('lab','radiology','ecg','manual')),
    source              text not null check (source in ('image','pdf','manual','voice')),
    file_path           text,        -- storage bucket path (lab-reports/<uid>/...)
    language            text default 'en',
    audience            text default 'patient',

    raw_input           jsonb,       -- original payload submitted
    normalised_panel    jsonb,       -- output of normalise_lab_entries()
    layer3_context      jsonb,       -- Layer 3 dynamic clinical context for this submission
    interpretation      text,        -- LLM-generated explanation
    critical_flags      text[]  default array[]::text[],

    created_at          timestamptz default now()
);

create index if not exists lab_reports_user_idx on public.lab_reports(user_id, created_at desc);
create index if not exists lab_reports_kind_idx on public.lab_reports(kind);


-- ---------------------------------------------------------------------------
-- 3) subscriptions — tier history & billing
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
    id           uuid primary key default uuid_generate_v4(),
    user_id      uuid not null references public.profiles(id) on delete cascade,
    plan         text not null check (plan in ('standard','premium','royal')),
    status       text not null check (status in ('active','trial','cancelled','expired')),
    billing      text default 'yearly',
    provider     text check (provider in ('zaincash','rafidain','stripe','admin')),
    started_at   timestamptz default now(),
    expires_at   timestamptz,
    auto_renew   boolean default false,
    created_at   timestamptz default now()
);

create index if not exists subscriptions_user_status_idx
    on public.subscriptions(user_id, status, expires_at desc);


-- ---------------------------------------------------------------------------
-- 4) payments — transactional record of every payment attempt
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
    id               uuid primary key default uuid_generate_v4(),
    user_id          uuid not null references public.profiles(id) on delete cascade,
    subscription_id  uuid references public.subscriptions(id) on delete set null,
    provider         text not null,
    transaction_id   text,
    amount           numeric(10,2),
    currency         text default 'USD',
    status           text check (status in ('pending','verified','failed','refunded')),
    raw_payload      jsonb,
    created_at       timestamptz default now()
);

create index if not exists payments_user_status_idx on public.payments(user_id, status);
create unique index if not exists payments_tx_unique on public.payments(provider, transaction_id);


-- ---------------------------------------------------------------------------
-- 5) settings — per-user key/value store (notification prefs, language, etc.)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
    id          uuid primary key default uuid_generate_v4(),
    user_id     uuid not null references public.profiles(id) on delete cascade,
    key         text not null,
    value       jsonb,
    updated_at  timestamptz default now(),
    unique(user_id, key)
);


-- ============================================================================
-- Row Level Security  (every table is locked to auth.uid() = user_id)
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.lab_reports   enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments      enable row level security;
alter table public.settings      enable row level security;

create policy "Users read own profile"    on public.profiles      for select using (auth.uid() = id);
create policy "Users update own profile"  on public.profiles      for update using (auth.uid() = id);
create policy "Users insert own profile"  on public.profiles      for insert with check (auth.uid() = id);

create policy "Users read own reports"    on public.lab_reports   for select using (auth.uid() = user_id);
create policy "Users insert own reports"  on public.lab_reports   for insert with check (auth.uid() = user_id);
create policy "Users delete own reports"  on public.lab_reports   for delete using (auth.uid() = user_id);

create policy "Users read own subs"       on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users read own payments"   on public.payments      for select using (auth.uid() = user_id);
create policy "Users CRUD own settings"   on public.settings      for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================================
-- Storage bucket: lab-reports  (PDF/image uploads)
-- Run in the Supabase Dashboard → Storage → New bucket
-- ============================================================================
-- name: lab-reports
-- public: false  (only authenticated users; signed URLs for read)
-- policies:
--   1) Authenticated users can INSERT into lab-reports/<auth.uid()>/...
--   2) Authenticated users can SELECT only their own paths
--
-- SQL:
-- create policy "lab-reports insert own" on storage.objects for insert
--   with check (bucket_id = 'lab-reports' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "lab-reports read own"   on storage.objects for select
--   using       (bucket_id = 'lab-reports' and auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================================================
-- Auto-create profile row on signup (via auth.users trigger)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();