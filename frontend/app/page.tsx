import Link from "next/link";
import { modules } from "@/lib/modules";
import { colorClasses } from "@/lib/colors";

const status = [
  { label: "Energy", value: "100%" },
  { label: "Network", value: "99%" },
  { label: "Security", value: "100%" },
  { label: "AI Agents", value: `${modules.length}/${modules.length}` },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-purple-500/30 bg-purple-500/5 px-8 py-10 text-center">
        <p className="text-xs tracking-[0.3em] text-purple-300">AI COMMAND CENTER</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Control. Monitor. Decide.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
          One dashboard for every department in the Luh Gerald Eco System.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {status.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-purple-500/20 bg-space-900 px-4 py-3 text-center"
          >
            <p className="text-[10px] uppercase tracking-widest text-gray-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-purple-300">{s.value}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-gray-500">Departments</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const c = colorClasses[m.color];
            return (
              <Link
                key={m.slug}
                href={`/${m.slug}`}
                className={`group rounded-xl border ${c.border} ${c.hoverBorder} bg-space-900 p-5 transition-colors`}
              >
                <div className="text-2xl">{m.icon}</div>
                <h3 className={`mt-3 font-semibold ${c.text}`}>{m.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{m.tagline}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
