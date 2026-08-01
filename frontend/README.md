# Luh Gerald Eco System — Frontend

The front-end foundation for the Luh Gerald Eco System dashboard, built with
Next.js (App Router), TypeScript, and Tailwind CSS.

## Structure

- `app/(dashboard)/page.tsx` — homepage / AI Command Center (system status, live
  activity log, quick actions, department grid), gated behind login
- `app/(dashboard)/<module>/page.tsx` — one screen per department, each behind
  the same auth guard:
  - `marketing-suite`
  - `content-studio`
  - `dev-bay`
  - `operations-hub`
  - `finance-office`
  - `research-lab`
- `app/(auth)/login`, `app/(auth)/signup` — email + password auth screens
- `app/(auth)/forgot-password`, `app/(auth)/reset-password` — password reset flow
- `app/api/auth/*` — signup, login, logout, session, email verification, and
  password reset API routes (server-side)
- `components/Nav.tsx` — shared top navigation + logout + unverified-email banner
- `components/ModuleScreen.tsx` — shared layout used by every department screen
  (accepts optional `children` for module-specific content, used by Marketing Suite)
- `components/RequireAuth.tsx` — client-side guard that redirects to `/login` when signed out
- `lib/modules.ts` — single source of truth for department metadata (name, tagline, color, widgets)
- `lib/auth.tsx` — client auth context (calls the API routes, tracks session state)
- `lib/db.ts` — Postgres connection + lazy `users`/`posts` table creation
- `lib/session.ts` — signed session cookie helpers
- `lib/tokens.ts` — random token generation (verification/reset links)
- `lib/email.ts` — sends verification/reset emails via Resend (console fallback if unconfigured)
- `lib/authConfig.ts` — checks required env vars and returns a specific error if any are missing
- `scripts/seed.mjs` — seeds sample users + sample Marketing Suite posts (`npm run seed`)

## Getting started

```bash
cd frontend
cp .env.example .env.local   # fill in POSTGRES_URL and SESSION_SECRET
npm install
npm run dev
npm run seed                 # optional: adds sample accounts + Marketing posts
```

Then open http://localhost:3000 — you'll land on `/login` until you create an
account via `/signup`. See `../DEPLOYMENT.md` for where `POSTGRES_URL` comes
from and how to send real emails.

## Auth — how it works today

Signup and login are real, server-side: passwords are hashed with bcrypt and
stored in Postgres, and sessions are signed httpOnly cookies verified on the
server (`lib/session.ts`). Accounts sync across devices/browsers and survive
deploys.

- **Email verification**: signup sends a verification email with a link to
  `/api/auth/verify?token=...`. Unverified accounts can still sign in (a
  small banner reminds them to verify) — nothing is blocked on it yet.
- **Password reset**: `/forgot-password` requests a reset link,
  `/reset-password?token=...` sets a new password. The request endpoint
  always returns the same message whether or not the email exists, so it
  can't be used to check who has an account.
- **Emails**: sent via Resend if `RESEND_API_KEY` is set, otherwise logged to
  the server console — so the whole flow works locally with zero email setup.

## Testing

```bash
npm test
```

Runs `vitest` against the pure logic in `lib/` (session token round-trip,
token generation) — no database required.

## Deployment

See `../DEPLOYMENT.md` for Vercel setup steps.

## Status

Front-end foundation, full department screens, a real database-backed auth
system (signup/login/verify/reset), and the Marketing Suite screen wired to
live seeded data are all in place. The other 5 module screens still show
placeholder widgets — real data plugs in the same way Marketing Suite did.
