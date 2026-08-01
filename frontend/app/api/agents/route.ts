import { NextRequest, NextResponse } from "next/server";
import { getAgents } from "@/lib/agents";
import { requireSession } from "@/lib/requireSession";

export async function GET(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const agents = await getAgents();
  if (agents === null) {
    return NextResponse.json(
      { error: "Could not load agents. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
  return NextResponse.json({ agents });
}
