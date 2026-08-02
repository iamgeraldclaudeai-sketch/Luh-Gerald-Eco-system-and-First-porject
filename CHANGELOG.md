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
- Added an AI agents system
  - `agents` and `activity_log` tables; 2 sample agents seeded (Atlas, Nova)
  - `GET /api/agents`, `GET /api/agents/[id]`, `POST /api/agents/[id]/act` (stubbed action
    runner, logs each run to `activity_log`)
  - AI Command Center now shows agent cards with a "Run action" modal; results append live
    to the activity log feed
- Wired the remaining 5 modules to real DB-backed data, same server-component pattern as
  Marketing Suite: Content Studio, Dev Bay, Operations Hub, Finance Office, Research Lab
  - Generic `module_items` table (with optional `amount_cents` for Finance Office) plus a
    shared `lib/moduleItems.ts` helper and `components/ModuleItemsList.tsx` display component
  - Sample rows seeded for every module via `npm run seed`
- Added a manual GitHub Actions workflow (`.github/workflows/seed.yml`) to run `npm run seed`
  against production using a `DATABASE_URL` GitHub secret, so the credential never has to be
  pasted into a chat or written to a file on a shared machine
- Polished the dashboard with lightweight, CSS-only animation
  - `PageTransition` gives every route a subtle fade/slide on navigation
  - Department cards, agent cards, and activity log entries fade/slide in on mount, with a
    staggered delay across cards
  - Stronger glow-on-hover for every card that already used `glow-border` (department cards,
    agent cards, module widgets/lists) — reuses each element's own color, no new colors added
  - All animation respects `prefers-reduced-motion: reduce`
  - No new dependencies; pure CSS keyframes + existing React state
- Wired the 4 AI Command Center quick-action buttons to real functionality via `POST /api/quick-actions`,
  same `{ result, log }` shape as the agent action endpoint
  - **Run diagnostics** reads live agent/module-item counts from the database
  - **New task** inserts a real row into `module_items` for Operations Hub (visible on that screen)
  - **Sync agents** updates a new `agents.last_synced_at` column for every agent
  - **Broadcast update** logs a system-wide entry
  - Every run writes to `activity_log` and appears in the dashboard's live activity feed;
    buttons show a per-action loading state and surface errors instead of failing silently
- Design tokens: added `lib/design-tokens.ts` (primary `#7C5CFF`, accent `#00E6A8`, bg `#0B0F1A`,
  panel `rgba(255,255,255,0.03)`), wired into `tailwind.config.ts`; applied across primary CTAs,
  glass-panel surfaces, and the new neon `glow-cta` treatment. Added `clsx`/`lib/cn.ts` for
  conditional classNames and `lib/jobQueue.ts` as a lightweight job-status stub.
- Extended the schema (additive, non-breaking): `agents` gains `handle` (unique), `persona`,
  `capabilities` (jsonb); `activity_log` gains `user_id`, `action`, `input`, `result` (jsonb),
  `status`; `module_items` gains `body`, `metadata` (jsonb). Existing columns and data are
  untouched; `npm run seed` backfills `handle`/`persona`/`capabilities` on the existing Atlas/Nova rows.
- `POST /api/agents/[id]/act` now runs through a job-queue-stub pattern (`lib/jobQueue.ts` +
  `lib/actionRunner.ts`): inserts a `pending` activity_log row up front, runs the stub action
  runner, then updates the row with `status`/`result` and returns `{ jobId, result, log }`.
- Added `/agents/[handle]` detail pages (covers `/agents/atlas`, `/agents/nova`, and any future
  agent) with a chat-like transcript of past activity and a capability-driven action runner
  (`components/AgentChat.tsx`). `AgentCard`'s "Run action" modal now also pulls its options from
  the agent's real `capabilities` instead of a hardcoded list.
- Restructured dashboard chrome into `Header` (brand, system-status pill, user menu/logout) and
  `Sidebar` (modules with active-state highlighting), replacing the old single `Nav` bar;
  extracted `ActivityLog` as its own reusable component with derived tag chips.
- Added `/dashboard` (renders the same Command Center as `/`) and short-URL redirects
  (`/marketing`, `/content`, `/dev`, `/ops`, `/finance`, `/research` → the existing canonical
  routes) via `next.config.mjs`; login/signup/reset now redirect to `/dashboard`.
- UI polish: glass-panel surfaces, `prefers-reduced-motion`-aware skeleton loaders
  (`components/Skeleton.tsx`, `app/(dashboard)/loading.tsx`, used by `RequireAuth` too), and a
  `:focus-visible` ring using the accent color for keyboard accessibility.
- Added `.github/workflows/test.yml` (runs `npm test` + `npm run build` on push/PR) alongside the
  existing manual seed workflow.
- Added unit tests for the new job-queue stub, action runner, and design tokens (11 tests total
  across the suite, all passing; see PR for screenshots of the dashboard, agent action modal, and
  a module page).
- Added `SYSTEM_MAP.md`: a read-only audit covering API-route auth/error handling, a seed-data-
  vs-schema diff, a hardcoded-secrets scan, CI workflow verification (via actual GitHub Actions
  run history), mobile responsiveness of the 6 module pages, Vercel deployment status, and an
  effort-scored (S/M/L) roadmap of incomplete items.
- Fixed the unguarded-API-routes finding from that audit: added `lib/requireSession.ts` (a
  server-side session-cookie check for route handlers) and applied it to `GET /api/agents`,
  `GET /api/agents/[id]`, `POST /api/agents/[id]/act`, and `POST /api/quick-actions` — previously
  these had no auth check at all beyond the client-side `RequireAuth` guard, so anyone with the
  URL could call them directly, including the two that mutate data. 4 new tests confirm requests
  without a valid session are rejected with 401.
