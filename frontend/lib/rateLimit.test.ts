import { describe, expect, it } from "vitest";
import { checkAgentActionRateLimit } from "./rateLimit";

// A minimal stand-in for the Neon tagged-template client: ignores the SQL
// text and just returns canned rows, which is all this pure-logic test needs.
function mockClientReturning(rows: unknown[]) {
  return (async () => rows) as unknown as Parameters<typeof checkAgentActionRateLimit>[0];
}

describe("checkAgentActionRateLimit", () => {
  it("allows the action when under the limit", async () => {
    const client = mockClientReturning([{ count: 2 }]);
    const result = await checkAgentActionRateLimit(client, 1);
    expect(result).toEqual({ allowed: true });
  });

  it("blocks the action when at or over the limit", async () => {
    const client = mockClientReturning([{ count: 5 }]);
    const result = await checkAgentActionRateLimit(client, 1);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(60);
  });
});
