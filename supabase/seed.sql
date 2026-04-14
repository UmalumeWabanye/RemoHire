-- Optional seed for local testing. Run manually via Supabase SQL Editor.

-- Example: insert a placeholder public job (does not depend on auth.users)
insert into public.companies (id, owner_id, name)
values (
  gen_random_uuid(),
  gen_random_uuid(),
  'Example Company'
)
on conflict do nothing;

-- Note: creating real jobs requires matching company.owner_id and a profile id.
-- For local testing, prefer creating invites via the employer_invites table using SQL editor.
