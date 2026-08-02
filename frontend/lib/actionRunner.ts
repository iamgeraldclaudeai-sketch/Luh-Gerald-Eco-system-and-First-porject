// Stubbed action runner: maps known action names to canned responses. Real
// execution logic (calling out to actual tools/services) plugs in here later
// — callers don't need to change when it does.
const CANNED_RESPONSES: Record<string, string> = {
  suggest_campaign:
    'Suggested campaign: "48-Hour Flash Drop" — teaser content + limited-time discount code.',
  run_diagnostics: "All systems nominal. No anomalies detected.",
  summarize_trends: "Short-form video and community-driven drops are trending up this week.",
  sync_agents: "Agent sync complete — all systems reporting in.",
  summarize_ops: "Operations summary: workflows on track, no new blockers since last sync.",
  draft_post: 'Draft post: "Big things coming this week — stay tuned."',
};

export async function runAgentAction(action: string, input: unknown): Promise<string> {
  void input; // reserved for when real execution logic reads structured input
  return (
    CANNED_RESPONSES[action] ??
    `Acknowledged action "${action}". Stub runner — real execution wiring comes later.`
  );
}
