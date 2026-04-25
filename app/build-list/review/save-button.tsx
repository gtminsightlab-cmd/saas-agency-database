"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SaveListButton({ filterQs }: { filterQs: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You need to be signed in to save a list.");
      setSaving(false);
      return;
    }
    const { data: appUser } = await supabase
      .from("app_users")
      .select("id,tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!appUser) {
      setError("User record not found.");
      setSaving(false);
      return;
    }
    // Compute counts for the filter so they show up on /saved-lists.
    // We re-run a thinner version of the same query review/page.tsx uses:
    // intersect carrier/affiliation/SIC sets, then count agencies + contacts.
    const counts = await computeCountsForFilter(supabase, filterQs);

    const { data, error: insertError } = await supabase
      .from("saved_lists")
      .insert({
        tenant_id: appUser.tenant_id,
        user_id: appUser.id,
        name,
        filter_json: { querystring: filterQs },
        accounts_count: counts.accounts,
        contacts_count: counts.contacts,
        contacts_with_email_count: counts.contactsWithEmail,
        last_run_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setOpen(false);
    router.push(`/build-list/download?id=${data?.id ?? ""}&name=${encodeURIComponent(name)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Save
      </button>
      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-gray-900">Name your list</h3>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="mt-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 255))}
                maxLength={255}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="mt-1 text-right text-xs text-gray-400">{name.length}/255</div>
            </div>
            {error && (
              <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2"
              >
                Back
              </button>
              <button
                type="button"
                disabled={saving || !name.trim()}
                onClick={save}
                className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function defaultName() {
  const d = new Date();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${mm}-${dd}-${yyyy} ${h}:${String(m).padStart(2, "0")}${ampm}`;
}

/* ---------------- count helper ---------------- */

const COUNTRY_MAP: Record<string, string> = { US: "USA", CA: "CAN" };

function csvIds(v: string | null): string[] {
  return v ? v.split(",").filter(Boolean) : [];
}
function asNum(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function intersect<T>(sets: Set<T>[]): Set<T> {
  if (sets.length === 0) return new Set();
  const [first, ...rest] = sets;
  const out = new Set<T>(first);
  for (const s of rest) for (const v of out) if (!s.has(v)) out.delete(v);
  return out;
}

async function computeCountsForFilter(
  supabase: ReturnType<typeof createClient>,
  filterQs: string
): Promise<{ accounts: number; contacts: number; contactsWithEmail: number }> {
  try {
    const qs = new URLSearchParams(filterQs);
    const accountTypeIds = csvIds(qs.get("at"));
    const locationTypeIds = csvIds(qs.get("lt"));
    const amsIds = csvIds(qs.get("ams"));
    const carrierIds = csvIds(qs.get("cr"));
    const affiliationIds = csvIds(qs.get("af"));
    const sicIds = csvIds(qs.get("in"));
    const stateIds = csvIds(qs.get("st"));
    const country = qs.get("c");
    const accountName = qs.get("an") || qs.get("name");
    const minority = qs.get("min");
    const premiumMin = asNum(qs.get("pmin"));
    const premiumMax = asNum(qs.get("pmax"));
    const revenueMin = asNum(qs.get("rmin"));
    const revenueMax = asNum(qs.get("rmax"));
    const empMin = asNum(qs.get("emin"));
    const empMax = asNum(qs.get("emax"));

    // Resolve carrier/affiliation/SIC -> agency_id sets
    const idSets: Set<string>[] = [];
    if (carrierIds.length) {
      const { data } = await supabase.from("agency_carriers").select("agency_id").in("carrier_id", carrierIds);
      idSets.push(new Set((data ?? []).map((r: any) => r.agency_id)));
    }
    if (affiliationIds.length) {
      const { data } = await supabase.from("agency_affiliations").select("agency_id").in("affiliation_id", affiliationIds);
      idSets.push(new Set((data ?? []).map((r: any) => r.agency_id)));
    }
    if (sicIds.length) {
      const { data } = await supabase.from("agency_sic_codes").select("agency_id").in("sic_code_id", sicIds);
      idSets.push(new Set((data ?? []).map((r: any) => r.agency_id)));
    }
    let stateCodes: string[] = [];
    if (stateIds.length) {
      const { data: states } = await supabase.from("states").select("code").in("id", stateIds);
      stateCodes = (states ?? []).map((s: any) => s.code).filter(Boolean);
    }
    const allowedAgencyIds = idSets.length > 0 ? Array.from(intersect(idSets)) : null;

    // Build the agencies count query
    let agq = supabase.from("agencies").select("id", { count: "exact", head: true });
    if (accountTypeIds.length) agq = agq.in("account_type_id", accountTypeIds);
    if (locationTypeIds.length) agq = agq.in("location_type_id", locationTypeIds);
    if (amsIds.length) agq = agq.in("agency_mgmt_system_id", amsIds);
    if (country) agq = agq.eq("country", COUNTRY_MAP[country] ?? country);
    if (stateCodes.length) agq = agq.in("state", stateCodes);
    if (accountName) agq = agq.ilike("name", `%${accountName}%`);
    if (minority === "yes") agq = agq.eq("minority_owned", true);
    if (minority === "no") agq = agq.eq("minority_owned", false);
    if (premiumMin != null) agq = agq.gte("premium_volume", premiumMin);
    if (premiumMax != null) agq = agq.lte("premium_volume", premiumMax);
    if (revenueMin != null) agq = agq.gte("revenue", revenueMin);
    if (revenueMax != null) agq = agq.lte("revenue", revenueMax);
    if (empMin != null) agq = agq.gte("employees", empMin);
    if (empMax != null) agq = agq.lte("employees", empMax);
    if (allowedAgencyIds) {
      if (allowedAgencyIds.length === 0) {
        return { accounts: 0, contacts: 0, contactsWithEmail: 0 };
      }
      agq = agq.in("id", allowedAgencyIds);
    }
    const { count: agenciesCount } = await agq;
    const accounts = agenciesCount ?? 0;
    if (accounts === 0) return { accounts: 0, contacts: 0, contactsWithEmail: 0 };

    // Pull all matching agency IDs, then count contacts in that set
    let idQuery = supabase.from("agencies").select("id").limit(50_000);
    if (accountTypeIds.length) idQuery = idQuery.in("account_type_id", accountTypeIds);
    if (locationTypeIds.length) idQuery = idQuery.in("location_type_id", locationTypeIds);
    if (amsIds.length) idQuery = idQuery.in("agency_mgmt_system_id", amsIds);
    if (country) idQuery = idQuery.eq("country", COUNTRY_MAP[country] ?? country);
    if (stateCodes.length) idQuery = idQuery.in("state", stateCodes);
    if (accountName) idQuery = idQuery.ilike("name", `%${accountName}%`);
    if (minority === "yes") idQuery = idQuery.eq("minority_owned", true);
    if (minority === "no") idQuery = idQuery.eq("minority_owned", false);
    if (premiumMin != null) idQuery = idQuery.gte("premium_volume", premiumMin);
    if (premiumMax != null) idQuery = idQuery.lte("premium_volume", premiumMax);
    if (revenueMin != null) idQuery = idQuery.gte("revenue", revenueMin);
    if (revenueMax != null) idQuery = idQuery.lte("revenue", revenueMax);
    if (empMin != null) idQuery = idQuery.gte("employees", empMin);
    if (empMax != null) idQuery = idQuery.lte("employees", empMax);
    if (allowedAgencyIds) idQuery = idQuery.in("id", allowedAgencyIds);
    const { data: idRows } = await idQuery;
    const ids = (idRows ?? []).map((r: any) => r.id);
    if (ids.length === 0) return { accounts, contacts: 0, contactsWithEmail: 0 };

    const [{ count: contactsCount }, { count: contactsWithEmailCount }] = await Promise.all([
      supabase.from("contacts").select("id", { count: "exact", head: true }).in("agency_id", ids),
      supabase.from("contacts").select("id", { count: "exact", head: true })
        .in("agency_id", ids).not("email_primary", "is", null).neq("email_primary", ""),
    ]);

    return {
      accounts,
      contacts: contactsCount ?? 0,
      contactsWithEmail: contactsWithEmailCount ?? 0,
    };
  } catch {
    return { accounts: 0, contacts: 0, contactsWithEmail: 0 };
  }
}
