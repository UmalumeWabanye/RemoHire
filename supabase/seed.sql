-- Optional seed for local testing. Run manually via Supabase SQL Editor.
-- Optional seed for local testing. Run manually via Supabase SQL Editor.

-- WARNING: The statements below are intended for local/dev databases only.
-- They insert a test auth user and a matching profile so we can create
-- a company that satisfies the foreign key constraint on owner_id.
-- Do NOT run this in production unless you understand the implications.

-- Choose a fixed UUID so tests/seed runs are idempotent and easy to reference.
-- You can change this to gen_random_uuid() if you prefer non-deterministic ids.
\n-- Seed values (change if you want different test credentials)
DO $$ BEGIN
  -- no-op block to keep SQL editors happy when copy/pasting multiple statements
  NULL;
END $$;

-- 1) Create a test auth user (auth.users). This is safe in a local/dev DB
-- but in production prefer using the Auth API / Dashboard to create users.
INSERT INTO auth.users (id, aud, email, email_confirmed_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'seed@example.com',
  now()
)
ON CONFLICT DO NOTHING;

-- 2) Create a matching profile row in public.profiles
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'seed@example.com',
  'Seed Owner',
  'employer',
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- 3) Create a company owned by the seeded profile
INSERT INTO public.companies (id, owner_id, name)
VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'Example Company'
)
ON CONFLICT DO NOTHING;

-- Convenience: if you already have profiles and just want to attach a
-- sample company to an existing profile, use the following instead of the
-- statements above (uncomment to use):
--
-- INSERT INTO public.companies (id, owner_id, name)
-- SELECT gen_random_uuid(), id, 'Example Company' FROM public.profiles LIMIT 1
-- ON CONFLICT DO NOTHING;

-- Note: creating jobs requires companies with valid owner_id and profiles.
-- For further local testing consider adding more seed rows or using the
-- Supabase Admin API to create test accounts programmatically.
