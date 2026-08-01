import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "./requireSession";
import { createSessionToken, SESSION_COOKIE } from "./session";

function requestWithCookie(cookieHeader?: string): NextRequest {
  const headers = cookieHeader ? { cookie: cookieHeader } : undefined;
  return new NextRequest("http://localhost/api/test", { headers });
}

describe("requireSession", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "test-secret-for-vitest-only";
  });

  it("rejects a request with no session cookie", async () => {
    const result = await requireSession(requestWithCookie());
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it("rejects a request with a garbage session cookie", async () => {
    const result = await requireSession(requestWithCookie(`${SESSION_COOKIE}=not-a-real-token`));
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it("rejects a request with a session cookie signed by a different secret", async () => {
    const token = await createSessionToken({ email: "demo@example.com", emailVerified: true });
    process.env.SESSION_SECRET = "a-different-secret";
    const result = await requireSession(requestWithCookie(`${SESSION_COOKIE}=${token}`));
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it("accepts a request with a valid session cookie and returns the payload", async () => {
    const token = await createSessionToken({ email: "demo@example.com", emailVerified: true });
    const result = await requireSession(requestWithCookie(`${SESSION_COOKIE}=${token}`));
    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ email: "demo@example.com", emailVerified: true });
  });
});
