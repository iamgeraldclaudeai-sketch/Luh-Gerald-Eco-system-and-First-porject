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
- `components/Nav.tsx` — shared top navigation + logout, shown on every dashboard screen
- `components/ModuleScreen.tsx` — shared layout used by every department screen
- `components/RequireAuth.tsx` — client-side guard that redirects to `/login` when signed out
- `lib/modules.ts` — single source of truth for department metadata (name, tagline, color, widgets)
- `lib/auth.tsx` — auth context (signup/login/logout + session)

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 — you'll land on `/login` until you create an
account via `/signup`.

## Auth — how it works today

Signup/login run entirely in the browser: passwords are hashed (SHA-256) and
stored in `localStorage` alongside the session. This is enough to demo the
full login → signup → dashboard flow and needs no backend to deploy, but it
is **not** real production security — accounts don't sync across devices and
aren't recoverable if storage is cleared. Swapping in a real database +
server-side auth is the natural next step once you're ready.

## Deployment

See `../DEPLOYMENT.md` for Vercel setup steps.

## Status

Front-end foundation, full department screens, and a working auth flow are
in place. Each module screen currently shows placeholder widgets — real data
and actions plug in next.
