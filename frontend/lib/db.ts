import { neon } from "@neondatabase/serverless";

function connectionString(): string {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "No database connection string found. Set POSTGRES_URL (or DATABASE_URL) — see DEPLOYMENT.md."
    );
  }
  return url;
}

let ready: Promise<void> | null = null;

export function sql() {
  return neon(connectionString());
}

export async function ensureSchema() {
  if (!ready) {
    const client = sql();
    ready = (async () => {
      await client`
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
      await client`
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await client`
        CREATE TABLE IF NOT EXISTS agents (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          icon TEXT NOT NULL DEFAULT '🤖',
          status TEXT NOT NULL DEFAULT 'idle',
          last_synced_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await client`ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ`;
      await client`
        CREATE TABLE IF NOT EXISTS activity_log (
          id SERIAL PRIMARY KEY,
          agent_id INTEGER REFERENCES agents(id),
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await client`
        CREATE TABLE IF NOT EXISTS module_items (
          id SERIAL PRIMARY KEY,
          module TEXT NOT NULL,
          title TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          amount_cents INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  await ready;
}
