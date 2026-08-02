# System Map — Luh Gerald Eco System

Read-only audit. Nothing in this document was fixed — it's a snapshot of what
exists and what's missing, as of branch `claude/ecosystem-module-setup-h9dai2`
(PR #5, open, unmerged) on top of `main` (PRs #1–#4, merged).

## 1. Quick orientation

**Stack**: Next.js (App Router) + TypeScript + Tailwind, Postgres via Neon
serverless driver, deployed to Vercel.

**Route groups**:
- `(auth)`: `/login`, `/signup`, `/forgot-password`, `/reset-password`
- `(dashboard)` (behind client-side `RequireAuth`): `/`, `/dashboard`,
  `/agents/[handle]`, and the 6 module pages (`marketing-suite`,
  `content-studio`, `dev-bay`, `operations-hub`, `finance-office`,
  `research-lab`) — plus redirects from `/marketing`, `/content`, `/dev`,
  `/ops`, `/finance`, `/research`

**API routes**: `app/api/auth/*` (signup, login, logout, session, verify,
request-password-reset, reset-password), `app/api/agents/*` (list, detail,
act), `app/api/quick-actions`

**Tables**: `users`, `posts`, `agents`, `activity_log`, `module_items`

---

## 2. API route audit — auth & error handling

Every route was read directly (not inferred). Table below: ✅ = has what it
needs for its purpose, ⚠️ = flagged.

| Route | Method | Auth check | Error handling | Note |
|---|---|---|---|---|
| `api/auth/signup` | POST | N/A (public by design) | ✅ try/catch, specific 400/409/500 | — |
| `api/auth/login` | POST | N/A (public by design) | ✅ | — |
| `api/auth/logout` | POST | N/A (public by design) | ✅ (nothing to fail) | — |
| `api/auth/session` | GET | N/A (public by design — this *is* the check) | ✅ | — |
| `api/auth/verify` | GET | N/A (public by design, token-gated) | ✅ redirects with `verified=0/1` either way | — |
| `api/auth/request-password-reset` | POST | N/A (public by design) | ✅ generic message either way (no enumeration) | — |
| `api/auth/reset-password` | POST | N/A (token-gated, not session-gated — correct) | ✅ | — |
| `api/agents` | GET | ⚠️ **none** | ✅ try/catch | Read-only, low sensitivity, but reachable by anyone |
| `api/agents/[id]` | GET | ⚠️ **none** | ✅ try/catch, 400/404/500 | Same |
| `api/agents/[id]/act` | POST | ⚠️ **none** | ✅ try/catch, validates body shape | **Mutates `activity_log`** with no session check |
| `api/quick-actions` | POST | ⚠️ **none** | ✅ try/catch | **Mutates `module_items` (`new_task`) and `agents` (`sync_agents`) with no session check** |

### The real finding

`GET /api/agents`, `GET /api/agents/[id]`, `POST /api/agents/[id]/act`, and
`POST /api/quick-actions` do **not** verify the session cookie. The only
thing currently gating these is `components/RequireAuth.tsx`, a **client**
component that redirects unauthenticated *page* loads — it does nothing to
protect the API routes themselves. Anyone who can reach the deployed URL can
call these endpoints directly (`curl`, no cookie) and:
- enumerate agent names/roles/capabilities (low sensitivity)
- insert new `module_items` rows via `new_task` (spam)
- overwrite every agent's `last_synced_at` via `sync_agents`
- run agent actions and write arbitrary `activity_log` entries

None of this touches user accounts or payment data, so the blast radius is
"someone can spam your ops feed," not "someone can steal accounts" — but
it's still a real gap between intent (RequireAuth exists, clearly meant to
gate the app) and enforcement (only applied client-side).

**Not flagged, by design**: the 7 `api/auth/*` routes are correctly public —
that's their entire purpose.

---

## 3. Seed data vs. schema diff

Compared `scripts/seed.mjs` INSERT/UPDATE statements column-by-column
against `lib/db.ts`'s `CREATE TABLE` / `ALTER TABLE` definitions.

