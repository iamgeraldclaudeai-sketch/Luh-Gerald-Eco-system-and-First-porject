"use client";

import { useState } from "react";
import { Agent, ActivityLogEntry } from "@/lib/agents";

export default function AgentActionModal({
  agent,
  onClose,
  onResult,
}: {
  agent: Agent;
  onClose: () => void;
  onResult: (log: ActivityLogEntry) => void;
}) {
  const [action, setAction] = useState(agent.capabilities[0] ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleRun() {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/agents/${agent.id}/act`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, input: {} }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResult(data.result);
      onResult(data.log as ActivityLogEntry);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-purple-500/40 bg-space-900 p-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agent.icon}</span>
          <h2 className="font-semibold text-purple-300">{agent.name}</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">{agent.role}</p>

        <label className="mt-4 block text-xs text-gray-400">Action</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="mt-1 w-full rounded-lg border border-purple-500/30 bg-space-950 px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-400"
        >
          {agent.capabilities.length === 0 && <option value="">No capabilities configured</option>}
          {agent.capabilities.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {result && (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            {result}
          </p>
        )}
        {error && <p className="mt-4 text-xs text-pink-400">{error}</p>}

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleRun}
            disabled={submitting || !action}
            className="glow-cta flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Running…" : "Run"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-purple-500/30 px-4 py-2 text-sm text-gray-400 hover:text-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
