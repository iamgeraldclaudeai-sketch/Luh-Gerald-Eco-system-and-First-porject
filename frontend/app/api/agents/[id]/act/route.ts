import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { runJob } from "@/lib/jobQueue";
import { runAgentAction } from "@/lib/actionRunner";

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
  const input = body.input;
  if (input !== undefined && (typeof input !== "object" || input === null)) {
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

    // Create the pending job entry before running anything, so it exists
    // even if the action runner throws.
    const inputJson = input !== undefined ? JSON.stringify(input) : null;
    const pendingRows = await client`
      INSERT INTO activity_log (agent_id, action, input, status, message)
      VALUES (${agent.id}, ${action}, ${inputJson}::jsonb, 'pending', ${`${agent.name} is running "${action}"…`})
      RETURNING id
    `;
    const jobId = pendingRows[0].id as number;

    const job = await runJob(() => runAgentAction(action, input));
    const result = job.status === "completed" ? job.result! : `Action failed: ${job.error}`;
    const message = `${agent.name} ran "${action}": ${result}`;

    const logRows = await client`
      UPDATE activity_log
      SET status = ${job.status}, result = ${JSON.stringify({ text: result })}::jsonb, message = ${message}
      WHERE id = ${jobId}
      RETURNING id, message, created_at
    `;

    return NextResponse.json({ jobId, result, log: logRows[0] });
  } catch (err) {
    console.error("POST /api/agents/[id]/act error", err);
    return NextResponse.json(
      { error: "Could not run action. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
