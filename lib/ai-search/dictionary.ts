import { createClient } from "@/lib/supabase/server";

/**
 * Server-only dictionary loader for the AI-search parser.
 *
 * Fetches the small reference tables the parser needs to resolve free-text
 * tokens to UUIDs. The shape is intentionally flat so the parser stays a
 * pure function over plain strings + UUIDs.
 *
 * Total fetch is ~1,200 rows (mostly carriers + SIC). All public reference
 * data — no tenant scoping needed.
 */
export type DictAccountType = {
  id: string;
  code: string;        // e.g. agency_mga
  label: string;       // e.g. "Agency/MGA"
};
export type DictState = {
  id: string;
  code: string;        // e.g. TX
  name: string;        // e.g. Texas
  country: "US" | "CA";
};
export type DictCarrier = {
  id: string;
  name: string;
  group_name: string | null;
};
export type DictAffiliation = {
  id: string;
  canonical_name: string;
  type: string | null;
};
export type DictLocationType = {
  id: string;
  code: string;        // headquarters | branch | single
  name: string;
};

export type AiSearchDictionary = {
  accountTypes: DictAccountType[];
  states: DictState[];
  carriers: DictCarrier[];
  affiliations: DictAffiliation[];
  locationTypes: DictLocationType[];
};

/**
 * Loads the dictionary in parallel. Safe to call on every page render — all
 * tables are tiny and most are cached in PostgREST.
 */
export async function loadAiSearchDictionary(): Promise<AiSearchDictionary> {
  const supabase = createClient();

  const [accountTypes, statesUS, statesCA, carriers, affiliations, locationTypes] =
    await Promise.all([
      supabase
        .from("account_types")
        .select("id,code,label")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("states")
        .select("id,code,name,country")
        .eq("country", "US")
        .order("sort_order"),
      supabase
        .from("states")
        .select("id,code,name,country")
        .eq("country", "CA")
        .order("sort_order"),
      supabase.rpc("list_carriers_with_appointments"),
      supabase
        .from("affiliations")
        .select("id,canonical_name,type")
        .eq("active", true)
        .order("canonical_name"),
      supabase.from("location_types").select("id,code,name"),
    ]);

  const states: DictState[] = [
    ...((statesUS.data ?? []) as DictState[]).map((s) => ({ ...s, country: "US" as const })),
    ...((statesCA.data ?? []) as DictState[]).map((s) => ({ ...s, country: "CA" as const })),
  ];

  return {
    accountTypes: (accountTypes.data ?? []) as DictAccountType[],
    states,
    carriers: ((carriers.data ?? []) as DictCarrier[]).map((c) => ({
      id: c.id,
      name: c.name,
      group_name: c.group_name,
    })),
    affiliations: (affiliations.data ?? []) as DictAffiliation[],
    locationTypes: (locationTypes.data ?? []) as DictLocationType[],
  };
}
