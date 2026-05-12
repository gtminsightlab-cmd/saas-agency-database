/**
 * Cached reference-data loaders for /build-list.
 *
 * Why: /build-list previously fired 12 Supabase queries on every render —
 * 9 of which were reference data (account_types, location_types, ams,
 * management_levels, contact_title_roles, departments, states, metro_areas,
 * carriers RPC, affiliations, sic_codes) that only change when an admin
 * edits the catalog. Caching these globally (not per-user) cuts ~300ms
 * off every authenticated /build-list render and shifts load off Supabase.
 *
 * Why anon client (not the authed createClient): unstable_cache hashes its
 * cache key from the function inputs. Mixing in per-request cookies would
 * scope the cache per-user — defeats the purpose, since reference data is
 * identical for everyone. All 10 reference tables + 1 RPC have anon-allowed
 * SELECT/EXECUTE policies (verified 2026-05-12).
 *
 * Invalidation: admin catalog mutations should call
 *   revalidateTag('build-list-refs')
 * after any UPDATE / INSERT / DELETE on the referenced tables. Until that
 * wiring exists, cached entries simply expire after 1 hour.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton anon client. No cookies, no auth — pure read of public reference
// data. Lives at module scope so we don't reconnect on every cache miss.
let _anon: ReturnType<typeof createSupabaseClient> | null = null;
function anon() {
  if (_anon) return _anon;
  _anon = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _anon;
}

export type FilterOption = { value: string; label: string; sublabel?: string };
export type FilterDataPayload = {
  accountTypes: FilterOption[];
  locationTypes: FilterOption[];
  amsOptions: FilterOption[];
  managementLevels: FilterOption[];
  contactTitleRoles: FilterOption[];
  departments: FilterOption[];
  states: FilterOption[];
  metroAreas: FilterOption[];
  carriers: FilterOption[];
  affiliations: FilterOption[];
  industries: FilterOption[];
};

/**
 * Cached fetch of all reference-data tables consumed by the BuildListForm.
 * 1-hour TTL; revalidate via revalidateTag('build-list-refs').
 */
export const getBuildListFilterData = unstable_cache(
  async (): Promise<FilterDataPayload> => {
    const supabase = anon();
    const [
      accountTypes, locationTypes, ams, mgmt, titles, depts,
      statesUS, statesCA, metros, carriers, affiliations, sic,
    ] = await Promise.all([
      supabase.from("account_types").select("id,code,label,sort_order").eq("active", true).order("sort_order"),
      supabase.from("location_types").select("id,code,name,sort_order").order("sort_order"),
      supabase.from("agency_management_systems").select("id,code,label,sort_order").eq("active", true).order("label"),
      supabase.from("management_levels").select("id,name,sort_order").order("sort_order"),
      supabase.from("contact_title_roles").select("id,name,sort_order").order("sort_order"),
      supabase.from("departments").select("id,name,sort_order").order("sort_order"),
      supabase.from("states").select("id,code,name,country").eq("country", "US").order("sort_order"),
      supabase.from("states").select("id,code,name,country").eq("country", "CA").order("sort_order"),
      supabase.from("metro_areas").select("id,code,name").order("name"),
      supabase.rpc("list_carriers_with_appointments"),
      supabase.from("affiliations").select("id,canonical_name,type").eq("active", true).order("canonical_name"),
      supabase.from("sic_codes").select("id,sic_code,description").order("sic_code").limit(1000),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accountTypes:     (accountTypes.data ?? []).map((x: any) => ({ value: x.id, label: x.label })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locationTypes:    (locationTypes.data ?? []).map((x: any) => ({ value: x.id, label: x.name })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amsOptions:       (ams.data ?? []).map((x: any) => ({ value: x.id, label: x.label })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      managementLevels: (mgmt.data ?? []).map((x: any) => ({ value: x.id, label: x.name })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contactTitleRoles:(titles.data ?? []).map((x: any) => ({ value: x.id, label: x.name })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      departments:      (depts.data ?? []).map((x: any) => ({ value: x.id, label: x.name })),
      states: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(statesUS.data ?? []).map((x: any) => ({ value: x.id, label: x.name, sublabel: "US" })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(statesCA.data ?? []).map((x: any) => ({ value: x.id, label: x.name, sublabel: "CA" })),
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metroAreas:       (metros.data ?? []).map((x: any) => ({ value: x.id, label: x.name })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      carriers:         (carriers.data ?? []).map((x: any) => ({ value: x.id, label: x.name, sublabel: x.group_name ?? undefined })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      affiliations:     (affiliations.data ?? []).map((x: any) => ({ value: x.id, label: x.canonical_name, sublabel: x.type })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      industries:       (sic.data ?? []).map((x: any) => ({ value: x.id, label: `${x.sic_code}${x.description ? " — " + x.description : ""}` })),
    };
  },
  ["build-list-filter-data"],
  { revalidate: 3600, tags: ["build-list-refs"] },
);

/**
 * Same payload + same TTL as the build-list cache, but exposed for any
 * other page that wants vertical_markets only.
 */
export const getVerticalMarkets = unstable_cache(
  async () => {
    const supabase = anon();
    const { data } = await supabase
      .from("vertical_markets")
      .select("id,slug,name,description,icon_key,color_token,sort_order")
      .eq("active", true)
      .order("sort_order");
    return data ?? [];
  },
  ["vertical-markets"],
  { revalidate: 3600, tags: ["build-list-refs", "verticals-refs"] },
);
