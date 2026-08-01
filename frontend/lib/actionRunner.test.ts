import { describe, expect, it } from "vitest";
import { runAgentAction } from "./actionRunner";

describe("runAgentAction", () => {
  it("returns the canned response for a known action", async () => {
    const result = await runAgentAction("run_diagnostics", {});
    expect(result).toBe("All systems nominal. No anomalies detected.");
  });

  it("returns a generic acknowledgement for an unknown action", async () => {
    const result = await runAgentAction("do_something_novel", {});
    expect(result).toContain('do_something_novel');
    expect(result).toContain("Stub runner");
  });
});
