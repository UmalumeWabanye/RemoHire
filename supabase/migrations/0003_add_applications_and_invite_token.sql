-- Migration 0003: Add applications table and invite token/expiry

-- Applications table: store job applications (supports anonymous or authenticated applicants)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  email text,
  cover_letter text,
  created_at timestamptz not null default now()
);

drop trigger if exists trg_applications_updated_at on public.applications;
create trigger trg_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

-- Add token and expiry columns to employer_invites for secure invite flow
alter table public.employer_invites
  add column if not exists token text unique,
  add column if not exists expires_at timestamptz;

-- Enable RLS for applications
alter table public.applications enable row level security;

-- Simple policy: allow inserts for anyone (applicants may be anonymous).
-- You can tighten this later to require email verification or other checks.
drop policy if exists "applications_insert_public" on public.applications;
create policy "applications_insert_public"
on public.applications for insert
with check (true);
