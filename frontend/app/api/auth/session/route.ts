import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: { email: payload.email } });
}
