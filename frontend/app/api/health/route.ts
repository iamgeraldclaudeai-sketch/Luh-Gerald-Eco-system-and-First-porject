import { NextResponse } from "next/server";
import { checkDatabase, checkSessionSecret } from "@/lib/health";

// Intentionally public — no session guard. Uptime monitors and load
// balancers hitting this endpoint won't have a session cookie, and that's
// the norm for health checks.
export async function GET() {
  const [database, sessionSecret] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkSessionSecret()),
  ]);

  const checks = { database, sessionSecret };
  const healthy = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
