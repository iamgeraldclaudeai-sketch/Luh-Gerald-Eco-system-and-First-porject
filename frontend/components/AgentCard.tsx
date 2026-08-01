"use client";

import { Agent } from "@/lib/agents";

export default function AgentCard({
  agent,
  onRunAction,
}: {
  agent: Agent;
  onRunAction: (agent: Agent) => void;
}) {
  return (
    <div className="glow-border rounded-xl border border-purple-500/30 bg-space-900 p-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl">{agent.icon}</div>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-400">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {agent.status}
        </span>
      </div>
      <h3 className="mt-3 font-semibold text-purple-300">{agent.name}</h3>
      <p className="mt-1 text-xs text-gray-500">{agent.role}</p>
      <button
        onClick={() => onRunAction(agent)}
        className="mt-4 w-full rounded-lg border border-purple-500/40 py-1.5 text-xs text-purple-200 transition-colors hover:border-purple-300 hover:bg-purple-500/10"
      >
        Run action
      </button>
    </div>
  );
}
