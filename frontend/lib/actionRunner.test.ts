import { afterEach, describe, expect, it, vi } from "vitest";
import { runAgentAction } from "./actionRunner";

const agent = { name: "Atlas", role: "Operations coordinator", persona: "Keeps things moving." };

describe("runAgentAction", () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;
  const originalFetch = global.fetch;

  afterEach(() => {
    if (originalApiKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalApiKey;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns the canned response for a known action when no API key is set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const result = await runAgentAction("run_diagnostics", {}, agent);
    expect(result).toBe("All systems nominal. No anomalies detected.");
  });

  it("returns a generic acknowledgement for an unknown action when no API key is set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const result = await runAgentAction("do_something_novel", {}, agent);
    expect(result).toContain("do_something_novel");
    expect(result).toContain("Stub runner");
  });

  it("calls the Anthropic API and returns its text when an API key is set", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ type: "text", text: "Real generated result." }] }),
    }) as unknown as typeof fetch;

    const result = await runAgentAction("run_diagnostics", {}, agent);
    expect(result).toBe("Real generated result.");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("falls back to the canned response if the Anthropic API call fails", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "internal error",
    }) as unknown as typeof fetch;

    const result = await runAgentAction("run_diagnostics", {}, agent);
    expect(result).toBe("All systems nominal. No anomalies detected.");
  });

  it("falls back to the canned response if the Anthropic API call throws", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const result = await runAgentAction("run_diagnostics", {}, agent);
    expect(result).toBe("All systems nominal. No anomalies detected.");
  });
});
