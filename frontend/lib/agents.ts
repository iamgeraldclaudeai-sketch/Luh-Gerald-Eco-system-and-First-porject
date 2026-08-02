import { sql, ensureSchema } from "./db";

export interface Agent {
  id: number;
  handle: string | null;
  name: string;
  role: string;
  persona: string | null;
  capabilities: string[];
  icon: string;
  status: string;
}

export interface ActivityLogEntry {
  id: number;
  message: string;
  created_at: string;
}

const AGENT_FIELDS = "id, handle, name, role, persona, capabilities, icon, status";

function normalizeAgent(row: Record<string, unknown>): Agent {
  return {
    id: row.id as number,
    handle: (row.handle as string | null) ?? null,
    name: row.name as string,
    role: row.role as string,
    persona: (row.persona as string | null) ?? null,
    capabilities: Array.isArray(row.capabilities) ? (row.capabilities as string[]) : [],
    icon: row.icon as string,
    status: row.status as string,
  };
}

export async function getAgents(): Promise<Agent[] | null> {
  try {
    await ensureSchema();
    const client = sql();
    const rows = await client`
      SELECT ${client.unsafe(AGENT_FIELDS)} FROM agents ORDER BY id ASC
    `;
    return rows.map(normalizeAgent);
  } catch (err) {
    console.error("getAgents failed", err);
    return null;
  }
}

export async function getAgentByHandle(handle: string): Promise<Agent | null> {
  try {
    await ensureSchema();
    const client = sql();
    const rows = await client`
      SELECT ${client.unsafe(AGENT_FIELDS)} FROM agents WHERE handle = ${handle}
    `;
    return rows.length > 0 ? normalizeAgent(rows[0]) : null;
  } catch (err) {
    console.error(`getAgentByHandle(${handle}) failed`, err);
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

export async function getAgentActivity(agentId: number, limit = 20): Promise<ActivityLogEntry[] | null> {
  try {
    await ensureSchema();
    const client = sql();
    const rows = await client`
      SELECT id, message, created_at FROM activity_log
      WHERE agent_id = ${agentId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows as unknown as ActivityLogEntry[];
  } catch (err) {
    console.error(`getAgentActivity(${agentId}) failed`, err);
    return null;
  }
}
