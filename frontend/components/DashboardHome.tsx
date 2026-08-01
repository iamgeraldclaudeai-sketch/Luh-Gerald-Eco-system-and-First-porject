"use client";

import { useState } from "react";
import Link from "next/link";
import { modules } from "@/lib/modules";
import { colorClasses } from "@/lib/colors";
import { Agent, ActivityLogEntry } from "@/lib/agents";
import AgentCard from "@/components/AgentCard";
import AgentActionModal from "@/components/AgentActionModal";

const status = [
  { label: "Energy", value: "100%" },
  { label: "Network", value: "99%" },
  { label: "Security", value: "100%" },
  { label: "AI Agents", value: `${modules.length}/${modules.length}` },
];

interface LogEntry {
  id: string;
  time: string;
  message: string;
}

let logIdCounter = 0;
function nextLogId() {
  logIdCounter += 1;
  return `log-${logIdCounter}`;
}

const fallbackLogs: LogEntry[] = [
  { id: nextLogId(), time: "09:41", message: "All 6 departments reporting nominal." },
  { id: nextLogId(), time: "09:12", message: "Dev Bay deployed a new automation." },
  { id: nextLogId(), time: "08:57", message: "Finance Office closed out weekly report." },
  { id: nextLogId(), time: "08:30", message: "System boot complete. AI Command Center online." },
];

const quickActions = [
  { label: "Run diagnostics", action: "run_diagnostics" },
  { label: "Broadcast update", action: "broadcast_update" },
  { label: "New task", action: "new_task" },
  { label: "Sync agents", action: "sync_agents" },
];

function formatLogTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardHome({
  agents,
  initialActivity,
}: {
  agents: Agent[];
  initialActivity: ActivityLogEntry[];
}) {
  const [logs, setLogs] = useState<LogEntry[]>(
    initialActivity.length > 0
      ? initialActivity.map((entry) => ({
          id: `db-${entry.id}`,
          time: formatLogTime(entry.created_at),
          message: entry.message,
        }))
      : fallbackLogs
  );
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [quickActionError, setQuickActionError] = useState<string | null>(null);

  function appendLog(log: ActivityLogEntry) {
    setLogs((prev) =>
      [{ id: `db-${log.id}`, time: formatLogTime(log.created_at), message: log.message }, ...prev].slice(0, 8)
    );
  }

  function handleAgentResult(log: ActivityLogEntry) {
    appendLog(log);
    setActiveAgent(null);
  }

  async function runQuickAction(action: string) {
    if (runningAction) return;
    setRunningAction(action);
    setQuickActionError(null);
    try {
      const res = await fetch("/api/quick-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQuickActionError(data.error ?? "Something went wrong.");
        return;
      }
      appendLog(data.log as ActivityLogEntry);
    } catch {
      setQuickActionError("Could not reach the server.");
    } finally {
      setRunningAction(null);
    }
  }

  return (
    <div className="starfield space-y-8 rounded-3xl border border-purple-500/10 p-2">
      <section className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="glow-border rounded-2xl border border-purple-500/40 bg-purple-500/5 px-8 py-10 text-purple-300">
          <p className="text-xs tracking-[0.3em]">AI COMMAND CENTER</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Control. Monitor. Decide.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-gray-400">
            One dashboard for every department in the Luh Gerald Eco System.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.action}
                onClick={() => runQuickAction(qa.action)}
                disabled={runningAction !== null}
                className="rounded-lg border border-purple-500/40 px-3 py-1.5 text-xs text-purple-200 transition-colors hover:border-purple-300 hover:bg-purple-500/10 disabled:opacity-50"
              >
                {runningAction === qa.action ? "Running…" : qa.label}
              </button>
            ))}
          </div>
          {quickActionError && (
            <p className="mt-3 text-xs text-pink-400">{quickActionError}</p>
          )}
        </div>

        <div className="glow-border rounded-2xl border border-purple-500/40 bg-space-900 px-5 py-5 text-purple-300">
          <p className="text-xs tracking-[0.2em]">SYSTEM STATUS</p>
          <div className="mt-4 space-y-3 text-xs">
            {status.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-gray-400">{s.label}</span>
                <span className="flex items-center gap-1.5 font-semibold text-purple-300">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-purple-400" />
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-purple-500/20 bg-space-900/60 p-5">
        <p className="mb-3 text-xs uppercase tracking-widest text-gray-500">Recent logs</p>
        <ul className="space-y-2 text-xs">
          {logs.map((log) => (
            <li key={log.id} className="animate-fade-in-up flex gap-3 text-gray-400">
              <span className="w-12 shrink-0 text-purple-400">{log.time}</span>
              <span>{log.message}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-gray-500">AI Agents</h2>
        {agents.length === 0 ? (
          <p className="text-xs text-gray-600">
            No agents yet — run <code className="text-purple-400">npm run seed</code> to add sample agents.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onRunAction={setActiveAgent}
                animationDelayMs={i * 60}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-gray-500">Departments</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map((m, i) => {
            const c = colorClasses[m.color];
            return (
              <Link
                key={m.slug}
                href={`/${m.slug}`}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`glow-border animate-fade-in-up group rounded-xl border ${c.border} ${c.hoverBorder} ${c.text} bg-space-900 p-5 transition-transform hover:-translate-y-1 hover:scale-[1.02]`}
              >
                <div className="text-2xl">{m.icon}</div>
                <h3 className={`mt-3 font-semibold ${c.text}`}>{m.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{m.tagline}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-purple-500/30 bg-purple-500/5 py-6 text-center">
        <p className="text-lg font-bold tracking-[0.2em] text-purple-300">LUH GERALD</p>
        <p className="text-xs tracking-[0.4em] text-purple-500">ECO SYSTEM</p>
      </section>

      {activeAgent && (
        <AgentActionModal
          agent={activeAgent}
          onClose={() => setActiveAgent(null)}
          onResult={handleAgentResult}
        />
      )}
    </div>
  );
}
