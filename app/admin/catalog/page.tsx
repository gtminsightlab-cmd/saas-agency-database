import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleSlash,
  Database,
  Layers,
  Network,
  Building2,
  ClipboardList,
  Users2,
  Briefcase,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CATALOG_TABLES, type CatalogTableConfig } from "./_lib/config";

export const dynamic = "force-dynamic";

const TABLE_ICONS: Record<string, typeof Database> = {
  account_types: Building2,
  location_types: Layers,
  agency_management_systems: Database,
  carriers: ClipboardList,
  affiliations: Network,
  sic_codes: BookOpen,
  departments: Briefcase,
  contact_title_roles: Users2,
};

async function getStats(t: CatalogTableConfig) {
  const supabase = await createClient();
  const total = await supabase.from(t.table).select("*", { count: "exact", head: true });
  const activeCount = t.hasActive
    ? await supabase
        .from(t.table)
        .select("*", { count: "exact", head: true })
        .eq("active", true)
    : null;
  return {
    total: total.count ?? 0,
    active: activeCount?.count ?? null,
  };
}

export default async function CatalogIndex() {
  const stats = await Promise.all(CATALOG_TABLES.map(getStats));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-admin-text-dim">Catalog</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Reference tables</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-2xl">
          Inline editor for the eight reference tables that drive Build List filters and contact
          attributes. Active/inactive toggles take effect immediately. Inactivating a row that&rsquo;s
          heavily used will show a confirmation prompt.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CATALOG_TABLES.map((t, i) => {
          const Icon = TABLE_ICONS[t.table] ?? Database;
          const s = stats[i];
          return (
            <Link
              key={t.table}
              href={`/admin/catalog/${t.table}`}
              className="group rounded-xl border border-admin-border-2 bg-admin-surface p-5 hover:border-admin-accent/60 transition"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowRight className="h-4 w-4 text-admin-text-dim group-hover:text-admin-accent group-hover:translate-x-0.5 transition" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-admin-text">{t.name}</h3>
              <p className="mt-1 text-xs text-admin-text-mute line-clamp-2">{t.description}</p>
              <div className="mt-4 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-admin-text">
                  <Database className="h-3 w-3 text-admin-text-dim" />
                  <span className="font-semibold tabular-nums">{s.total.toLocaleString()}</span>
                  <span className="text-admin-text-mute">rows</span>
                </span>
                {t.hasActive && s.active !== null && (
                  <>
                    <span className="inline-flex items-center gap-1 text-admin-ok">
                      <CircleCheck className="h-3 w-3" />
                      <span className="font-semibold tabular-nums">{s.active}</span>
                      <span className="text-admin-text-mute">active</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-admin-text-dim">
                      <CircleSlash className="h-3 w-3" />
                      <span className="font-semibold tabular-nums">{s.total - s.active}</span>
                      <span className="text-admin-text-mute">inactive</span>
                    </span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
