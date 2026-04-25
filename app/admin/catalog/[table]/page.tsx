import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTableConfig } from "../_lib/config";
import { CatalogEditor } from "./editor";

export const dynamic = "force-dynamic";

export default async function CatalogTablePage({
  params,
}: {
  params: { table: string };
}) {
  const config = getTableConfig(params.table);
  if (!config) notFound();

  const supabase = createClient();

  // Fetch all rows. None of these tables exceed ~1,400 rows so we don't need pagination yet.
  const orderClauses: { column: string; ascending: boolean }[] = [];
  if (config.hasSortOrder) orderClauses.push({ column: "sort_order", ascending: true });
  orderClauses.push({ column: config.primaryColumn, ascending: true });

  let q = supabase.from(config.table).select("*").limit(2000);
  for (const o of orderClauses) q = q.order(o.column, { ascending: o.ascending });
  const { data: rows, error } = await q;

  // FK reference counts — fetched separately and merged into rows by id.
  // We tally distinct rows in the source table per fkColumn value.
  const usedByMap: Record<string, number> = {};
  if (config.usedBy && rows && rows.length) {
    const fkSrc = config.usedBy[0];
    const ids = rows.map((r: any) => r.id);
    // Pull all fk values once; group client-side. For up to a few thousand rows this is fine.
    const { data: fkRows } = await supabase
      .from(fkSrc.table)
      .select(fkSrc.fkColumn)
      .in(fkSrc.fkColumn, ids);
    for (const r of fkRows ?? []) {
      const v = (r as any)[fkSrc.fkColumn];
      if (v) usedByMap[v] = (usedByMap[v] ?? 0) + 1;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/catalog"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> All catalog tables
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Catalog</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">{config.name}</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">{config.description}</p>
      </div>

      {error && (
        <div className="rounded-md border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger">
          Failed to load rows: {error.message}
        </div>
      )}

      <CatalogEditor
        config={config}
        initialRows={(rows ?? []) as any}
        usedBy={usedByMap}
      />
    </div>
  );
}
