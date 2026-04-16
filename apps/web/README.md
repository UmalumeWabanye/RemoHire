# Web app (apps/web)

This folder contains the Next.js web app for RemoHire.

Local setup (Supabase)

- Create a local environment file at `apps/web/.env.local` (do NOT commit it).
- Add the following values to `apps/web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are the public values used by the browser-side Supabase client. Keep server-only keys out of browser envs and in secure server environment variables.

Run the dev server

From the repository root:

```
npm run dev
```

Then open: http://localhost:3000/supabase-test

Smoke test page

- `/supabase-test` is a small client component that calls `supabase.auth.getSession()` and displays whether a session exists or an error.

Notes

- Do not commit real secrets. Root and `apps/web/.env.example` contain blank placeholders. Local secrets belong in `apps/web/.env.local` which is ignored by git.
- You may see a Next.js message about multiple lockfiles if there are both a root `package-lock.json` and `apps/web/package-lock.json`. This is harmless but may be worth standardizing for CI; leave as-is unless you want me to consolidate lockfiles.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
