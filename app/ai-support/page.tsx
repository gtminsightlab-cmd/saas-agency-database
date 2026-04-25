import Link from "next/link";
import {
  Building2,
  Users,
  Network,
  Briefcase,
  Layers,
  Code,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import { loadAiSearchDictionary } from "@/lib/ai-search/dictionary";
import { parseAiQuery } from "@/lib/ai-search/parse";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getSuggestedFor,
  type SuggestedCategory,
} from "@/lib/ai-search/suggested-queries";
import { SearchForm } from "./search-form";
import { logAiSearch } from "./log-action";

export const dynamic = "force-dynamic";

type RecentSearch = {
  id: string;
  action_type: string;
  query_text: string | null;
  filter_keys: string[];
  parsed_summary: { account_name?: string } | null;
  created_at: string;
};

export default async function AiSupportPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = pickStr(searchParams.q);
  const cat = (pickStr(searchParams.cat) as SuggestedCategory) || "agencies";
  const activeCat = CATEGORY_ORDER.includes(cat) ? cat : "agencies";

  const supabase = createClient();

  const [
    { count: agenciesCount },
    { count: contactsCount },
    carriersRpc,
    sectorsRes,
    affRes,
    sicRes,
    dict,
    recentRes,
  ] = await Promise.all([
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.rpc("list_carriers_with_appointments"),
    supabase.from("account_types").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("affiliations").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("sic_codes").select("id", { count: "exact", head: true }),
    loadAiSearchDictionary(),
    supabase.rpc("get_my_recent_searches", { p_limit: 10 }),
  ]);

  const carriersCount = (carriersRpc.data ?? []).length;
  const sectorsCount = sectorsRes.count ?? 0;
  const affiliationsCount = affRes.count ?? 0;
  const sicCount = sicRes.count ?? 0;
  const recent = (recentRes.data ?? []) as RecentSearch[];

  const parsed = q ? parseAiQuery(q, dict) : null;
  let resultCount: number | null = null;

  if (parsed && parsed.filterKeys.length > 0) {
    void logAiSearch({
      query_text: q,
      filter_keys: parsed.filterKeys,
      summary: {
        account_types: parsed.summary.account_types.map((x) => x.label),
        states: parsed.summary.states.map((x) => x.code),
        country: parsed.summary.country,
        carriers: parsed.summary.carriers.map((x) => x.name),
        affiliations: parsed.summary.affiliations.map((x) => x.canonical_name),
        location_types: parsed.summary.location_types.map((x) => x.name),
        premium_min: parsed.summary.premium_min,
        premium_max: parsed.summary.premium_max,
        revenue_min: parsed.summary.revenue_min,
        revenue_max: parsed.summary.revenue_max,
        employees_min: parsed.summary.employees_min,
        employees_max: parsed.summary.employees_max,
        minority: parsed.summary.minority,
        has_email: parsed.summary.has_email,
        account_name: parsed.summary.account_name,
      },
    });

    resultCount = await previewCount(supabase, parsed.summary);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 inline-flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-brand-600" />
              AI Support
            </h1>
            <p className="mt-1.5 text-sm text-gray-600 max-w-2xl">
              Ask in plain language &mdash; the parser turns it into a Build List filter set.
              Pick from a category below if you need ideas, or write your own.
            </p>
          </div>
          <Link
            href="/build-list"
            className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
          >
            Use the classic Build List instead
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard label="Agencies"     value={agenciesCount ?? 0}   Icon={Building2} />
          <KpiCard label="Contacts"     value={contactsCount ?? 0}   Icon={Users} />
          <KpiCard label="Carriers"     value={carriersCount}        Icon={Network} hint="With appointments" />
          <KpiCard label="Sectors"      value={sectorsCount}         Icon={Layers}  hint="Account types" />
          <KpiCard label="Affiliations" value={affiliationsCount}    Icon={Briefcase} />
          <KpiCard label="SIC Codes"    value={sicCount}             Icon={Code} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <FilterShortcuts dict={dict} />
          </aside>

          <section className="lg:col-span-6 space-y-5">
            <SearchForm initialQuery={q} initialCat={activeCat} />

            <div>
              <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-3">
                {CATEGORY_ORDER.map((c) => (
                  <Link
                    key={c}
                    href={`/ai-support?${q ? `q=${encodeURIComponent(q)}&` : ""}cat=${c}`}
                    className={
                      "px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors " +
                      (activeCat === c
                        ? "border-brand-600 text-brand-700"
                        : "border-transparent text-gray-500 hover:text-gray-700")
                    }
                  >
                    {CATEGORY_LABELS[c]}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {getSuggestedFor(activeCat).map((s) => (
                  <Link
                    key={s.text}
                    href={`/ai-support?q=${encodeURIComponent(s.text)}&cat=${activeCat}`}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:border-brand-300 hover:bg-brand-50/50"
                  >
                    {s.label ?? s.text}
                  </Link>
                ))}
              </div>
            </div>

            {parsed && (
              <ParsePreview q={q} parsed={parsed} resultCount={resultCount} />
            )}
          </section>

          <aside className="lg:col-span-3">
            <RecentSearches recent={recent} />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function pickStr(v: string | string[] | undefined): string {
  if (!v) return "";
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

async function previewCount(
  supabase: ReturnType<typeof createClient>,
  s: ReturnType<typeof parseAiQuery>["summary"]
): Promise<number | null> {
  let q = supabase.from("agencies").select("id", { count: "exact", head: true });

  if (s.account_types.length) q = q.in("account_type_id", s.account_types.map((x) => x.id));
  if (s.location_types.length) q = q.in("location_type_id", s.location_types.map((x) => x.id));
  if (s.country) q = q.eq("country", s.country === "US" ? "USA" : "CAN");
  if (s.states.length) q = q.in("state", s.states.map((x) => x.code));
  if (s.premium_min !== undefined) q = q.gte("premium_volume", s.premium_min);
  if (s.premium_max !== undefined) q = q.lte("premium_volume", s.premium_max);
  if (s.revenue_min !== undefined) q = q.gte("revenue", s.revenue_min);
  if (s.revenue_max !== undefined) q = q.lte("revenue", s.revenue_max);
  if (s.employees_min !== undefined) q = q.gte("employees", s.employees_min);
  if (s.employees_max !== undefined) q = q.lte("employees", s.employees_max);
  if (s.minority === "yes") q = q.eq("minority_owned", true);
  if (s.account_name) q = q.ilike("name", `%${s.account_name}%`);

  const { count, error } = await q;
  if (error) return null;
  return count ?? null;
}

function KpiCard({
  label, value, Icon, hint,
}: {
  label: string; value: number; Icon: typeof Building2; hint?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
        <Icon className="h-3.5 w-3.5 text-brand-600" />
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</div>
      {hint && <div className="text-[10px] text-gray-400 mt-0.5">{hint}</div>}
    </div>
  );
}

function FilterShortcuts({ dict }: { dict: Awaited<ReturnType<typeof loadAiSearchDictionary>> }) {
  const topStates = dict.states.filter((s) => s.country === "US").slice(0, 8);
  const topAccountTypes = dict.accountTypes.slice(0, 6);

  const premiumLinks = [
    { label: "Over $1M",  q: "agencies with over $1M premium" },
    { label: "Over $10M", q: "agencies with over $10M premium" },
    { label: "$1M\u2013$5M",  q: "agencies with between $1M and $5M premium" },
    { label: "$5M\u2013$25M", q: "agencies with between $5M and $25M premium" },
  ];
  const sizeLinks = [
    { label: "10\u201350 employees",  q: "agencies with between 10 and 50 employees" },
    { label: "50\u2013250 employees", q: "agencies with between 50 and 250 employees" },
    { label: "250+ employees",        q: "agencies with over 250 employees" },
  ];

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Quick state</div>
        <div className="flex flex-wrap gap-1.5">
          {topStates.map((s) => (
            <Link
              key={s.id}
              href={`/ai-support?q=${encodeURIComponent(s.name + " agencies")}`}
              className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-700 hover:border-brand-300 hover:bg-brand-50/50"
            >
              {s.code}
            </Link>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-gray-500">
          <Link href="/build-list" className="hover:underline">All 50 states + Canada in Build a List &rarr;</Link>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Account type</div>
        <div className="flex flex-col gap-1">
          {topAccountTypes.map((at) => (
            <Link
              key={at.id}
              href={`/ai-support?q=${encodeURIComponent(at.label + " in California")}`}
              className="text-[11px] text-gray-700 hover:text-brand-700 hover:underline"
            >
              {at.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Premium volume</div>
        <div className="flex flex-col gap-1">
          {premiumLinks.map((p) => (
            <Link
              key={p.label}
              href={`/ai-support?q=${encodeURIComponent(p.q)}`}
              className="text-[11px] text-gray-700 hover:text-brand-700 hover:underline"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Account size</div>
        <div className="flex flex-col gap-1">
          {sizeLinks.map((p) => (
            <Link
              key={p.label}
              href={`/ai-support?q=${encodeURIComponent(p.q)}`}
              className="text-[11px] text-gray-700 hover:text-brand-700 hover:underline"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function ParsePreview({
  q, parsed, resultCount,
}: {
  q: string;
  parsed: ReturnType<typeof parseAiQuery>;
  resultCount: number | null;
}) {
  const noFilters = parsed.filterKeys.length === 0;

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-5">
      <div className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">
        Parsed query
      </div>
      <div className="text-sm text-gray-800 italic mb-3">&ldquo;{q}&rdquo;</div>

      {noFilters ? (
        <div className="text-sm text-gray-700">
          {parsed.errors[0] ?? "I couldn't pull any filters out of that. Try mentioning a state, an account type (MGA, wholesaler, PE-backed), a carrier, or a premium range like 'over $5M premium'."}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {parsed.summary.country && <Chip kind="country">{parsed.summary.country}</Chip>}
            {parsed.summary.states.map((s) => (<Chip key={s.id} kind="state">{s.name}</Chip>))}
            {parsed.summary.account_types.map((at) => (<Chip key={at.id} kind="account_type">{at.label}</Chip>))}
            {parsed.summary.location_types.map((lt) => (<Chip key={lt.id} kind="location_type">{lt.name}</Chip>))}
            {parsed.summary.carriers.map((c) => {
              const isStrong = parsed.hits.some((h) => h.kind === "carrier_prefix" && h.resolved === c.name);
              return (
                <Chip key={c.id} kind="carrier" tip={isStrong ? `Matched on a partial — full name is "${c.name}"` : undefined}>
                  {c.name}{isStrong && <span className="ml-1 text-amber-600">~</span>}
                </Chip>
              );
            })}
            {parsed.summary.affiliations.map((a) => (<Chip key={a.id} kind="affiliation">{a.canonical_name}</Chip>))}
            {parsed.summary.premium_min !== undefined && <Chip kind="range">Premium &ge; ${(parsed.summary.premium_min / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M</Chip>}
            {parsed.summary.premium_max !== undefined && <Chip kind="range">Premium &le; ${(parsed.summary.premium_max / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M</Chip>}
            {parsed.summary.revenue_min !== undefined && <Chip kind="range">Revenue &ge; ${(parsed.summary.revenue_min / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M</Chip>}
            {parsed.summary.revenue_max !== undefined && <Chip kind="range">Revenue &le; ${(parsed.summary.revenue_max / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M</Chip>}
            {parsed.summary.employees_min !== undefined && <Chip kind="range">Employees &ge; {parsed.summary.employees_min.toLocaleString()}</Chip>}
            {parsed.summary.employees_max !== undefined && <Chip kind="range">Employees &le; {parsed.summary.employees_max.toLocaleString()}</Chip>}
            {parsed.summary.minority === "yes" && <Chip kind="flag">Minority-owned</Chip>}
            {parsed.summary.has_email && <Chip kind="flag">Has email (applied at run time)</Chip>}
            {parsed.summary.account_name && <Chip kind="name">Name contains &ldquo;{parsed.summary.account_name}&rdquo;</Chip>}
          </div>

          {parsed.hits.some((h) => h.kind === "carrier_prefix") && (
            <div className="mb-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              <strong>Heads up:</strong> the carrier match is a strong-not-exact hit (we matched on a leading word, not the full name). Check the chip with a <span className="font-mono">~</span> before running &mdash; click <em>Tweak in Build List</em> to confirm or pick a different carrier.
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-gray-600">
              {resultCount === null ? (
                <em>Counting&hellip;</em>
              ) : parsed.summary.carriers.length || parsed.summary.affiliations.length ? (
                <>~{resultCount.toLocaleString()} agencies match the simple filters. Carrier/affiliation joins refine on the next page.</>
              ) : (
                <>{resultCount.toLocaleString()} agencies match.</>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/build-list?${parsed.qs}`}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Tweak in Build List
              </Link>
              <Link
                href={`/build-list/review?${parsed.qs}`}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 inline-flex items-center gap-1"
              >
                Run search
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Chip({
  kind, children, tip,
}: {
  kind: "country" | "state" | "account_type" | "location_type" | "carrier" | "affiliation" | "range" | "flag" | "name";
  children: React.ReactNode;
  tip?: string;
}) {
  const cls: Record<typeof kind, string> = {
    country:        "bg-gray-100 text-gray-700 border-gray-200",
    state:          "bg-blue-50 text-blue-700 border-blue-200",
    account_type:   "bg-violet-50 text-violet-700 border-violet-200",
    location_type:  "bg-teal-50 text-teal-700 border-teal-200",
    carrier:        "bg-amber-50 text-amber-700 border-amber-200",
    affiliation:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    range:          "bg-rose-50 text-rose-700 border-rose-200",
    flag:           "bg-indigo-50 text-indigo-700 border-indigo-200",
    name:           "bg-gray-100 text-gray-800 border-gray-300",
  };
  return (
    <span title={tip} className={"inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium " + cls[kind]}>
      {children}
    </span>
  );
}

function RecentSearches({ recent }: { recent: RecentSearch[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-3.5 w-3.5 text-gray-400" />
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Your recent searches
        </div>
      </div>
      {recent.length === 0 ? (
        <div className="text-xs text-gray-500">
          Nothing yet. Searches you run here or on Build List show up in this list.
        </div>
      ) : (
        <ul className="space-y-2">
          {recent.map((r) => {
            const text = r.query_text || `${r.filter_keys.length} filter${r.filter_keys.length === 1 ? "" : "s"} on Build List`;
            const href = r.action_type === "ai_search" && r.query_text
              ? `/ai-support?q=${encodeURIComponent(r.query_text)}`
              : `/saved-lists`;
            return (
              <li key={r.id}>
                <Link href={href} className="block rounded-md px-2 py-1.5 hover:bg-gray-50 text-xs">
                  <div className="text-gray-800 line-clamp-2 leading-tight">{text}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="inline-block h-1 w-1 rounded-full bg-brand-400" />
                    {r.action_type === "ai_search" ? "AI search" : "Build List"}
                    <span>&middot;</span>
                    {timeAgo(r.created_at)}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return Math.round(ms / 60_000) + "m ago";
  if (ms < 86_400_000) return Math.round(ms / 3_600_000) + "h ago";
  return Math.round(ms / 86_400_000) + "d ago";
}
