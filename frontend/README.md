# Luh Gerald Eco System — Frontend

The front-end foundation for the Luh Gerald Eco System dashboard, built with
Next.js (App Router), TypeScript, and Tailwind CSS.

## Structure

- `app/(dashboard)/page.tsx`, `app/(dashboard)/dashboard/page.tsx` — the AI Command
  Center (system status, live activity log, quick actions, AI agent cards, department
  grid), gated behind login; both routes render the same dashboard
- `app/(dashboard)/agents/[handle]/page.tsx` — per-agent detail page (covers
  `/agents/atlas`, `/agents/nova`, and any future agent) with persona, capability
  badges, and a chat-like action runner
- `app/(dashboard)/<module>/page.tsx` — one screen per department, each behind
  the same auth guard: `marketing-suite`, `content-studio`, `dev-bay`,
  `operations-hub`, `finance-office`, `research-lab`. Short aliases
  (`/marketing`, `/content`, `/dev`, `/ops`, `/finance`, `/research`) redirect to
  these via `next.config.mjs`.
- `app/(auth)/login`, `app/(auth)/signup` — email + password auth screens
- `app/(auth)/forgot-password`, `app/(auth)/reset-password` — password reset flow
- `app/api/auth/*` — signup, login, logout, session, email verification, and
  password reset API routes (server-side)
- `app/api/agents/*` — `GET /api/agents`, `GET /api/agents/[id]`, `POST /api/agents/[id]/act`
  (job-queue-stub pattern: inserts a `pending` row, runs the stub action runner, updates
  it with `status`/`result`, returns `{ jobId, result, log }`)
- `app/api/quick-actions/route.ts` — `POST /api/quick-actions`, backing the 4 AI Command
  Center buttons (run_diagnostics, broadcast_update, new_task, sync_agents) with real DB
  reads/writes, same `{ result, log }` response shape as the agent action endpoint
- `components/Header.tsx`, `components/Sidebar.tsx` — dashboard chrome: a top bar
  (brand, system-status pill, user menu/logout) and a left nav of modules with
  active-state highlighting (a horizontal scroller on mobile)
- `components/DashboardHome.tsx` — the AI Command Center's interactive body (status,
  activity log, quick actions, agent cards); `app/(dashboard)/page.tsx` is a thin server
  component that fetches agents + recent activity and passes them in
- `components/ActivityLog.tsx` — reusable activity feed with timestamp + derived tag chip
- `components/AgentCard.tsx`, `components/AgentActionModal.tsx` — agent cards (avatar,
  role, capability badges) and the "Run action" modal, both driven by the agent's own
  `capabilities` list
- `components/AgentChat.tsx` — the chat-like transcript + action runner used on
  `/agents/[handle]`
- `components/ModuleScreen.tsx` — shared layout used by every department screen
  (accepts optional `children` for module-specific content)
- `components/ModuleItemsList.tsx` — shared list used by Content Studio, Dev Bay,
  Operations Hub, Finance Office, and Research Lab to render their real DB-backed data
- `components/Skeleton.tsx` — skeleton-loader primitive; used by
  `app/(dashboard)/loading.tsx` (automatic Suspense fallback while a page's data loads)
  and `RequireAuth`'s pre-hydration state
- `components/RequireAuth.tsx` — client-side guard that redirects to `/login` when signed out
- `lib/design-tokens.ts` — the brand palette (primary/accent/bg/panel), imported by
  `tailwind.config.ts` so class names and raw values can't drift apart
- `lib/cn.ts` — `clsx` wrapper for conditional classNames
- `lib/jobQueue.ts` — lightweight pending/completed/failed wrapper used by the agent
  action endpoint
- `lib/actionRunner.ts` — the stubbed action runner (canned responses by action name)
- `lib/modules.ts` — single source of truth for department metadata (name, tagline, color, widgets)
- `lib/auth.tsx` — client auth context (calls the API routes, tracks session state)
- `lib/db.ts` — Postgres connection + lazy schema creation (`users`, `posts`, `agents`,
  `activity_log`, `module_items`), including additive migrations for existing tables
- `lib/agents.ts` — server-side data helpers for agents (by id or handle) + recent activity
- `lib/moduleItems.ts` — server-side data helper for the generic `module_items` table
- `lib/session.ts` — signed session cookie helpers
- `lib/tokens.ts` — random token generation (verification/reset links)
- `lib/email.ts` — sends verification/reset emails via Resend (console fallback if unconfigured)
- `lib/authConfig.ts` — checks required env vars and returns a specific error if any are missing
- `scripts/seed.mjs` — seeds sample users, 2 sample agents (with handles/personas/capabilities),
  sample Marketing Suite posts, and sample data for every other module (`npm run seed`)

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

Runs `vitest` against the pure logic in `lib/` (session tokens, token
generation, the job-queue stub, the action runner, design tokens) — no
database required. CI runs this plus `npm run build` on every push/PR via
`.github/workflows/test.yml`.

## Deployment

See `../DEPLOYMENT.md` for Vercel setup steps, environment variables, and how
to seed the production database via GitHub Actions.

## Status

Front-end foundation, full department screens, a real database-backed auth
system (signup/login/verify/reset), an AI agents system with per-agent detail
pages, all 6 module screens wired to live seeded data, and the 4 AI Command
Center quick actions are all in place and functional. Agent actions (via the
"Run action" modal or the `/agents/[handle]` chat) are still stubbed (canned
responses per action name, run through a job-queue-stub pattern) — real
execution logic plugs in behind `lib/actionRunner.ts` without changing any
caller. The quick-action buttons, by contrast, already do real work (see
`app/api/quick-actions/route.ts`).
