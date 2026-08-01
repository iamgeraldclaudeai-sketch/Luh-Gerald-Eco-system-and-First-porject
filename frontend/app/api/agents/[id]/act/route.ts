import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

// Stub action runner: maps known action names to canned responses. Real
// execution logic (calling out to actual tools/services) plugs in here later.
const STUB_RESPONSES: Record<string, string> = {
  suggest_campaign:
    'Suggested campaign: "48-Hour Flash Drop" — teaser content + limited-time discount code.',
  run_diagnostics: "All systems nominal. No anomalies detected.",
  summarize_trends: "Short-form video and community-driven drops are trending up this week.",
};

function stubResult(action: string): string {
  return (
    STUB_RESPONSES[action] ??
    `Acknowledged action "${action}". Stub runner — real execution wiring comes later.`
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agentId = Number(id);
  if (!Number.isInteger(agentId)) {
    return NextResponse.json({ error: "Invalid agent id." }, { status: 400 });
  }

  let body: { action?: string; input?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = String(body.action ?? "").trim();
  if (!action) {
    return NextResponse.json({ error: 'Field "action" is required.' }, { status: 400 });
  }
  if (body.input !== undefined && (typeof body.input !== "object" || body.input === null)) {
    return NextResponse.json({ error: '"input" must be an object if provided.' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const client = sql();

    const agentRows = await client`SELECT id, name FROM agents WHERE id = ${agentId}`;
    if (agentRows.length === 0) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }
    const agent = agentRows[0] as { id: number; name: string };

    const result = stubResult(action);
    const message = `${agent.name} ran "${action}": ${result}`;

    const logRows = await client`
      INSERT INTO activity_log (agent_id, message)
      VALUES (${agent.id}, ${message})
      RETURNING id, message, created_at
    `;

    return NextResponse.json({ result, log: logRows[0] });
  } catch (err) {
    console.error("POST /api/agents/[id]/act error", err);
    return NextResponse.json(
      { error: "Could not run action. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
