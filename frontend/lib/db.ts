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
    })();
  }
  await ready;
}
