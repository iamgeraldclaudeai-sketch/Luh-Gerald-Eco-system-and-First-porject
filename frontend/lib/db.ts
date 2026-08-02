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
      await client`ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ`;
      await client`ALTER TABLE agents ADD COLUMN IF NOT EXISTS handle TEXT`;
      await client`ALTER TABLE agents ADD COLUMN IF NOT EXISTS persona TEXT`;
      await client`ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities JSONB NOT NULL DEFAULT '[]'::jsonb`;
      await client`
        CREATE UNIQUE INDEX IF NOT EXISTS agents_handle_unique
        ON agents (handle)
        WHERE handle IS NOT NULL
      `;
      await client`
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
      await client`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`;
      await client`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS action TEXT`;
      await client`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS input JSONB`;
      await client`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS result JSONB`;
      await client`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'`;
      await client`
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
      await client`ALTER TABLE module_items ADD COLUMN IF NOT EXISTS body TEXT`;
      await client`ALTER TABLE module_items ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb`;
    })();
  }
  await ready;
}
