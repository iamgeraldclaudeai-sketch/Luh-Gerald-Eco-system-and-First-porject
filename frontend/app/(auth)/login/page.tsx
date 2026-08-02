"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

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
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="glass-panel glow-border rounded-2xl border border-primary/30 p-8">
      <p className="text-center text-xs tracking-[0.3em] text-purple-300">
        LUH GERALD ECO SYSTEM
      </p>
      <h1 className="mt-2 text-center text-xl font-bold text-white">Sign in</h1>

      {verified === "1" && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-400">
          Email verified — you can sign in now.
        </p>
      )}
      {verified === "0" && (
        <p className="mt-4 rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-center text-xs text-pink-400">
          That verification link is invalid or has expired.
        </p>
      )}

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
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-gray-400">Password</label>
            <Link href="/forgot-password" className="text-xs text-purple-300 hover:text-purple-200">
              Forgot password?
            </Link>
          </div>
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
          className="glow-cta w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
