import { sql } from "./db";

const MAX_ACTIONS_PER_WINDOW = 5;
const WINDOW_SECONDS = 60;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

type SqlClient = ReturnType<typeof sql>;

// Reuses activity_log itself as the rate-limit counter — every agent action
// is already timestamped there, so no new table or external service (e.g.
// Redis) is needed for a basic per-agent cap.
export async function checkAgentActionRateLimit(
  client: SqlClient,
  agentId: number
): Promise<RateLimitResult> {
  const rows = await client`
    SELECT COUNT(*)::int AS count FROM activity_log
    WHERE agent_id = ${agentId}
      AND created_at > now() - make_interval(secs => ${WINDOW_SECONDS})
  `;
  const count = rows[0].count as number;

  if (count >= MAX_ACTIONS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: WINDOW_SECONDS };
  }
  return { allowed: true };
}