| Table | Schema columns | Seeded columns | Verdict |
|---|---|---|---|
| `users` | id, email, password_hash, email_verified, verification_token, verification_token_expires, reset_token, reset_token_expires, created_at | email, password_hash, email_verified | ✅ Clean. Token columns are nullable and correctly left NULL at seed time. |
| `posts` | id, title, status, created_at | title, status | ✅ Clean, exact match. |
| `agents` | id, handle, name, role, persona, capabilities, icon, status, last_synced_at, created_at | handle, name, role, persona, capabilities, icon, status | ✅ Clean. `last_synced_at` intentionally left NULL (only ever set by the `sync_agents` quick action). |
| `activity_log` | id, agent_id, **user_id**, action, input, result, status, message, created_at | *(never seeded — this table only grows from app usage, not sample data — expected)* | ⚠️ See below re: `user_id` |
| `module_items` | id, module, title, body, status, amount_cents, **metadata**, created_at | module, title, body, status, amount_cents | ⚠️ `metadata` never populated (see below) |

### Flags

1. **`activity_log.user_id` is schema-only — nothing in the app ever writes
   it.** Grepped every `INSERT INTO activity_log` in the codebase
   (`app/api/agents/[id]/act/route.ts`, `app/api/quick-actions/route.ts`):
   both only set `agent_id`, `action`/`message`, etc. `user_id` defaults to
   NULL on every row, forever, until something is changed. The column exists
   because the original spec asked for it, but no write path was ever wired
   to the current session's user. Not a seed-script bug — a genuine gap
   between schema and usage.
2. **`module_items.metadata` is schema-only.** Same situation:
   `lib/moduleItems.ts` selects it, `scripts/seed.mjs`'s INSERT never sets
   it, so it's always the column default (`'{}'::jsonb`) on every row that
   exists today.
3. **Architectural inconsistency, not a bug**: Marketing Suite is the odd
   one out — it reads from a dedicated `posts` table
   (`app/(dashboard)/marketing-suite/page.tsx:19`), while the other 5
   modules share the generic `module_items` table. Both are seeded
   correctly for their own schema, but it means there are two parallel
   "content item" concepts in the database. Worth a deliberate decision
   later (unify onto `module_items`, or leave `posts` as Marketing's own
   table permanently) — flagging so it doesn't look like an oversight.

---

## 4. Hardcoded secrets / credentials scan

