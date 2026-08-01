import { ModuleColor } from "@/lib/modules";
import { colorClasses } from "@/lib/colors";
import { ModuleItem } from "@/lib/moduleItems";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ModuleItemsList({
  items,
  heading,
  color,
  emptyHint,
}: {
  items: ModuleItem[] | null;
  heading: string;
  color: ModuleColor;
  emptyHint?: string;
}) {
  const c = colorClasses[color];

  return (
    <section>
      <h2 className="mb-4 text-sm uppercase tracking-widest text-gray-500">{heading}</h2>

      {items === null && (
        <p className="text-xs text-gray-600">
          Connect a database (see DEPLOYMENT.md) to see live data here.
        </p>
      )}
      {items !== null && items.length === 0 && (
        <p className="text-xs text-gray-600">
          {emptyHint ?? (
            <>
              No data yet — run <code className="text-gray-400">npm run seed</code> to add sample data.
            </>
          )}
        </p>
      )}
      {items !== null && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={`glow-border flex items-center justify-between rounded-lg border ${c.border} bg-space-900 px-4 py-3 text-sm`}
            >
              <span className="text-gray-200">{item.title}</span>
              <span className="flex items-center gap-3">
                {item.amount_cents !== null && (
                  <span className="text-xs text-gray-400">{formatCurrency(item.amount_cents)}</span>
                )}
                <span className={`text-xs uppercase tracking-wide ${c.text}`}>{item.status}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
