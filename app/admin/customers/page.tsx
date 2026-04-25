import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Building2,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SortableThLink, type SortDir } from "@/components/sortable-th";

export const dynamic = "force-dynamic";

type Tenant = {
  id: string;
  name: string;
  slug: string | null;
  plan: string | null;
  created_at: string;
  updated_at: string;
};

type AppUser = {
  id: string;
  email: string;
  role: string;
  tenant_id: string | null;
  is_active: boolean;
};

type SortKey = "name" | "slug" | "plan" | "users" | "active" | "admins" | "created";

const VALID_SORTS = new Set<SortKey>([
  "name", "slug", "plan", "users", "active", "admins", "created",
]);
function pickSort(v: string | undefined): SortKey {
  return v && VALID_SORTS.has(v as SortKey) ? (v as SortKey) : "created";
}
function pickDir(v: string | undefined): SortDir {
  return v === "desc" ? "desc" : "asc";
}

export default async function CustomersIndex({
  searchParams,
}: {
  searchParams: { sort?: string; dir?: string };
}) {
  const sort: SortKey = pickSort(searchParams.sort);
  const dir: SortDir = pickDir(searchParams.dir);

  const supabase = createClient();

  const [
    { data: tenants },
    { data: users },
    { count: orphanedUsersCount },
  ] = await Promise.all([
    supabase.from("tenants").select("id,name,slug,plan,created_at,updated_at"),
    supabase.from("app_users").select("id,email,role,tenant_id,is_active"),
    supabase.from("app_users").select("*", { count: "exact", head: true }).is("tenant_id", null),
  ]);

  const tenantsList = (tenants ?? []) as Tenant[];
  const usersList = (users ?? []) as AppUser[];

  const userCountByTenant = new Map<string, { total: number; active: number; admins: number }>();
  for (const u of usersList) {
    if (!u.tenant_id) continue;
    const cur = userCountByTenant.get(u.tenant_id) ?? { total: 0, active: 0, admins: 0 };
    cur.total += 1;
    if (u.is_active) cur.active += 1;
    if (u.role === "super_admin" || u.role === "admin") cur.admins += 1;
    userCountByTenant.set(u.tenant_id, cur);
  }

  const totalUsers = usersList.length;
  const totalActive = usersList.filter((u) => u.is_active).length;

  // Sort tenants in JS so we can sort by computed user-count columns alongside
  // table-column sorts. Tenant counts are tiny (<100 typical) — server-side sort
  // would mean either two queries or a per-tenant aggregation, not worth it.
  const cmp = (a: Tenant, b: Tenant): number => {
    const ca = userCountByTenant.get(a.id) ?? { total: 0, active: 0, admins: 0 };
    const cb = userCountByTenant.get(b.id) ?? { total: 0, active: 0, admins: 0 };
    let diff = 0;
    switch (sort) {
      case "name":
        diff = a.name.localeCompare(b.name);
        break;
      case "slug":
        diff = (a.slug ?? "").localeCompare(b.slug ?? "");
        break;
      case "plan":
        diff = (a.plan ?? "").localeCompare(b.plan ?? "");
        break;
      case "users":
        diff = ca.total - cb.total;
        break;
      case "active":
        diff = ca.active - cb.active;
        break;
      case "admins":
        diff = ca.admins - cb.admins;
        break;
      case "created":
        diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    if (diff === 0) diff = a.name.localeCompare(b.name);
    return dir === "asc" ? diff : -diff;
  };
  const sortedTenants = [...tenantsList].sort(cmp);

  function sortHref(key: SortKey): string {
    const params = new URLSearchParams();
    if (key === sort) {
      params.set("sort", key);
      params.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", key);
      // Numeric/date columns default desc, text columns default asc.
      params.set("dir", key === "users" || key === "active" || key === "admins" || key === "created" ? "desc" : "asc");
    }
    return `/admin/customers?${params.toString()}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Customers</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Tenants &amp; users</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Multi-tenant control panel. Click a tenant to manage its users, plan entitlements, and
          credit balances. Impersonation + tenant-limit overrides ship in the next iteration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Kpi label="Tenants"   value={tenantsList.length} Icon={Building2} tone="accent" hint="Multi-tenant ready, single tenant in use today" />
        <Kpi label="App users" value={totalUsers}         Icon={Users}     tone="accent" hint={`${totalActive} active / ${totalUsers - totalActive} suspended`} />
        <Kpi label="Super admins" value={usersList.filter((u) => u.role === "super_admin").length} Icon={Crown} tone="ok" hint="Users with full admin access" />
        <Kpi label="Orphaned users" value={orphanedUsersCount ?? 0} Icon={AlertTriangle} tone={(orphanedUsersCount ?? 0) > 0 ? "warn" : "mute"} hint="No tenant_id set — should be 0" />
      </div>

      <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
        <header className="px-5 py-3 border-b border-admin-border-2 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-admin-text">Tenants</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              {tenantsList.length} {tenantsList.length === 1 ? "tenant" : "tenants"} · click to drill into users + entitlements
            </p>
          </div>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2">
            <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
              <SortableThLink theme="admin" label="Tenant"  sortKey="name"    activeSort={sort} dir={dir} hrefFor={sortHref} />
              <SortableThLink theme="admin" label="Slug"    sortKey="slug"    activeSort={sort} dir={dir} hrefFor={sortHref} />
              <SortableThLink theme="admin" label="Plan"    sortKey="plan"    activeSort={sort} dir={dir} hrefFor={sortHref} />
              <SortableThLink theme="admin" label="Users"   sortKey="users"   activeSort={sort} dir={dir} hrefFor={sortHref} />
              <SortableThLink theme="admin" label="Active"  sortKey="active"  activeSort={sort} dir={dir} hrefFor={sortHref} />
              <SortableThLink theme="admin" label="Admins"  sortKey="admins"  activeSort={sort} dir={dir} hrefFor={sortHref} />
              <SortableThLink theme="admin" label="Created" sortKey="created" activeSort={sort} dir={dir} hrefFor={sortHref} />
              <th className="px-5 py-2.5 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-2">
            {sortedTenants.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-admin-text-mute">
                  No tenants yet.
                </td>
              </tr>
            ) : (
              sortedTenants.map((t) => {
                const counts = userCountByTenant.get(t.id) ?? { total: 0, active: 0, admins: 0 };
                return (
                  <tr key={t.id}>
                    <td className="px-5 py-3 align-top">
                      <Link href={`/admin/customers/${t.id}`} className="font-medium text-admin-text hover:text-admin-accent">
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 align-top">
                      {t.slug ? <code className="text-xs text-admin-text-mute">{t.slug}</code> : <span className="text-admin-text-dim text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3 align-top">
                      {t.plan ? <span className="text-xs text-admin-text">{t.plan}</span> : <span className="text-admin-text-dim text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3 align-top tabular-nums text-admin-text">{counts.total}</td>
                    <td className="px-5 py-3 align-top tabular-nums"><span className="text-admin-ok">{counts.active}</span></td>
                    <td className="px-5 py-3 align-top tabular-nums text-admin-text">{counts.admins}</td>
                    <td className="px-5 py-3 align-top text-xs text-admin-text-mute">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 align-top text-right">
                      <Link href={`/admin/customers/${t.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline">
                        Manage
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}


function Kpi({
  label, value, Icon, tone, hint,
}: {
  label: string;
  value: number;
  Icon: typeof Users;
  tone: "accent" | "ok" | "warn" | "mute";
  hint: string;
}) {
  const cls =
    tone === "accent" ? "text-admin-accent bg-admin-accent/15"
    : tone === "ok"   ? "text-admin-ok bg-admin-ok/15"
    : tone === "warn" ? "text-admin-warn bg-admin-warn/15"
    : "text-admin-text-dim bg-admin-surface-2";
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${cls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}
