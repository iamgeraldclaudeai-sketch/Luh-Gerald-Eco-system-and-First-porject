import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agentId = Number(id);
  if (!Number.isInteger(agentId)) {
    return NextResponse.json({ error: "Invalid agent id." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const client = sql();
    const rows = await client`
      SELECT id, handle, name, role, persona, capabilities, icon, status
      FROM agents WHERE id = ${agentId}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }
    return NextResponse.json({ agent: rows[0] });
  } catch (err) {
    console.error("GET /api/agents/[id] error", err);
    return NextResponse.json(
      { error: "Could not load agent. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
