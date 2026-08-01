# Deploying to Vercel

The app lives in `frontend/`, not the repo root, so the one setting that
matters is **Root Directory**.

## First-time setup

1. Go to https://vercel.com/new and import this GitHub repo.
2. When prompted for **Root Directory**, click "Edit" and set it to `frontend`.
3. Framework Preset should auto-detect as **Next.js** — leave build/output
   settings on their defaults (`npm run build`, `.next`).
4. No environment variables are required yet — login/signup currently run
   entirely in the browser (see note below), so there's nothing to configure.
5. Click **Deploy**.

Every push to this branch (or whichever branch you connect) will trigger a
new deployment automatically once the project is linked.

## Redeploying after changes

Once the project is linked to this repo, Vercel redeploys automatically on
every push — no extra steps needed.

## About the current login system

Signup/login right now store accounts in the browser's `localStorage`, so
there's no server or database to configure for deployment — but it also
means accounts don't sync across browsers/devices and aren't real production
security. When you're ready for real accounts (shared across devices,
recoverable, properly secured), the next step is wiring up a database
(e.g. Vercel Postgres, Supabase) and moving auth to the server — ask and
we'll build that next.
