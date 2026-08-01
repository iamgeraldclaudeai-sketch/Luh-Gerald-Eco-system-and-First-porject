"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setMessage(data.message ?? "If an account exists for that email, a reset link has been sent.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-space-900 p-8">
      <p className="text-center text-xs tracking-[0.3em] text-purple-300">
        LUH GERALD ECO SYSTEM
      </p>
      <h1 className="mt-2 text-center text-xl font-bold text-white">Reset your password</h1>
      <p className="mt-2 text-center text-xs text-gray-500">
        Enter your account email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-purple-500/30 bg-space-950 px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-400"
            placeholder="you@example.com"
          />
        </div>

        {message && <p className="text-xs text-emerald-400">{message}</p>}
        {error && <p className="text-xs text-pink-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        <Link href="/login" className="text-purple-300 hover:text-purple-200">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
