import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, SessionPayload } from "./session";

const UNAUTHORIZED = () =>
  NextResponse.json({ error: "Authentication required." }, { status: 401 });

/**
 * Verifies the session cookie on an API route. Returns the session payload
 * if valid, or a ready-to-return 401 NextResponse if not — callers check
 * with `instanceof NextResponse` and return it immediately on failure.
 */
export async function requireSession(req: NextRequest): Promise<SessionPayload | NextResponse> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return UNAUTHORIZED();
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return UNAUTHORIZED();
  }

  return payload;
}
