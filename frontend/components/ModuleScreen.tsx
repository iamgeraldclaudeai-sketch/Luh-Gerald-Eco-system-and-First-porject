import Link from "next/link";
import { ModuleDef } from "@/lib/modules";
import { colorClasses } from "@/lib/colors";

export default function ModuleScreen({ module }: { module: ModuleDef }) {
  const c = colorClasses[module.color];

  return (
    <div className="starfield space-y-8 rounded-3xl border border-purple-500/10 p-2">
      <Link href="/" className="inline-block text-xs text-gray-500 hover:text-gray-300">
        ← Back to Command Center
      </Link>

      <section className={`glow-border rounded-2xl border ${c.border} ${c.bg} px-8 py-10`}>
        <div className="text-3xl">{module.icon}</div>
        <h1 className={`mt-3 text-2xl font-bold ${c.text}`}>{module.name}</h1>
        <p className="mt-1 text-sm text-gray-400">{module.tagline}</p>
        <p className="mt-4 max-w-xl text-sm text-gray-300">{module.description}</p>
      </section>

      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-gray-500">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {module.widgets.map((widget) => (
            <div
              key={widget}
              className={`glow-border rounded-xl border ${c.border} bg-space-900 p-4 text-sm text-gray-300`}
            >
              <p className="text-xs text-gray-500">{widget}</p>
              <p className={`mt-2 text-lg font-semibold ${c.text}`}>—</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-gray-600">
          This screen is a placeholder. Real data and actions plug in here next.
        </p>
      </section>
    </div>
  );
}
