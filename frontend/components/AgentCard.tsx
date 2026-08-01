"use client";

import Link from "next/link";
import { Agent } from "@/lib/agents";

export default function AgentCard({
  agent,
  onRunAction,
  animationDelayMs = 0,
}: {
  agent: Agent;
  onRunAction: (agent: Agent) => void;
  animationDelayMs?: number;
}) {
  return (
    <div
      className="glass-panel glow-border animate-fade-in-up rounded-xl border border-purple-500/30 p-4 transition-transform hover:-translate-y-0.5"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="text-2xl">{agent.icon}</div>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-400">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {agent.status}
        </span>
      </div>
      <h3 className="mt-3 font-semibold text-purple-300">{agent.name}</h3>
      <p className="mt-1 text-xs text-gray-500">{agent.role}</p>

      {agent.capabilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded-full border border-purple-500/30 px-2 py-0.5 text-[9px] uppercase tracking-wide text-purple-300"
            >
              {cap}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onRunAction(agent)}
          className="flex-1 rounded-lg border border-purple-500/40 py-1.5 text-xs text-purple-200 transition-colors hover:border-purple-300 hover:bg-purple-500/10"
        >
          Run action
        </button>
        {agent.handle && (
          <Link
            href={`/agents/${agent.handle}`}
            className="rounded-lg border border-primary/40 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/10"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}
