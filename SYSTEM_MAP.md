# SYSTEM_MAP.md

_Generated from a live audit of the `main` branch (merged code only) on 2026-08-01. PR #5 ("Design tokens, extended schema, agent detail pages, Header/Sidebar, quick actions, and CI") is still open/unmerged — everything in it is described separately at the bottom, not counted as "exists" below._

## 1. What Exists (merged, live on main)

### Pages (frontend/app, Next.js App Router)
- `(auth)` group: `/login`, `/signup`, `/forgot-password`, `/reset-password`
- `(dashboard)` group: `/` (Command Center home), `/marketing-suite`, `/content-studio`, `/dev-bay`, `/finance-office`, `/operations-hub`, `/research-lab`
- No `/dashboard` route yet, no `/agents/[handle]` pages yet (both are in unmerged PR #5)

### API routes
- Auth: `login`, `logout`, `signup`, `verify`, `request-password-reset`, `reset-password`, `session`
- Agents: `GET /api/agents`, `GET /api/agents/[id]`, `POST /api/agents/[id]/act`
- No quick-actions API route yet (in PR #5)

### Components
- `DashboardHome.tsx`, `Nav.tsx` (old single navbar — not yet replaced), `AgentCard.tsx`, `AgentActionModal.tsx`, `ModuleScreen.tsx`, `ModuleItemsList.tsx`, `RequireAuth.tsx`, `PageTransition.tsx`
- No `Header.tsx`/`Sidebar.tsx`, `ActivityLog.tsx`, or `Skeleton.tsx` yet (in PR #5)

### Lib / business logic
- `db.ts` (Neon Postgres client), `auth.tsx`, `authConfig.ts`, `session.ts` (+ test), `email.ts` (Resend, console-log fallback), `agents.ts`, `moduleItems.ts`, `modules.ts`, `colors.ts`, `tokens.ts` (+ test)
- No `cn.ts`, `jobQueue.ts`, or `actionRunner.ts` yet (in PR #5)

### Database (Neon Postgres, via `db.ts` + `scripts/seed.mjs`)
- `users` — email, password_hash (bcrypt), email_verified, created_at
- `agents` — 2 seeded rows (Atlas, Nova); `handle`/`persona`/`capabilities` columns are added in PR #5, not on main yet
- `activity_log` — logs agent actions
- `module_items` — backs all 6 department pages via one shared table + `ModuleItemsList` component

### Auth flow
- Signup → bcrypt hash → row in `users` → verification email (Resend if `RESEND_API_KEY` set, else logged to server console) → httpOnly signed session cookie
- Login → session cookie issued
- Forgot/reset password → time-limited token flow, generic response (no email enumeration)
- Unverified accounts can still sign in (reminder banner, not blocked)

### Deployed integrations
- Vercel (Production deployments tracked, `vercel.json` present)
- Neon Postgres (connected via `DATABASE_URL`)
- Resend (optional, for real email — falls back to console log if unset)
- GitHub Action: `.github/workflows/seed.yml` — manual workflow to seed prod DB via secret

### Root-level department folders
`marketing-suite/`, `content-studio/`, `dev-bay/`, `finance-office/`, `operations-hub/`, `research-lab/` at the **repo root** — each contains only a `README.md`. These are leftover scaffold folders from before the real frontend existed. **The actual live pages are inside `frontend/app/(dashboard)/<name>/page.tsx`, a separate and unrelated set of folders with the same names.** This duplication is confusing and worth cleaning up (see roadmap).

## 2. What's Incomplete
- **PR #5 is fully built but not merged** — Header/Sidebar, design tokens applied to UI, `/agents/[handle]` pages, quick-action buttons wired to real DB writes, `/dashboard` route + short-URL redirects, skeleton loaders, CI test workflow. None of this is live on main yet. Effort to merge: none really — it's built, just needs review + merge (S).
- Agent actions are still using a stubbed/canned action runner on main (real logic behind `/api/agents/[id]/act` is a placeholder) — even after PR #5 merges, the job-queue pattern still returns stubbed results, not real agent work (M-L to build real actions).
- Root-level department folders (`marketing-suite/README.md` etc.) are dead scaffold — either delete them or repurpose them; currently pure clutter (S).
- No dedicated `/dashboard` route on main — home page is at `/` only until PR #5 merges (S, comes free with PR #5).

## 3. What's Broken
- Nothing currently throws based on the merged code and passing CI — PR #1 through #4 all report clean builds and passing tests in their PR descriptions.
- Real risk area not yet verified: no live-database screenshot/click-through has been done against production (every PR flags this as an open checkbox). Recommend a manual login → dashboard → module click-through before trusting the deployed app fully (S, just needs doing).

## 4. Architecture Notes
- Server components fetch data (module items, agents) directly from Postgres via `lib/db.ts`; client components (`RequireAuth`, modals, forms) handle interactivity.
- Session is a signed httpOnly cookie, not JWT-in-localStorage — reasonably solid pattern.
- All 6 department pages share one generic `module_items` table + `ModuleItemsList`/`ModuleScreen` components rather than having separate schemas per department — good for consistency, but means departments aren't differentiated by data model yet, only by seeded content and color.
- Two AI agents (Atlas, Nova) exist as DB rows with a stubbed action runner — the "AI agents doing real work" piece is the least-built part of the whole system.
- Vercel + Neon + optional Resend is the full external stack; no other services connected.

---

## Roadmap (4 phases)

**Phase 1 — Foundation**
- Merge PR #5 (it's done, just needs review/merge)
- Manual click-through of the live deployed app with real DB
- Delete or repurpose the dead root-level department README folders
- Confirm all env vars (`DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`) are correctly set in Vercel

**Phase 2 — Command Center**
- Confirm the 4 quick-action buttons (Run diagnostics, Broadcast update, New task, Sync agents) work against real data post-merge
- Verify agent cards → action modal → activity log round-trip works end to end in production

**Phase 3 — One real workflow**
- Pick one department (Marketing Suite is the most built-out already) and give it real functionality beyond generic `module_items` — actual content creation, editing, or a real integration, not just a list view

**Phase 4 — Automation/agents**
- Only after Phase 3 works manually: replace the stubbed action runner behind `/api/agents/[id]/act` with real agent logic for Atlas/Nova

*(Ask Gerald for approval before starting any of these phases — this map is read-only reporting, no code was changed.)*
