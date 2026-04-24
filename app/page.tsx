import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();

  // Quick health check: count rows in key lookup tables so we know the
  // Supabase connection + RLS-anon-read paths are wired up on deploy.
  const [carriers, affiliations, lists, members] = await Promise.all([
    supabase.from("carriers").select("id", { count: "exact", head: true }),
    supabase
      .from("affiliations")
      .select("id", { count: "exact", head: true })
      .eq("type", "cluster"),
    supabase.from("top_agency_lists").select("id", { count: "exact", head: true }),
    supabase.from("top_agency_members").select("id", { count: "exact", head: true })
  ]);

  const cards = [
    {
      href: "/agency-directory",
      label: "Agency Directory",
      desc: "Browse agencies with filters for state, carriers, affiliations, and SIC codes."
    },
    {
      href: "/build-list",
      label: "Build a List",
      desc: "Stack filters and save the matching agencies + contacts for export."
    },
    {
      href: "/saved-lists",
      label: "Saved Lists",
      desc: "Review and re-run your previously saved list definitions."
    },
    {
      href: "/downloads",
      label: "Downloads",
      desc: "Export contacts or full agency rosters as CSV."
    },
    {
      href: "/quick-search",
      label: "Quick Search",
      desc: "Jump to a specific agency by name, DUNS, or address."
    },
    {
      href: "/data-mapping",
      label: "Data Mapping",
      desc: "Review what field goes where, with row counts per table."
    }
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-brand-50 p-6">
        <h1 className="text-2xl font-semibold text-brand-900">
          Welcome to the Seven16 Agency Directory
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-700">
          A multi-tenant B2B commercial insurance agency directory. Use the
          sections below to explore agencies, build targeted lists, and export
          contact rosters. Your tenant is <b>Seven16 Group</b>.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <Stat label="Carriers" value={carriers.count ?? "—"} />
          <Stat label="Clusters" value={affiliations.count ?? "—"} />
          <Stat label="Top Lists" value={lists.count ?? "—"} />
          <Stat label="List members" value={members.count ?? "—"} />
        </dl>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand-500 hover:shadow"
          >
            <div className="text-base font-semibold text-gray-900">
              {c.label}
            </div>
            <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm">
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-brand-600">{value}</dd>
    </div>
  );
}
