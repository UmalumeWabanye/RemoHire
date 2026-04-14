-- Migration: Add job visibility enum and employer invites
-- Adds job visibility (public/private) and employer_invites table

-- Enums
do $$ begin
  create type public.job_visibility as enum ('public','private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.job_status as enum ('draft','published','closed');
exception when duplicate_object then null; end $$;

-- Jobs: add visibility column if missing and ensure status enum exists
alter table public.jobs
  add column if not exists visibility public.job_visibility not null default 'private';

-- Employer invites table
create table if not exists public.employer_invites (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  invited_by uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

drop trigger if exists trg_employer_invites_updated_at on public.employer_invites;
create trigger trg_employer_invites_updated_at
before update on public.employer_invites
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.jobs enable row level security;
alter table public.employer_invites enable row level security;

-- Policies for jobs (public board + owner access)
drop policy if exists "jobs_select_public_published" on public.jobs;
create policy "jobs_select_public_published"
on public.jobs for select
using (
  visibility = 'public' and status = 'published'
);

drop policy if exists "jobs_select_owner_or_public" on public.jobs;
create policy "jobs_select_owner_or_public"
on public.jobs for select
using (
  visibility = 'public' and status = 'published'
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

-- Policies for employer_invites (readable for authenticated users for now)
drop policy if exists "employer_invites_select_auth" on public.employer_invites;
create policy "employer_invites_select_auth"
on public.employer_invites for select
using (auth.role() is not null);

drop policy if exists "employer_invites_insert_auth" on public.employer_invites;
create policy "employer_invites_insert_auth"
on public.employer_invites for insert
with check (auth.role() is not null);
