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

export async function ensureUsersTable() {
  if (!ready) {
    const client = sql();
    ready = client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  await ready;
}
