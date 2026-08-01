// Seeds sample users and sample Marketing Suite posts for local development / demos.
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
