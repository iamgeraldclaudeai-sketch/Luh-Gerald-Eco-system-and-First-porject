# Changelog

All notable changes to the Luh Gerald Eco System are logged here.

## 2026-08-01
- Initial repo scaffold created
- Added README.md with department overview
- Created folder structure for 6 departments: Marketing Suite, Content Studio, Dev Bay, Operations Hub, Finance Office, Research Lab
- Built the frontend foundation: Next.js (App Router) + TypeScript + Tailwind app in `frontend/`
  - Homepage / AI Command Center with status panel and department grid
  - Shared navigation and module screen layout
  - One route per department (Marketing Suite, Content Studio, Dev Bay, Operations Hub, Finance Office, Research Lab)
  - Verified with a clean production build
- Redesigned the dashboard to match the ecosystem concept art
  - AI Command Center hero with live system status, activity log, and interactive quick actions
  - Neon department grid styled after the space-station reference image
  - Refreshed all 6 module screens with matching glow styling
- Added email + password authentication
  - `/login` and `/signup` screens, session persisted client-side
  - Dashboard and all module routes now redirect to `/login` when signed out
- Added Vercel deployment configuration (`frontend/vercel.json`) and `DEPLOYMENT.md` with setup instructions
- Replaced browser-only auth with real server-side auth
  - Postgres-backed `users` table (auto-created on first signup, no migration step)
  - Passwords hashed with bcrypt; sessions are signed httpOnly cookies
  - New `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session` routes
  - Documented database + session secret setup in `DEPLOYMENT.md`
- Tightened auth config errors: missing `POSTGRES_URL`/`DATABASE_URL`/`SESSION_SECRET` now
  names exactly which one is missing instead of a generic failure message
- Added email verification: signup sends a verification email, `/api/auth/verify` confirms it,
  unverified accounts get a reminder banner but aren't blocked from signing in
- Added password reset: `/forgot-password` and `/reset-password` pages, `/api/auth/request-password-reset`
  and `/api/auth/reset-password` routes, token-based with 1 hour expiry
- Added `lib/email.ts` sending real emails via Resend, falling back to console logging when unconfigured
- Added `scripts/seed.mjs` (`npm run seed`) to populate sample users and sample Marketing Suite posts
- Wired the Marketing Suite screen to real seeded post data (first module off placeholders)
- Added vitest with unit tests for session token round-trip and token generation (`npm test`)
