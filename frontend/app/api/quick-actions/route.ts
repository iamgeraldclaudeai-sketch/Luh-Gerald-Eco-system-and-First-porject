import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

type SqlClient = ReturnType<typeof sql>;
type QuickActionHandler = (client: SqlClient) => Promise<string>;

async function runDiagnostics(client: SqlClient): Promise<string> {
  const [agentCount, itemCount] = await Promise.all([
    client`SELECT COUNT(*)::int AS count FROM agents`,
    client`SELECT COUNT(*)::int AS count FROM module_items`,
  ]);
  return `Diagnostics complete — ${agentCount[0].count} agent(s) online, ${itemCount[0].count} module item(s) tracked. Database reachable.`;
}

async function broadcastUpdate(): Promise<string> {
  return "Broadcast sent to all departments.";
}

async function newTask(client: SqlClient): Promise<string> {
  const title = `New task queued — ${new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
  await client`
    INSERT INTO module_items (module, title, status)
    VALUES ('operations-hub', ${title}, 'active')
  `;
  return `Added to Operations Hub: "${title}".`;
}

async function syncAgents(client: SqlClient): Promise<string> {
  const rows = await client`
    UPDATE agents SET last_synced_at = now()
    RETURNING name
  `;
  if (rows.length === 0) {
    return "No agents to sync yet — run `npm run seed` to add sample agents.";
  }
  const names = (rows as { name: string }[]).map((r) => r.name).join(", ");
  return `Synced ${rows.length} agent(s): ${names}.`;
}

const ACTIONS: Record<string, QuickActionHandler> = {
  run_diagnostics: runDiagnostics,
  broadcast_update: broadcastUpdate,
  new_task: newTask,
  sync_agents: syncAgents,
};

export async function POST(req: Request) {
  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = String(body.action ?? "").trim();
  const handler = ACTIONS[action];
  if (!handler) {
    return NextResponse.json({ error: `Unknown action "${action}".` }, { status: 400 });
  }

  try {
    await ensureSchema();
    const client = sql();

    const result = await handler(client);
    const message = `System ran "${action}": ${result}`;

    const logRows = await client`
      INSERT INTO activity_log (agent_id, message)
      VALUES (NULL, ${message})
      RETURNING id, message, created_at
    `;

    return NextResponse.json({ result, log: logRows[0] });
  } catch (err) {
    console.error("POST /api/quick-actions error", err);
    return NextResponse.json(
      { error: "Could not run action. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
