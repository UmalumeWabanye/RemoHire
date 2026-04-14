Supabase migrations and invite flow
=================================

1. Run the SQL in `supabase/migrations/0001_init.sql` and `supabase/migrations/0002_jobs_visibility_and_employer_invites.sql` in the Supabase SQL editor (run these manually in the dashboard).
2. Optionally run `supabase/seed.sql` for non-sensitive example data.
3. Create a service role key in the Supabase dashboard and add it to `apps/web/.env.local` as `SUPABASE_SERVICE_ROLE_KEY` (server-only — do NOT commit).

Redeeming employer invites
--------------------------

POST /api/employer/redeem

Body: { "email": "you@example.com" }

This endpoint requires `SUPABASE_SERVICE_ROLE_KEY` and will mark the invite redeemed and set the corresponding profile role to `employer`.
