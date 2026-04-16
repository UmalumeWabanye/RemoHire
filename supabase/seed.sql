-- Optional seed for local testing. Run manually via Supabase SQL Editor.

-- WARNING: The statements below are intended for local/dev databases only.
-- They insert a test auth user and a matching profile so we can exercise
-- the candidate onboarding/dashboard flow. Do NOT run this in production.

-- Choose a fixed UUID so tests/seed runs are idempotent and easy to reference.
-- You can change this to gen_random_uuid() if you prefer non-deterministic ids.
-- Seed values (change if you want different test credentials)

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

-- 2) Create a matching profile row in public.profiles (developer/candidate)
INSERT INTO public.profiles (id, email, full_name, role, onboarding_complete, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'seed@example.com',
  'Seed Candidate',
  'developer',
  true,
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- 3) Create a developer_profiles row so the candidate onboarding appears complete
INSERT INTO public.developer_profiles (user_id, headline, skills, linkedin_url, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Full-stack Developer',
  ARRAY['React','Node.js','TypeScript']::text[],
  'https://www.linkedin.com/in/example',
  now(),
  now()
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
