import ModuleScreen from "@/components/ModuleScreen";
import { getModule } from "@/lib/modules";
import { sql, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Post {
  id: number;
  title: string;
  status: string;
  created_at: string;
}

async function getPosts(): Promise<Post[] | null> {
  try {
    await ensureSchema();
    const client = sql();
    const rows = await client`
      SELECT id, title, status, created_at FROM posts
      ORDER BY created_at DESC
      LIMIT 10
    `;
    return rows as unknown as Post[];
  } catch (err) {
    console.error("marketing-suite: failed to load posts", err);
    return null;
  }
}

const statusColor: Record<string, string> = {
  published: "text-emerald-400",
  scheduled: "text-sky-400",
  draft: "text-gray-400",
};

export default async function Page() {
  const posts = await getPosts();

  return (
    <ModuleScreen module={getModule("marketing-suite")!}>
      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-gray-500">Marketing Posts</h2>

        {posts === null && (
          <p className="text-xs text-gray-600">
            Connect a database (see DEPLOYMENT.md) to see live posts here.
          </p>
        )}
        {posts !== null && posts.length === 0 && (
          <p className="text-xs text-gray-600">
            No posts yet — run <code className="text-pink-400">npm run seed</code> to add sample data.
          </p>
        )}
        {posts !== null && posts.length > 0 && (
          <ul className="space-y-2">
            {posts.map((p) => (
              <li
                key={p.id}
                className="glow-border flex items-center justify-between rounded-lg border border-pink-500/20 bg-space-900 px-4 py-3 text-sm text-pink-400"
              >
                <span className="text-gray-200">{p.title}</span>
                <span
                  className={`text-xs uppercase tracking-wide ${statusColor[p.status] ?? "text-gray-400"}`}
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ModuleScreen>
  );
}
