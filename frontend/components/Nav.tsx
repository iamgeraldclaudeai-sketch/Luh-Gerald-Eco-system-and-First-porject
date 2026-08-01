"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modules } from "@/lib/modules";
import { colorClasses } from "@/lib/colors";

export default function Nav() {
  const pathname = usePathname();

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
      </div>
    </header>
  );
}
