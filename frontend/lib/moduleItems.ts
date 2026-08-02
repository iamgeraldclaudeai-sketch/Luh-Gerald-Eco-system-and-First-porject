import { sql, ensureSchema } from "./db";

export interface ModuleItem {
  id: number;
  title: string;
  body: string | null;
  status: string;
  amount_cents: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function getModuleItems(moduleSlug: string): Promise<ModuleItem[] | null> {
  try {
    await ensureSchema();
    const client = sql();
    const rows = await client`
      SELECT id, title, body, status, amount_cents, metadata, created_at FROM module_items
      WHERE module = ${moduleSlug}
      ORDER BY created_at DESC
      LIMIT 10
    `;
    return rows as unknown as ModuleItem[];
  } catch (err) {
    console.error(`getModuleItems(${moduleSlug}) failed`, err);
    return null;
  }
}
