import { sql, ensureSchema } from "./db";

export interface Agent {
  id: number;
  name: string;
  role: string;
  icon: string;
  status: string;
}

export interface ActivityLogEntry {
  id: number;
  message: string;
  created_at: string;
}

export async function getAgents(): Promise<Agent[] | null> {
  try {
    await ensureSchema();
    const client = sql();
    const rows = await client`
      SELECT id, name, role, icon, status FROM agents ORDER BY id ASC
    `;
    return rows as unknown as Agent[];
  } catch (err) {
    console.error("getAgents failed", err);
    return null;
  }
}

export async function getRecentActivity(limit = 8): Promise<ActivityLogEntry[] | null> {
  try {
    await ensureSchema();
    const client = sql();
    const rows = await client`
      SELECT id, message, created_at FROM activity_log
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows as unknown as ActivityLogEntry[];
  } catch (err) {
    console.error("getRecentActivity failed", err);
    return null;
  }
}
