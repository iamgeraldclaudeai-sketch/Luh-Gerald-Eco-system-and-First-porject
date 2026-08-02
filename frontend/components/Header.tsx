"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-bg/90 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="text-sm font-bold tracking-widest text-primary">
          LUH GERALD ECO SYSTEM
        </Link>

        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="hidden items-center gap-1.5 rounded-full border border-accent/30 px-3 py-1 text-accent sm:flex">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            All systems online
          </span>
          {user && <span className="hidden text-gray-500 sm:inline">{user.email}</span>}
          <button
            onClick={handleLogout}
            className="rounded-md border border-white/10 px-3 py-1 text-gray-400 transition-colors hover:border-pink-400 hover:text-pink-300"
          >
            Log out
          </button>
        </div>
      </div>
      {user && !user.emailVerified && (
        <div className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-[11px] text-amber-300 md:px-6">
          Check your inbox to verify {user.email} — some features may prompt for it later.
        </div>
      )}
    </header>
  );
}
