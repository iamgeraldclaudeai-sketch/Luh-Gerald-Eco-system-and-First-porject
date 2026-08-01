export interface ActivityLogItem {
  id: string;
  time: string;
  message: string;
}

function deriveTag(message: string): string {
  const match = message.match(/^(\S+) ran/);
  return match ? match[1] : "System";
}

export default function ActivityLog({ logs }: { logs: ActivityLogItem[] }) {
  if (logs.length === 0) {
    return <p className="text-xs text-gray-600">No activity yet.</p>;
  }

  return (
    <ul className="space-y-2 text-xs">
      {logs.map((log) => (
        <li key={log.id} className="animate-fade-in-up flex flex-wrap items-center gap-2 text-gray-400 sm:gap-3">
          <span className="w-12 shrink-0 text-primary">{log.time}</span>
          <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
            {deriveTag(log.message)}
          </span>
          <span>{log.message}</span>
        </li>
      ))}
    </ul>
  );
}
