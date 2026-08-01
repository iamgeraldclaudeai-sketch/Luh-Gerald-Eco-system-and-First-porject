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
Signup also sends a verification email, and there's a full forgot/reset
password flow — see below.

If a required env var is missing, these routes now return a specific error
telling you which one (instead of a generic failure), e.g.:
`Server is missing required environment variable(s): SESSION_SECRET.`

## Sending real emails (verification + password reset)

Emails are sent via [Resend](https://resend.com). Without an API key,
emails are simply logged to the server console instead of sent — so
everything still works for local testing/demos with zero setup.

To send real emails:

1. Create a free Resend account and get an API key.
2. Add environment variables:
   - `RESEND_API_KEY` — your Resend API key.
   - `RESEND_FROM_EMAIL` (optional) — defaults to Resend's shared test
     sender; set this to your own verified domain/sender once you have one.
3. Redeploy.

## Seeding sample data

To try the app with sample accounts, sample agents, and sample data for every
module:

```bash
cd frontend
npm run seed
```

This is safe to re-run — it skips anything already seeded. It prints the
sample login credentials when it finishes. It needs `DATABASE_URL` (or
`POSTGRES_URL`) pointed at the database you want to seed — see "Local
development" above for your own machine, or the next section to seed your
**production** database without ever pasting the credential into a chat.

### Seeding production via GitHub Actions

There's a manual workflow (`.github/workflows/seed.yml`) that runs
`npm run seed` inside GitHub's own infrastructure, using a secret you store
in GitHub — this is the safest way to seed your live production database
since the credential never has to leave GitHub's systems.

One-time setup:

1. In the GitHub repo, go to **Settings → Secrets and variables → Actions →
   New repository secret**.
2. Name it `DATABASE_URL`, paste your production connection string as the
   value, save.

To run it:

1. Go to the **Actions** tab → **Seed Database** (in the left sidebar) →
   **Run workflow**.
2. Pick the branch that has this workflow file, click **Run workflow**.
3. Open the run to see the log — it'll print the same sample login
   credentials as running it locally.
