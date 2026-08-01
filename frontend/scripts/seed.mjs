// Seeds sample users, agents, and sample module data for local development / demos.
// Run with: npm run seed  (reads POSTGRES_URL/DATABASE_URL and needs no other setup)
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing POSTGRES_URL (or DATABASE_URL). Set it in frontend/.env.local first.");
  process.exit(1);
}

const sql = neon(connectionString);

const sampleUsers = [
  { email: "demo@luhgerald.com", password: "demo1234" },
  { email: "marketing@luhgerald.com", password: "demo1234" },
  { email: "ops@luhgerald.com", password: "demo1234" },
];

const samplePosts = [
  { title: "Launch week teaser video", status: "published" },
  { title: "Behind-the-scenes: building the AI Command Center", status: "published" },
  { title: "Q3 growth recap thread", status: "scheduled" },
  { title: "Collab announcement draft", status: "draft" },
  { title: "New merch drop countdown", status: "draft" },
];

const sampleAgents = [
  {
    handle: "atlas",
    name: "Atlas",
    role: "Operations coordinator",
    persona:
      "Atlas keeps every workflow across the Eco System moving — monitoring tasks, flagging blockers, and reporting status before small problems become big ones.",
    icon: "🛰️",
    capabilities: ["run_diagnostics", "sync_agents", "summarize_ops"],
  },
  {
    handle: "nova",
    name: "Nova",
    role: "Marketing analyst",
    persona:
      "Nova studies audience trends and drafts campaign ideas, turning raw engagement data into concrete next moves for the Marketing Suite.",
    icon: "✨",
    capabilities: ["suggest_campaign", "summarize_trends", "draft_post"],
  },
];

const sampleModuleItems = {
  "content-studio": [
    { title: "Script: \"Day in the life\" vlog", status: "draft", body: "Rough outline for the next vlog episode." },
    { title: "Thumbnail set for launch week", status: "editing", body: "3 thumbnail variants ready for review." },
    { title: "Podcast episode 12 rough cut", status: "editing", body: "Audio edit in progress, needs intro music." },
    { title: "Weekly newsletter draft", status: "scheduled", body: "Scheduled to send Friday morning." },
    { title: "Highlight reel — Q2 recap", status: "published", body: "Published across all channels." },
  ],
  "dev-bay": [
    { title: "Migrate auth to server-side sessions", status: "done", body: "Shipped — sessions are now httpOnly cookies." },
    { title: "Build agent action runner", status: "in_progress", body: "Stub runner in place, wiring real actions next." },
    { title: "Wire module dashboards to Postgres", status: "in_progress", body: "5 of 6 modules connected." },
    { title: "Set up CI for frontend build", status: "todo", body: "Add GitHub Actions workflow for tests + build." },
    { title: "Add rate limiting to auth routes", status: "todo", body: "Protect signup/login from abuse." },
  ],
  "operations-hub": [
    { title: "Weekly ops sync workflow", status: "active", body: "Recurring Monday sync with all departments." },
    { title: "Content approval pipeline", status: "active", body: "2-step review before anything publishes." },
    { title: "Vendor invoice tracking", status: "paused", body: "Paused pending new vendor contract." },
    { title: "Onboarding checklist automation", status: "active", body: "Auto-assigns tasks for new hires." },
    { title: "Incident response runbook", status: "blocked", body: "Blocked on legal review." },
  ],
  "finance-office": [
    { title: "Merch sales — June", status: "revenue", amount_cents: 250000, body: "Monthly merch revenue." },
    { title: "Brand sponsorship", status: "revenue", amount_cents: 500000, body: "One-time sponsorship deal." },
    { title: "Server + hosting costs", status: "expense", amount_cents: 8000, body: "Vercel + database hosting." },
    { title: "Editing software subscriptions", status: "expense", amount_cents: 4500, body: "Monthly software costs." },
    { title: "Ad spend — launch campaign", status: "expense", amount_cents: 60000, body: "Paid promotion for launch week." },
  ],
  "research-lab": [
    { title: "Short-form video retention study", status: "published", body: "Findings shared with Content Studio." },
    { title: "Competitor pricing scan", status: "researching", body: "Comparing pricing across 5 competitors." },
    { title: "Audience survey — Q3", status: "researching", body: "Collecting responses through end of quarter." },
    { title: "New platform trend watch", status: "idea", body: "Keeping an eye on emerging platforms." },
    { title: "Merch drop timing experiment", status: "idea", body: "Testing whether day-of-week affects sales." },
  ],
};

