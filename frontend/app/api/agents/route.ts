import { NextResponse } from "next/server";
import { getAgents } from "@/lib/agents";

export async function GET() {
  const agents = await getAgents();
  if (agents === null) {
    return NextResponse.json(
      { error: "Could not load agents. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
  return NextResponse.json({ agents });
}
