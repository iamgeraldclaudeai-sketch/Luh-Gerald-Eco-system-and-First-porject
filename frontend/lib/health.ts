import { sql } from "./db";

export interface HealthCheckResult {
  ok: boolean;
  error?: string;
}

export function checkSessionSecret(): HealthCheckResult {
  return { ok: Boolean(process.env.SESSION_SECRET) };
}

export async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    const client = sql();
    await client`SELECT 1`;
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}
