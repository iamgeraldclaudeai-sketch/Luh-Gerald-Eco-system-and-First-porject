"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.ok) {
      router.push("/");
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-space-900 p-8">
      <p className="text-center text-xs tracking-[0.3em] text-purple-300">
        LUH GERALD ECO SYSTEM
      </p>
      <h1 className="mt-2 text-center text-xl font-bold text-white">Sign in</h1>

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
        <div>
          <label className="mb-1 block text-xs text-gray-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-purple-500/30 bg-space-950 px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-400"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-xs text-pink-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        No account yet?{" "}
        <Link href="/signup" className="text-purple-300 hover:text-purple-200">
          Create one
        </Link>
      </p>
    </div>
  );
}
