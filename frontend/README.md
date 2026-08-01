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
- `app/api/auth/*` — signup, login, logout, and session API routes (server-side)
- `components/Nav.tsx` — shared top navigation + logout, shown on every dashboard screen
- `components/ModuleScreen.tsx` — shared layout used by every department screen
- `components/RequireAuth.tsx` — client-side guard that redirects to `/login` when signed out
- `lib/modules.ts` — single source of truth for department metadata (name, tagline, color, widgets)
- `lib/auth.tsx` — client auth context (calls the API routes, tracks session state)
- `lib/db.ts` — Postgres connection + lazy `users` table creation
- `lib/session.ts` — signed session cookie helpers

## Getting started

```bash
cd frontend
cp .env.example .env.local   # fill in POSTGRES_URL and SESSION_SECRET
npm install
npm run dev
```

Then open http://localhost:3000 — you'll land on `/login` until you create an
account via `/signup`. See `../DEPLOYMENT.md` for where `POSTGRES_URL` comes
from.

## Auth — how it works today

Signup and login are real, server-side: passwords are hashed with bcrypt and
stored in Postgres, and sessions are signed httpOnly cookies verified on the
server (`lib/session.ts`). Accounts sync across devices/browsers and survive
deploys. Nothing else to swap in later — this is the real thing.

## Deployment

See `../DEPLOYMENT.md` for Vercel setup steps.

## Status

Front-end foundation, full department screens, and a working auth flow are
in place. Each module screen currently shows placeholder widgets — real data
and actions plug in next.
