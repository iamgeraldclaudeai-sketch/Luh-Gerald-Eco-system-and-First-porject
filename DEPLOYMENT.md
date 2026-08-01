# Deploying to Vercel

The app lives in `frontend/`, not the repo root, so the one setting that
matters is **Root Directory**.

## First-time setup

1. Go to https://vercel.com/new and import this GitHub repo.
2. When prompted for **Root Directory**, click "Edit" and set it to `frontend`.
3. Framework Preset should auto-detect as **Next.js** — leave build/output
   settings on their defaults (`npm run build`, `.next`).
4. Set up the database and session secret (see below) before deploying, so
   signup/login work on first load.
5. Click **Deploy**.

Every push to this branch (or whichever branch you connect) will trigger a
new deployment automatically once the project is linked.

## Setting up the database (accounts / login)

Real accounts are stored in Postgres. Vercel Postgres now runs on Neon, so
this is a couple of clicks:

1. In your Vercel project, open the **Storage** tab → **Create Database** →
   choose **Postgres** (Neon).
2. Connect it to this project. Vercel automatically adds a `POSTGRES_URL`
   environment variable — you don't need to copy/paste anything.
3. Still in **Settings → Environment Variables**, add one more variable:
   - `SESSION_SECRET` — any long random string, used to sign login sessions.
     Generate one locally with `openssl rand -base64 32` and paste the output in.
4. Redeploy (or deploy for the first time) — the `users` table is created
   automatically the first time someone signs up, no migration step needed.

## Local development

1. Copy `frontend/.env.example` to `frontend/.env.local`.
2. Fill in `POSTGRES_URL` (copy it from the Vercel dashboard, or run
   `vercel env pull .env.local` from inside `frontend/` if you have the
   Vercel CLI linked) and `SESSION_SECRET` (any random string).
3. `npm run dev` inside `frontend/` — signup/login now work against the real
   database.

## Redeploying after changes

Once the project is linked to this repo, Vercel redeploys automatically on
every push — no extra steps needed.

## About the login system

Signup and login are handled by API routes (`frontend/app/api/auth/*`):
passwords are hashed with bcrypt and stored in Postgres, and sessions are
signed httpOnly cookies — safe to use for real accounts, not just a demo.
