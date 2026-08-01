import { beforeEach, describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

describe("session tokens", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "test-secret-for-vitest-only";
  });

  it("round-trips a valid payload", async () => {
    const token = await createSessionToken({ email: "demo@example.com", emailVerified: true });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ email: "demo@example.com", emailVerified: true });
  });

  it("returns null for a garbage token", async () => {
    const payload = await verifySessionToken("not-a-real-token");
    expect(payload).toBeNull();
  });

  it("returns null when the token was signed with a different secret", async () => {
    const token = await createSessionToken({ email: "demo@example.com", emailVerified: false });
    process.env.SESSION_SECRET = "a-different-secret";
    const payload = await verifySessionToken(token);
    expect(payload).toBeNull();
  });
});
