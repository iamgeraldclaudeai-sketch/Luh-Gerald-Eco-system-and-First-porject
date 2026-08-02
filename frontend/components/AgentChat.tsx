"use client";

import { useState } from "react";
import { Agent, ActivityLogEntry } from "@/lib/agents";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

let msgIdCounter = 0;
function nextMsgId() {
  msgIdCounter += 1;
  return `msg-${msgIdCounter}`;
}

export default function AgentChat({
  agent,
  initialActivity,
}: {
  agent: Agent;
  initialActivity: ActivityLogEntry[];
}) {
  const history: ChatMessage[] = [...initialActivity].reverse().map((entry) => ({
    id: `db-${entry.id}`,
    role: "agent",
    text: entry.message,
    time: formatTime(entry.created_at),
  }));

  const [messages, setMessages] = useState<ChatMessage[]>(history);
  const [action, setAction] = useState(agent.capabilities[0] ?? "");
  const [inputText, setInputText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!action || submitting) return;
    setSubmitting(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: nextMsgId(),
      role: "user",
      text: inputText ? `${action}: ${inputText}` : action,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch(`/api/agents/${agent.id}/act`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, input: inputText ? { note: inputText } : {} }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `db-${data.log.id}`,
          role: "agent",
          text: data.result,
          time: formatTime(data.log.created_at),
        },
      ]);
      setInputText("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass-panel glow-border rounded-2xl border border-primary/30 p-5">
      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-gray-600">
            No activity yet — run an action below to start the conversation.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`animate-fade-in-up flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                m.role === "user" ? "bg-primary/20 text-right text-gray-100" : "glass-panel text-gray-200"
              }`}
            >
              <p>{m.text}</p>
              <p className="mt-1 text-[10px] text-gray-500">{m.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-lg border border-primary/30 bg-space-950 px-3 py-2 text-xs text-gray-200 outline-none focus-visible:border-primary"
        >
          {agent.capabilities.length === 0 && <option value="">No capabilities configured</option>}
          {agent.capabilities.map((cap) => (
            <option key={cap} value={cap}>
              {cap}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Optional note…"
          className="min-w-0 flex-1 rounded-lg border border-primary/30 bg-space-950 px-3 py-2 text-xs text-gray-200 outline-none focus-visible:border-primary"
        />
        <button
          onClick={handleSend}
          disabled={submitting || !action}
          className="glow-cta rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Running…" : "Run"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-pink-400">{error}</p>}
    </div>
  );
}
