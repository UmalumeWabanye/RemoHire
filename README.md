# README

## Local Development Instructions

To get started with development:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## Supabase local setup

1. Create `apps/web/.env.local` (do NOT commit) with:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

2. Make sure your Supabase project allows origin `http://localhost:3000` (Auth → Settings → Allowed origins).

3. Start the dev server and open `http://localhost:3000/supabase-test`.

## Create a test user quickly (local)

You can create a test user using the included script (no extra packages):

```bash
# from repo root
npm run create-test-user -- test+1@example.com Password123!
```

This uses the Supabase Auth REST endpoint and requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to be set in your environment or `apps/web/.env.local`.

## Pull request

Branch with the changes: `add/supabase-client`.
Open a PR on GitHub: https://github.com/UmalumeWabanye/RemoHire/pull/new/add/supabase-client

If you prefer CLI:

```bash
gh pr create --title "Add Supabase client setup and smoke test page" \
   --body "Adds Supabase client helper, apps/web/.env.example, apps/web/README.md, and a smoke test page at /supabase-test. No real secrets are committed; .env.example contains blank placeholders. Converted apps/web to be tracked in the main repo so these changes are included in this PR." \
   --base main
```

