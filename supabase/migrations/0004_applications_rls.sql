-- Migration 0004: Tighten RLS for applications (require profile owner)

-- This migration enforces that inserts to applications must be performed by an
-- authenticated user and that the profile_id matches auth.uid(). This ensures
-- applicants can only create applications for themselves.

alter table public.applications enable row level security;

drop policy if exists "applications_insert_public" on public.applications;
create policy "applications_insert_owner"
on public.applications for insert
with check (profile_id = auth.uid());

-- Optionally, you can also restrict select/update/delete as needed. For now,
-- we allow selects (admins or public UI may want to read applications via
-- server-side service role queries).
