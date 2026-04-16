-- Migration 0005: add updated_at columns for employer_invites and applications

alter table public.employer_invites
  add column if not exists updated_at timestamptz not null default now();

alter table public.applications
  add column if not exists updated_at timestamptz not null default now();