Grepped the full tracked tree for connection-string patterns
(`postgresql://`, `postgres://`, Neon's `npg_` password prefix), AWS-style
keys, PEM blocks, and `key`/`secret`/`password` literal assignments.

- **`frontend/.env.example`** — all 4 variables (`POSTGRES_URL`,
  `SESSION_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`) are empty
  placeholders with comments. Clean.
- **`.gitignore`** — correctly excludes `.env*.local`; confirmed via
  `git ls-files` that the only tracked `.env*` file in the repo is
  `.env.example`. No `.env.local` was ever committed.
- **Production `DATABASE_URL` pasted into an earlier chat in this
  session** — searched full git history (`git log --all -p -S`) for a
  distinguishing fragment of that string. **Not found anywhere in the
  repo.** It was used only as a one-off inline shell env var for a single
  `npm run seed` invocation and never written to disk in this project. Clean.
- **`frontend/lib/session.test.ts` lines 6 and 22** — contain the literal
  strings `"test-secret-for-vitest-only"` and `"a-different-secret"`. These
  are dummy values for unit tests, clearly named as such, not real secrets.
  No action needed.
- ⚠️ **`frontend/scripts/seed.mjs` lines 15–17** — three demo accounts with
  a hardcoded, shared password: `demo1234`
  (`demo@luhgerald.com`, `marketing@luhgerald.com`, `ops@luhgerald.com`).
  This is intentional and already documented in `DEPLOYMENT.md`/READMEs as
  "sample login credentials," so it's not an accidental leak — **but**: this
  seed script has already been run against the **live production database**
  once (via the manual GitHub Action, confirmed by that workflow's run
  history — see §5). That means as of today, the production database likely
  has 3 real, working accounts whose password (`demo1234`) is sitting in
  public source control. Worth a conscious decision: either accept it (fine
  for a personal/demo project) or rotate those 3 accounts' passwords and
  stop seeding demo users into production going forward.

No other secret-shaped strings found anywhere in tracked files.

---

## 5. CI workflow review

Both workflow files were read directly and cross-checked against **actual
run history** via the GitHub API (not just static review of the YAML).

### `.github/workflows/test.yml`
```yaml
on:
  push:
    branches: [main]
  pull_request:
```
- Triggers on push to `main` and on every pull request (any base branch) —
  correct, no misconfiguration.
- `working-directory: frontend` is set via `defaults.run` — correct, since
  the app lives in the `frontend/` subdirectory.
- Steps: checkout → setup-node@22 → `npm install` → `npm test` → `npm run build`.
- **No secrets required** — by design, since the unit tests are pure-logic
  (session tokens, job queue, action runner, design tokens) and
  `npm run build` never executes route handlers, so a missing `DATABASE_URL`
  at build time is a non-issue (every DB-touching page has
  `export const dynamic = "force-dynamic"` and wraps its queries in
  try/catch — confirmed present on all 6 module pages, `/`, `/dashboard`,
  and `/agents/[handle]`).
- **Verified via actual run**: workflow run `30718334579` (triggered by PR
  #5's `pull_request` event) — **status: completed, conclusion: success**.
  This isn't theoretical; it actually ran green in GitHub's infrastructure.

### `.github/workflows/seed.yml`
```yaml
on:
  workflow_dispatch:
```
- Manual-only trigger, as intended (no risk of accidentally reseeding
  production on every push).
- Needs the `DATABASE_URL` repository secret.
- **Verified via actual run**: workflow run `30714425137` (manual dispatch
  on `main`, 2026-08-01T19:16:58Z) — **status: completed, conclusion:
  success**. This confirms the `DATABASE_URL` secret is in fact configured
  correctly in this repo's GitHub Actions settings (a workflow can't
  succeed against a real database without it) — not just "should be set
  per the docs," but actually confirmed working.

**No misconfigurations found in either file.** Both are syntactically
correct and both have a real, successful run in their history.

---

## 6. Mobile responsiveness — the 6 module pages

All 6 module pages are thin wrappers: 5 of them
(`content-studio`, `dev-bay`, `operations-hub`, `finance-office`,
`research-lab`) render `ModuleScreen` + `ModuleItemsList` with zero
page-specific layout; `marketing-suite` has its own near-identical inline
list markup instead of using `ModuleItemsList`. So responsiveness is
really a question about 3 shared pieces:

- **`Sidebar.tsx`**: explicitly responsive —
  `flex gap-2 overflow-x-auto ... md:w-56 md:shrink-0 md:flex-col
  md:overflow-visible` — horizontal scrolling pill row on mobile, fixed
  left column on `md:`+. ✅ Correct.
- **`Header.tsx`**: uses `hidden ... sm:flex` / `hidden ... sm:inline` to
  hide the "All systems online" pill and the user's email on narrow
  screens, keeping only the brand and logout button visible. ✅ Correct,
  intentional mobile simplification.
- **`ModuleScreen.tsx` line 29**: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`
  for the 4 placeholder widget cards — single column on mobile, 2 at `sm:`,
  4 at `lg:`. ✅ Correct.

### ⚠️ The one real gap

**`components/ModuleItemsList.tsx` line 47** (and the identical pattern in
**`app/(dashboard)/marketing-suite/page.tsx` line 59**):
```tsx
<div className="flex items-center justify-between">
  <span className="text-gray-200">{item.title}</span>
  <span className="flex items-center gap-3">...amount/status...</span>
</div>
```
No `flex-wrap`, no `min-w-0`/`truncate` on the title `<span>`. On a narrow
viewport, a long title (several seed rows are 25–35 characters, e.g.
"Editing software subscriptions") sitting next to a status badge (and, on
Finance Office, also a formatted dollar amount) has no fallback — the row
either overflows horizontally or the badge gets visually cramped. This
exact pattern is shared by all 6 module pages' list rows since 5 of them
share `ModuleItemsList` and the 6th (Marketing Suite) duplicates it
verbatim. Everything else reviewed (hero section, widget grid, Sidebar,
Header) is genuinely responsive.

---

## 7. Vercel deployment status

**Could not determine with confidence from tools available in this
session.** What I checked and what it did/didn't show:

- `mcp__github__get_commit` on `main`'s HEAD returns commit metadata only —
  no check-runs, statuses, or deployment info in the response, so if Vercel
  posts a GitHub commit status/check for this repo, it isn't surfaced by
  this tool.
- No Vercel-specific MCP tool is available in this session — I have no
  direct read access to the Vercel dashboard, deployment list, or build
  logs.
- GitHub Actions history (§5) confirms CI is green, but **CI passing and a
  Vercel deploy succeeding are two independent things** — Vercel has its own
  build step (with its own env vars) that isn't run by either GitHub
  workflow in this repo.
- The `DATABASE_URL` GitHub Actions secret being valid (confirmed in §5)
  says nothing about whether Vercel's **own** environment variables
  (`DATABASE_URL`/`POSTGRES_URL`, `SESSION_SECRET`, optionally
  `RESEND_API_KEY`) are set — these are two separate credential stores per
  `DEPLOYMENT.md`.

**Recommendation**: check the Vercel dashboard directly (Deployments tab)
for the actual status of the latest `main` deploy — that's not something
this audit could verify from the repo alone.

---

## 8. What's incomplete — roadmap with effort estimates

Effort key: **S** = under an hour of focused work, **M** = a few hours,
possibly its own PR, **L** = a substantial feature, likely multiple PRs or
a design decision first.

| Item | Why it matters | Effort |
|---|---|---|
| Add session checks to `api/agents/*` and `api/quick-actions` | Currently unauthenticated (§2) — anyone with the URL can mutate data | **M** — needs a shared "require session" helper for route handlers (mirrors `RequireAuth` but server-side), then apply to 4 routes |
| Rotate the 3 seeded demo account passwords / stop seeding them into production | `demo1234` is public and already live on prod (§4) | **S** |
| Wire `activity_log.user_id` to the actual signed-in user | Column exists, nothing populates it (§3) — no real audit trail of *who* triggered an action | **S** — read the session cookie server-side at each insert site, 2 call sites |
| Populate or remove `module_items.metadata` | Dead column right now (§3) | **S** (decide what it's for) → **M** (build the feature that uses it) |
| Decide: unify `posts` into `module_items`, or keep them separate permanently | Two parallel schemas for conceptually the same "content item" idea (§3) | **M** — mostly a migration + one page rewrite (`marketing-suite`) |
| Fix the mobile list-row overflow risk (`ModuleItemsList` + Marketing Suite) | One `flex-wrap`/`truncate` fix, but touches the pattern in 2 files | **S** |
| Rate limiting on `api/auth/*` | Already flagged as a to-do inside the seed data itself (`dev-bay` sample: "Add rate limiting to auth routes") — signup/login are open to brute-force/spam right now | **M** |
| Replace the stubbed action runner (`lib/actionRunner.ts`) with real execution | Every agent action and quick action returns a canned string today — this is the single biggest gap between "looks alive" and "is alive" | **L** — needs a real integration target (what should "suggest_campaign" actually call?), plus the job-queue-stub becoming a real async queue if actions get slow |
| Confirm actual Vercel deployment health | Unknown from this audit (§7) | **S** to check, **unknown** if something's actually broken |
| Real email delivery end-to-end test | `RESEND_API_KEY` presence/absence was never confirmed against a live send — console-log fallback is verified, real delivery isn't | **S** to test once a key exists |
| Broader test coverage | Current 11 tests are all pure-logic (`lib/`); no integration tests hit an actual (or mocked) database, and no route handler has a test | **L** — would need a test database or extensive mocking of the Neon client |

---

*Generated as a read-only audit. No application code, schema, or CI config
was modified in the process of writing this document.*
