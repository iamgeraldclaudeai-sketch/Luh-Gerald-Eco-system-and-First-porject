import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgentByHandle, getAgentActivity } from "@/lib/agents";
import AgentChat from "@/components/AgentChat";

export const dynamic = "force-dynamic";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const agent = await getAgentByHandle(handle);

  if (!agent) {
    notFound();
  }

  const activity = await getAgentActivity(agent.id);

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-block text-xs text-gray-500 hover:text-gray-300">
        ← Back to Command Center
      </Link>

      <section className="glass-panel glow-border rounded-2xl border border-primary/30 px-8 py-8">
        <div className="text-3xl">{agent.icon}</div>
        <h1 className="mt-3 text-2xl font-bold text-primary">{agent.name}</h1>
        <p className="mt-1 text-sm text-gray-400">{agent.role}</p>
        {agent.persona && <p className="mt-4 max-w-xl text-sm text-gray-300">{agent.persona}</p>}
        {agent.capabilities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {agent.capabilities.map((cap) => (
              <span
                key={cap}
                className="rounded-full border border-primary/40 px-3 py-1 text-[10px] uppercase tracking-wide text-primary"
              >
                {cap}
              </span>
            ))}
          </div>
        )}
      </section>

      <AgentChat agent={agent} initialActivity={activity ?? []} />
    </div>
  );
}
