"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { modules } from "@/lib/modules";
import { colorClasses } from "@/lib/colors";
import { useAuth } from "@/lib/auth";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-purple-500/20 bg-space-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
        <Link href="/" className="text-sm font-bold tracking-widest text-purple-300">
          LUH GERALD ECO SYSTEM
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
          {modules.map((m) => {
            const active = pathname === `/${m.slug}`;
            const c = colorClasses[m.color];
            return (
              <Link
                key={m.slug}
                href={`/${m.slug}`}
                className={`transition-colors ${active ? c.text : "text-gray-400 hover:text-gray-200"}`}
              >
                {m.icon} {m.name}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-xs">
          {user && <span className="text-gray-500">{user.email}</span>}
          <button
            onClick={handleLogout}
            className="rounded-md border border-purple-500/30 px-3 py-1 text-gray-400 transition-colors hover:border-pink-400 hover:text-pink-300"
          >
            Log out
          </button>
        </div>
      </div>
      {user && !user.emailVerified && (
        <div className="border-t border-amber-500/20 bg-amber-500/10 px-6 py-1.5 text-center text-[11px] text-amber-300">
          Check your inbox to verify {user.email} — some features may prompt for it later.
        </div>
      )}
    </header>
  );
}