async function main() {
  console.log("Ensuring schema exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      verification_token TEXT,
      verification_token_expires TIMESTAMPTZ,
      reset_token TEXT,
      reset_token_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      handle TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      persona TEXT,
      capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
      icon TEXT NOT NULL DEFAULT '🤖',
      status TEXT NOT NULL DEFAULT 'idle',
      last_synced_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ`;
  await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS handle TEXT`;
  await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS persona TEXT`;
  await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS agents_handle_unique
    ON agents (handle)
    WHERE handle IS NOT NULL
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER REFERENCES agents(id),
      user_id INTEGER REFERENCES users(id),
      action TEXT,
      input JSONB,
      result JSONB,
      status TEXT NOT NULL DEFAULT 'completed',
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`;
  await sql`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS action TEXT`;
  await sql`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS input JSONB`;
  await sql`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS result JSONB`;
  await sql`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'`;
  await sql`
    CREATE TABLE IF NOT EXISTS module_items (
      id SERIAL PRIMARY KEY,
      module TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      amount_cents INTEGER,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE module_items ADD COLUMN IF NOT EXISTS body TEXT`;
  await sql`ALTER TABLE module_items ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb`;

  console.log("Seeding sample users (pre-verified, safe to sign in with immediately)...");
  for (const u of sampleUsers) {
    const existing = await sql`SELECT id FROM users WHERE email = ${u.email}`;
    if (existing.length > 0) {
      console.log(`  - ${u.email} already exists, skipping`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await sql`
      INSERT INTO users (email, password_hash, email_verified)
      VALUES (${u.email}, ${passwordHash}, true)
    `;
    console.log(`  - created ${u.email} (password: ${u.password})`);
  }

  console.log("Seeding sample Marketing Suite posts...");
  const existingPosts = await sql`SELECT COUNT(*)::int AS count FROM posts`;
  if (existingPosts[0].count > 0) {
    console.log(`  - posts table already has ${existingPosts[0].count} row(s), skipping`);
  } else {
    for (const p of samplePosts) {
      await sql`INSERT INTO posts (title, status) VALUES (${p.title}, ${p.status})`;
      console.log(`  - created post "${p.title}" (${p.status})`);
    }
  }

  console.log("Seeding sample agents...");
  for (const a of sampleAgents) {
    const capabilitiesJson = JSON.stringify(a.capabilities);
    const existing = await sql`SELECT id FROM agents WHERE name = ${a.name}`;
    if (existing.length > 0) {
      await sql`
        UPDATE agents
        SET handle = ${a.handle}, persona = ${a.persona}, capabilities = ${capabilitiesJson}::jsonb
        WHERE id = ${existing[0].id}
      `;
      console.log(`  - ${a.name} already exists, backfilled handle/persona/capabilities`);
      continue;
    }
    await sql`
      INSERT INTO agents (handle, name, role, persona, capabilities, icon, status)
      VALUES (${a.handle}, ${a.name}, ${a.role}, ${a.persona}, ${capabilitiesJson}::jsonb, ${a.icon}, 'idle')
    `;
    console.log(`  - created agent ${a.name} (@${a.handle})`);
  }

  console.log("Seeding sample module data...");
  for (const [moduleSlug, items] of Object.entries(sampleModuleItems)) {
    const existing = await sql`
      SELECT COUNT(*)::int AS count FROM module_items WHERE module = ${moduleSlug}
    `;
    if (existing[0].count > 0) {
      console.log(`  - ${moduleSlug} already has ${existing[0].count} row(s), skipping`);
      continue;
    }
    for (const item of items) {
      await sql`
        INSERT INTO module_items (module, title, body, status, amount_cents)
        VALUES (${moduleSlug}, ${item.title}, ${item.body ?? null}, ${item.status}, ${item.amount_cents ?? null})
      `;
    }
    console.log(`  - seeded ${items.length} row(s) for ${moduleSlug}`);
  }

  console.log("\nDone. Sample logins:");
  for (const u of sampleUsers) {
    console.log(`  ${u.email} / ${u.password}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
