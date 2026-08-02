"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modules } from "@/lib/modules";
import { colorClasses } from "@/lib/colors";
import { cn } from "@/lib/cn";

export default function Sidebar() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/dashboard";

  return (
    <aside className="glass-panel flex gap-2 overflow-x-auto border-b border-white/5 px-3 py-3 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:px-4 md:py-6">
      <Link
        href="/"
        aria-current={isHome ? "page" : undefined}
        className={cn(
          "shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors md:text-sm",
          isHome ? "bg-primary/20 text-primary" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
        )}
      >
        🧠 Command Center
      </Link>
      {modules.map((m) => {
        const active = pathname === `/${m.slug}`;
        const c = colorClasses[m.color];
        return (
          <Link
            key={m.slug}
            href={`/${m.slug}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors md:text-sm",
              active ? `bg-white/5 ${c.text}` : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            )}
          >
            {m.icon} {m.name}
          </Link>
        );
      })}
    </aside>
  );
}
