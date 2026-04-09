-- RemoteHire Africa - initial schema (draft)
-- Requires Supabase Auth (auth.users)

-- Extensions
create extension if not exists "pgcrypto";

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Enums
do $$ begin
  create type public.user_role as enum ('developer','employer','admin');
exception when duplicate_object then null; end $$;

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.user_role,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Developer profile (optional 1:1)
create table if not exists public.developer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text,
  location text,
  years_experience int,
  skills text[] not null default '{}',
  portfolio_url text,
  github_url text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_dev_profiles_updated_at on public.developer_profiles;
create trigger trg_dev_profiles_updated_at
before update on public.developer_profiles
for each row execute function public.set_updated_at();

-- Companies (owned by employer user)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_companies_updated_at on public.companies;
create trigger trg_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

-- Jobs
do $$ begin
  create type public.job_status as enum ('draft','published','closed');
exception when duplicate_object then null; end $$;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  location text,
  is_remote boolean not null default true,
  status public.job_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.developer_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;

-- Policies
-- profiles: user can read/update own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- developer_profiles: user can read/update own
drop policy if exists "dev_profiles_select_own" on public.developer_profiles;
create policy "dev_profiles_select_own"
on public.developer_profiles for select
using (user_id = auth.uid());

drop policy if exists "dev_profiles_upsert_own" on public.developer_profiles;
create policy "dev_profiles_upsert_own"
on public.developer_profiles for insert
with check (user_id = auth.uid());

drop policy if exists "dev_profiles_update_own" on public.developer_profiles;
create policy "dev_profiles_update_own"
on public.developer_profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- companies/jobs: owner can manage; everyone can read published jobs (later we can make public)
drop policy if exists "companies_select_owner" on public.companies;
create policy "companies_select_owner"
on public.companies for select
using (owner_id = auth.uid());

drop policy if exists "companies_insert_owner" on public.companies;
create policy "companies_insert_owner"
on public.companies for insert
with check (owner_id = auth.uid());

drop policy if exists "companies_update_owner" on public.companies;
create policy "companies_update_owner"
on public.companies for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "jobs_select_published_or_owner" on public.jobs;
create policy "jobs_select_published_or_owner"
on public.jobs for select
using (
  status = 'published'
  or created_by = auth.uid()
);

drop policy if exists "jobs_insert_owner" on public.jobs;
create policy "jobs_insert_owner"
on public.jobs for insert
with check (created_by = auth.uid());

drop policy if exists "jobs_update_owner" on public.jobs;
create policy "jobs_update_owner"
on public.jobs for update
using (created_by = auth.uid())
with check (created_by = auth.uid());