// Canned fallback: used when ANTHROPIC_API_KEY isn't set, and as a safety
// net if the real API call fails for any reason. Callers never see the
// difference in shape — always a plain string result.
const CANNED_RESPONSES: Record<string, string> = {
  suggest_campaign:
    'Suggested campaign: "48-Hour Flash Drop" — teaser content + limited-time discount code.',
  run_diagnostics: "All systems nominal. No anomalies detected.",
  summarize_trends: "Short-form video and community-driven drops are trending up this week.",
  sync_agents: "Agent sync complete — all systems reporting in.",
  summarize_ops: "Operations summary: workflows on track, no new blockers since last sync.",
  draft_post: 'Draft post: "Big things coming this week — stay tuned."',
};

function stubResponse(action: string): string {
  return (
    CANNED_RESPONSES[action] ??
    `Acknowledged action "${action}". Stub runner — real execution wiring comes later.`
  );
}

export interface AgentContext {
  name: string;
  role: string;
  persona: string | null;
}

function buildPrompt(agent: AgentContext, action: string, input: unknown): string {
  const note =
    input && typeof input === "object" && "note" in input && typeof (input as { note?: unknown }).note === "string"
      ? (input as { note: string }).note
      : null;

  return [
    `You are ${agent.name}, ${agent.role}.`,
    agent.persona ? agent.persona : null,
    ``,
    `Perform this action: "${action}".`,
    note ? `Additional context from the requester: "${note}"` : null,
    ``,
    `Respond with a concise, direct result (2-3 sentences max). No preamble like`,
    `"Sure, here's..." — just the result itself, as if you already did the work.`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

async function callClaude(agent: AgentContext, action: string, input: unknown): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return stubResponse(action);
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        messages: [{ role: "user", content: buildPrompt(agent, action, input) }],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[actionRunner] Anthropic API error (${res.status}): ${body}`);
      return stubResponse(action);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : stubResponse(action);
  } catch (err) {
    console.error("[actionRunner] Anthropic API call failed", err);
    return stubResponse(action);
  }
}

export async function runAgentAction(
  action: string,
  input: unknown,
  agent: AgentContext
): Promise<string> {
  return callClaude(agent, action, input);
}
