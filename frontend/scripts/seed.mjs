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
  { name: "Atlas", role: "Operations coordinator — monitors workflows and flags blockers.", icon: "🛰️" },
  { name: "Nova", role: "Marketing analyst — drafts campaign ideas and summarizes trends.", icon: "✨" },
];

const sampleModuleItems = {
  "content-studio": [
    { title: "Script: \"Day in the life\" vlog", status: "draft" },
    { title: "Thumbnail set for launch week", status: "editing" },
    { title: "Podcast episode 12 rough cut", status: "editing" },
    { title: "Weekly newsletter draft", status: "scheduled" },
    { title: "Highlight reel — Q2 recap", status: "published" },
  ],
  "dev-bay": [
    { title: "Migrate auth to server-side sessions", status: "done" },
    { title: "Build agent action runner", status: "in_progress" },
    { title: "Wire module dashboards to Postgres", status: "in_progress" },
    { title: "Set up CI for frontend build", status: "todo" },
    { title: "Add rate limiting to auth routes", status: "todo" },
  ],
  "operations-hub": [
    { title: "Weekly ops sync workflow", status: "active" },
    { title: "Content approval pipeline", status: "active" },
    { title: "Vendor invoice tracking", status: "paused" },
    { title: "Onboarding checklist automation", status: "active" },
    { title: "Incident response runbook", status: "blocked" },
  ],
  "finance-office": [
    { title: "Merch sales — June", status: "revenue", amount_cents: 250000 },
    { title: "Brand sponsorship", status: "revenue", amount_cents: 500000 },
    { title: "Server + hosting costs", status: "expense", amount_cents: 8000 },
    { title: "Editing software subscriptions", status: "expense", amount_cents: 4500 },
    { title: "Ad spend — launch campaign", status: "expense", amount_cents: 60000 },
  ],
  "research-lab": [
    { title: "Short-form video retention study", status: "published" },
    { title: "Competitor pricing scan", status: "researching" },
    { title: "Audience survey — Q3", status: "researching" },
    { title: "New platform trend watch", status: "idea" },
    { title: "Merch drop timing experiment", status: "idea" },
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
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '🤖',
      status TEXT NOT NULL DEFAULT 'idle',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER REFERENCES agents(id),
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS module_items (
      id SERIAL PRIMARY KEY,
      module TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      amount_cents INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

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
    const existing = await sql`SELECT id FROM agents WHERE name = ${a.name}`;
    if (existing.length > 0) {
      console.log(`  - ${a.name} already exists, skipping`);
      continue;
    }
    await sql`
      INSERT INTO agents (name, role, icon, status)
      VALUES (${a.name}, ${a.role}, ${a.icon}, 'idle')
    `;
    console.log(`  - created agent ${a.name}`);
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
        INSERT INTO module_items (module, title, status, amount_cents)
        VALUES (${moduleSlug}, ${item.title}, ${item.status}, ${item.amount_cents ?? null})
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
