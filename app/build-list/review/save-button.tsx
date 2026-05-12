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
    const supabase = await createClient();
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
    // Single RPC handles all filter joins server-side and returns the 3 counts.
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

async function computeCountsForFilter(
  supabase: Awaited<ReturnType<typeof createClient>>,
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

    let stateCodes: string[] = [];
    if (stateIds.length) {
      const { data: states } = await supabase.from("states").select("code").in("id", stateIds);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stateCodes = (states ?? []).map((s: any) => s.code).filter(Boolean);
    }

    // Single server-side RPC replaces the broken JS materialization that blew
    // up the URL with .in("id", agencyIds) for high-count carriers.
    const { data } = await supabase.rpc("get_save_summary_counts", {
      p_carrier_ids:        carrierIds.length     ? carrierIds     : null,
      p_affiliation_ids:    affiliationIds.length ? affiliationIds : null,
      p_sic_ids:            sicIds.length         ? sicIds         : null,
      p_account_type_ids:   accountTypeIds.length ? accountTypeIds : null,
      p_location_type_ids:  locationTypeIds.length? locationTypeIds: null,
      p_ams_ids:            amsIds.length         ? amsIds         : null,
      p_state_codes:        stateCodes.length     ? stateCodes     : null,
      p_country:            country ? (COUNTRY_MAP[country] ?? country) : null,
      p_premium_min:        premiumMin,
      p_premium_max:        premiumMax,
      p_revenue_min:        revenueMin,
      p_revenue_max:        revenueMax,
      p_emp_min:            empMin,
      p_emp_max:            empMax,
      p_minority:           minority === "yes" ? true : minority === "no" ? false : null,
      p_account_name:       accountName || null,
      p_account_name_mode:  "contains",
    });
    const row = Array.isArray(data) ? data[0] : null;
    return {
      accounts:          Number(row?.accounts ?? 0),
      contacts:          Number(row?.contacts ?? 0),
      contactsWithEmail: Number(row?.contacts_with_email ?? 0),
    };
  } catch {
    return { accounts: 0, contacts: 0, contactsWithEmail: 0 };
  }
}
