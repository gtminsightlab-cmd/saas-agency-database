/**
 * Load an AdList xlsx workbook into Supabase.
 *
 * Reads the workbook with SheetJS, normalizes columns, then UPSERTs into
 * agencies / contacts / agency_carriers / agency_affiliations / agency_sic_codes
 * via the Supabase service-role key. Idempotent: safe to re-run on the same
 * file. Uses the vendor's AccountId as the dedup key on agencies (UNIQUE
 * constraint on (tenant_id, account_id)) so duplicates from prior loads
 * become UPDATEs rather than failed INSERTs.
 *
 * Usage:
 *   SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *   TENANT_ID=ce52fe1e-aac7-4eee-8712-77e71e2837ce  (Echelon — default)
 *   npx tsx scripts/load-adlist.ts "data/AdList-17019 IN.xlsx"
 *   npx tsx scripts/load-adlist.ts "data/AdList-17019 *.xlsx"   (glob via shell)
 *
 * On overlap with existing rows, ON CONFLICT DO UPDATE uses COALESCE so
 * existing non-null fields are preserved when the new file has NULL.
 *
 * Required deps: xlsx, @supabase/supabase-js (already in package.json),
 * tsx (run via npx, no install needed).
 */

import * as XLSX from "xlsx";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Env + config
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TENANT_ID =
  process.env.TENANT_ID ?? "ce52fe1e-aac7-4eee-8712-77e71e2837ce";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (NOT the anon key)."
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// Reference-data lookup tables (label → UUID). Built at runtime from DB.
// ---------------------------------------------------------------------------
type RefMap = Map<string, string>;
const refs: {
  accountTypes: RefMap;
  locationTypes: RefMap;
  ams: RefMap;
  amsOtherId: string;
  carrierByNorm: RefMap;
  affiliationByNorm: RefMap;
  sicByCode: RefMap;
} = {
  accountTypes: new Map(),
  locationTypes: new Map(),
  ams: new Map(),
  amsOtherId: "",
  carrierByNorm: new Map(),
  affiliationByNorm: new Map(),
  sicByCode: new Map(),
};

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

type CanaryRow = {
  id: string;
  source: string | null;
  kind: string;
  match_mode: string | null;
  pattern: string;
  active: boolean;
};
let canaries: CanaryRow[] = [];

function digitsOnly(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).replace(/[^\d]/g, "");
}

function lc(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).toLowerCase();
}

/** Returns the matched canary if the row trips any active pattern, else null. */
function scrubAgency(row: AgencyRow): CanaryRow | null {
  const name = lc(row.name);
  const email = lc(row.email);
  const fax = digitsOnly(row.fax);
  const phones = [
    digitsOnly(row.main_phone),
    digitsOnly(row.work_phone),
    digitsOnly(row.toll_free),
  ];
  for (const c of canaries) {
    if (!c.active) continue;
    const pat = c.pattern.toLowerCase();
    const mode = (c.match_mode ?? "exact").toLowerCase();
    if (c.kind === "agency_name") {
      if (mode === "contains" && name.includes(pat)) return c;
      if (mode === "exact" && name === pat) return c;
    } else if (c.kind === "email") {
      if (mode === "exact" && email === pat) return c;
      if (mode === "contains" && (email.includes(pat) || pat.includes(email) === false && pat.startsWith("%") && pat.endsWith("%") && email.includes(pat.slice(1, -1)))) return c;
      if (mode === "contains" && email.includes(pat.replace(/%/g, ""))) return c;
      if (mode === "domain" && email.endsWith("@" + pat)) return c;
    } else if (c.kind === "phone") {
      if (phones.includes(pat) || phones.includes(c.pattern)) return c;
    } else if (c.kind === "fax") {
      if (fax === pat || fax === c.pattern) return c;
    }
  }
  return null;
}

function scrubContact(row: ContactRow): CanaryRow | null {
  const first = lc((row as any).first_name);
  const last = lc((row as any).last_name);
  const full = (first + " " + last).trim();
  const email1 = lc((row as any).email_primary);
  const email2 = lc((row as any).email_secondary);
  const fax = digitsOnly((row as any).fax);
  const phones = [
    digitsOnly((row as any).mobile_phone),
    digitsOnly((row as any).work_phone),
    digitsOnly((row as any).toll_free),
  ];
  for (const c of canaries) {
    if (!c.active) continue;
    const pat = c.pattern.toLowerCase();
    const mode = (c.match_mode ?? "exact").toLowerCase();
    if (c.kind === "email") {
      if (mode === "exact" && (email1 === pat || email2 === pat)) return c;
      if (mode === "contains") {
        const sub = pat.replace(/%/g, "");
        if (email1.includes(sub) || email2.includes(sub)) return c;
      }
      if (mode === "domain" && (email1.endsWith("@" + pat) || email2.endsWith("@" + pat))) return c;
    } else if (c.kind === "phone") {
      if (phones.includes(pat) || phones.includes(c.pattern)) return c;
    } else if (c.kind === "fax") {
      if (fax === pat || fax === c.pattern) return c;
    } else if (c.kind === "contact_name_in_agency") {
      // Pattern is stored as "rocky zito|abc insurance" — split on |.
      const [namePart, agencyPart] = pat.split("|").map((x) => x.trim());
      // Contact-side scrub matches on full name only (we don't have the agency here).
      if (mode === "exact" && full === namePart) return c;
      if (mode === "contains" && full.includes(namePart)) return c;
      void agencyPart; // agency match happens on agency-side scrub
    }
  }
  return null;
}

async function loadCanaries() {
  const { data, error } = await supabase
    .from("data_load_denylist")
    .select("id, source, kind, match_mode, pattern, active")
    .eq("active", true);
  if (error) throw error;
  canaries = (data ?? []) as CanaryRow[];
  console.log(`[canaries] ${canaries.length} active patterns loaded`);
}

async function loadRefs() {
  const [ats, lts, amss, carriers, affs, sics] = await Promise.all([
    supabase.from("account_types").select("id,code,label").eq("active", true),
    supabase.from("location_types").select("id,code,name"),
    supabase.from("agency_management_systems").select("id,code,label").eq("active", true),
    supabase.from("carriers").select("id,name").eq("active", true),
    supabase.from("affiliations").select("id,canonical_name").eq("active", true),
    supabase.from("sic_codes").select("id,sic_code"),
  ]);

  for (const r of (ats.data ?? []) as any[]) refs.accountTypes.set(r.label.toLowerCase(), r.id);
  for (const r of (lts.data ?? []) as any[]) {
    refs.locationTypes.set(r.name.toLowerCase(), r.id);
    refs.locationTypes.set(r.code.toLowerCase(), r.id);
  }
  for (const r of (amss.data ?? []) as any[]) {
    refs.ams.set(r.label.toLowerCase(), r.id);
    refs.ams.set(r.code.toLowerCase(), r.id);
    if (r.code === "OTHER" || r.label.toLowerCase() === "other") refs.amsOtherId = r.id;
  }
  for (const r of (carriers.data ?? []) as any[]) refs.carrierByNorm.set(norm(r.name), r.id);
  for (const r of (affs.data ?? []) as any[]) refs.affiliationByNorm.set(norm(r.canonical_name), r.id);
  for (const r of (sics.data ?? []) as any[]) refs.sicByCode.set(String(r.sic_code), r.id);

  console.log(
    `[refs] account_types=${refs.accountTypes.size} location_types=${refs.locationTypes.size} ams=${refs.ams.size} carriers=${refs.carrierByNorm.size} affiliations=${refs.affiliationByNorm.size} sic_codes=${refs.sicByCode.size}`
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function s(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}
function ph(v: unknown): string | null {
  const t = s(v);
  if (!t) return null;
  const cleaned = t.replace(/[^\d+]/g, "");
  return cleaned || null;
}
function n(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const x = typeof v === "number" ? v : parseFloat(String(v));
  return isFinite(x) ? x : null;
}
function i(v: unknown): number | null {
  const x = n(v);
  return x === null ? null : Math.round(x);
}

function resolveAt(label: string | null): string | null {
  if (!label) return null;
  return refs.accountTypes.get(label.toLowerCase()) ?? null;
}
function resolveLt(label: string | null): string | null {
  if (!label) return null;
  return refs.locationTypes.get(label.toLowerCase()) ?? null;
}
function resolveAms(label: string | null): string {
  if (!label) return refs.amsOtherId;
  return refs.ams.get(label.toLowerCase()) ?? refs.amsOtherId;
}

// ---------------------------------------------------------------------------
// Workbook → row arrays
// ---------------------------------------------------------------------------
type AgencyRow = Record<string, unknown>;
type ContactRow = Record<string, unknown>;
type LinkRow = { account_id: string; key: string };

function parseWorkbook(filePath: string) {
  const buf = fs.readFileSync(filePath);
  const wb = XLSX.read(buf, { cellDates: true });

  const get = (sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [] as Record<string, unknown>[];
    return XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
  };

  const accountSheet = get("Account");
  const contactSheet = get("Contact");
  const carrierSheet = get("Carriers");
  const affiliationSheet = get("Affiliations");
  const industrySheet = get("Industries");

  const agencies: AgencyRow[] = accountSheet
    .filter((r) => s(r["AccountId"]))
    .map((r) => ({
      tenant_id: TENANT_ID,
      account_id: s(r["AccountId"]),
      name: s(r["Account"]),
      parent_name: s(r["Parent"]),
      address_1: s(r["Address1"]),
      address_2: s(r["Address2"]),
      city: s(r["City"]),
      state: s(r["State"]),
      postal_code: s(r["PostalCode"]),
      county: s(r["County"]),
      country: s(r["Country"]) ?? "USA",
      msa: s(r["Msa"] ?? r["MSA"]),
      county_code: s(r["CountyCode"]),
      main_phone: ph(r["MainPhone"]),
      work_phone: ph(r["WorkPhone"]),
      phone_extension: s(r["PhoneExtension"]),
      fax: ph(r["Fax"]),
      toll_free: ph(r["TollFree"]),
      web_address: s(r["WebAddress"]),
      email: s(r["Email"]),
      revenue: n(r["Revenue"]),
      percent_commission: n(r["PercentComm"]),
      employees: i(r["Employees"]),
      premium_volume: n(r["PremiumVolume"]),
      num_locations: i(r["Num_Locations"]),
      branch_indicator: s(r["BranchIndicator"]),
      special_lines: s(r["SpLines"]),
      duns_number: s(r["DunsNum"]),
      twitter_url: s(r["Twitter"]),
      facebook_url: s(r["Facebook"]),
      gmb_url: s(r["GMB"]),
      youtube_url: s(r["Youtube"]),
      linkedin_url: s(r["Linkedin"]),
      account_type_id: resolveAt(s(r["AccountType"])),
      agency_mgmt_system_id: resolveAms(s(r["AgencyManagement"])),
      location_type_id: resolveLt(s(r["BranchIndicator"])),
    }));

  const contacts: ContactRow[] = contactSheet
    .filter((r) => s(r["AccountId"]))
    .map((r) => ({
      _account_id: s(r["AccountId"]),
      tenant_id: TENANT_ID,
      first_name: s(r["FirstName"]),
      last_name: s(r["LastName"]),
      suffix: s(r["Suffix"]),
      title: s(r["Title"]),
      title_search: s(r["TitleSearch"]),
      department: s(r["Department"]),
      line_search: s(r["LineSearch"]),
      level_of_management: s(r["LevelOfManagement"]),
      email_primary: s(r["CEmail"]),
      email_secondary: s(r["CEmail2"]),
      mobile_phone: ph(r["Mobile"]),
      work_phone: ph(r["WorkPhone"]),
      fax: ph(r["Fax"]),
      toll_free: ph(r["TollFree"]),
      address_1: s(r["Address1"]),
      city: s(r["City"]),
      state: s(r["State"]),
      postal_code: s(r["PostCode"] ?? r["PostalCode"]),
      country: s(r["Country"]),
      msa: s(r["MSA"] ?? r["Msa"]),
      is_primary: String(r["IsPrimary"] ?? "").trim().toLowerCase() === "yes",
    }));

  const carriers: LinkRow[] = carrierSheet
    .filter((r) => s(r["AccountId"]) && s(r["CompanyLine"]))
    .map((r) => ({ account_id: s(r["AccountId"])!, key: norm(s(r["CompanyLine"])!) }));

  const affiliations: LinkRow[] = affiliationSheet
    .filter((r) => s(r["AccountId"]) && s(r["SpecialAffiliation"]))
    .map((r) => ({ account_id: s(r["AccountId"])!, key: norm(s(r["SpecialAffiliation"])!) }));

  const sics: { account_id: string; sic_code: string }[] = industrySheet
    .filter((r) => s(r["AccountId"]) && s(r["SicCode"]))
    .map((r) => ({ account_id: s(r["AccountId"])!, sic_code: String(r["SicCode"]).trim() }));

  return { agencies, contacts, carriers, affiliations, sics };
}

// ---------------------------------------------------------------------------
// Upsert helpers
// ---------------------------------------------------------------------------
async function upsertAgencies(rows: AgencyRow[]) {
  // ON CONFLICT (tenant_id, account_id) DO UPDATE — supabase-js doesn't expose
  // COALESCE on conflict, so we do a 2-step: fetch existing rows, merge in JS,
  // then upsert with the merged record. This preserves existing non-null
  // fields when the new file has gaps.
  const accountIds = rows.map((r) => r.account_id as string);
  const existing = new Map<string, AgencyRow>();
  // Batch the IN() query to avoid URL-length limits.
  for (let i = 0; i < accountIds.length; i += 200) {
    const slice = accountIds.slice(i, i + 200);
    const { data, error } = await supabase
      .from("agencies")
      .select("*")
      .eq("tenant_id", TENANT_ID)
      .in("account_id", slice);
    if (error) throw error;
    for (const r of data ?? []) existing.set((r as any).account_id, r as AgencyRow);
  }

  const merged = rows.map((newRow) => {
    const oldRow = existing.get(newRow.account_id as string);
    if (!oldRow) return newRow;
    const out: AgencyRow = { ...oldRow };
    for (const [k, v] of Object.entries(newRow)) {
      if (v !== null && v !== undefined && v !== "") out[k] = v;
    }
    // Drop server-managed columns. Including id in the upsert payload while
    // mixing matched + unmatched rows in the same batch caused PostgREST to
    // reject INSERT-path rows with NOT NULL on id (default gen_random_uuid()
    // wasn't firing). Letting Postgres handle id and timestamps on its own:
    //   - on INSERT: id defaults via gen_random_uuid(), timestamps via now()
    //   - on UPDATE (conflict): unmentioned columns are not touched
    delete (out as any).id;
    delete (out as any).created_at;
    delete (out as any).updated_at;
    return out;
  });

  // Within-batch dedupe by (tenant_id, account_id). PostgREST rejects upsert
  // when the same conflict tuple appears twice in one INSERT (saw this in
  // sync_to_agency_signal.py earlier). For agency files with duplicate
  // AccountIds (multi-region branch rows), keep the last occurrence.
  const seen_acct = new Map<string, number>();
  for (let i = 0; i < merged.length; i++) {
    const k = `${merged[i].tenant_id}|${merged[i].account_id}`;
    seen_acct.set(k, i);
  }
  const merged_dedup = Array.from(seen_acct.values()).sort((a, b) => a - b).map((i) => merged[i]);

  let inserted = 0;
  let updated = 0;
  for (let i = 0; i < merged_dedup.length; i += 100) {
    const slice = merged_dedup.slice(i, i + 100);
    const { data, error } = await supabase
      .from("agencies")
      .upsert(slice, { onConflict: "tenant_id,account_id" })
      .select("account_id");
    if (error) throw error;
    for (const r of data ?? []) {
      if (existing.has((r as any).account_id)) updated++;
      else inserted++;
    }
  }
  return { inserted, updated, total: merged_dedup.length };
}

async function upsertContacts(rows: ContactRow[]) {
  // Need to resolve _account_id → agencies.id, then dedupe on (agency_id, lower(first_name+last_name+email_primary)) before insert.
  const accountIds = Array.from(new Set(rows.map((r) => r._account_id as string)));
  const agencyByAcct = new Map<string, string>();
  for (let i = 0; i < accountIds.length; i += 200) {
    const slice = accountIds.slice(i, i + 200);
    const { data, error } = await supabase
      .from("agencies")
      .select("id, account_id")
      .eq("tenant_id", TENANT_ID)
      .in("account_id", slice);
    if (error) throw error;
    for (const r of data ?? []) agencyByAcct.set((r as any).account_id, (r as any).id);
  }

  const enriched = rows
    .map((r) => {
      const agencyId = agencyByAcct.get(r._account_id as string);
      if (!agencyId) return null;
      const out: any = { ...r, agency_id: agencyId };
      delete out._account_id;
      return out;
    })
    .filter((x): x is any => x !== null);

  // Build dedupe key per row
  const keyOf = (r: any) =>
    `${r.agency_id}|${(r.first_name ?? "").toLowerCase()}|${(r.last_name ?? "").toLowerCase()}|${(r.email_primary ?? "").toLowerCase()}`;

  // Pull existing contacts for these agencies to avoid dup inserts
  const agencyIds = Array.from(new Set(enriched.map((r) => r.agency_id as string)));
  const existingKeys = new Set<string>();
  for (let i = 0; i < agencyIds.length; i += 200) {
    const slice = agencyIds.slice(i, i + 200);
    const { data, error } = await supabase
      .from("contacts")
      .select("agency_id, first_name, last_name, email_primary")
      .in("agency_id", slice);
    if (error) throw error;
    for (const r of data ?? []) existingKeys.add(keyOf(r));
  }

  const fresh = enriched.filter((r) => !existingKeys.has(keyOf(r)));
  let inserted = 0;
  for (let i = 0; i < fresh.length; i += 100) {
    const slice = fresh.slice(i, i + 100);
    const { error } = await supabase.from("contacts").insert(slice);
    if (error) throw error;
    inserted += slice.length;
  }
  return { inserted, skipped: enriched.length - fresh.length, total: enriched.length };
}

async function upsertLinks(
  table: "agency_carriers" | "agency_affiliations" | "agency_sic_codes",
  fkColumn: "carrier_id" | "affiliation_id" | "sic_code_id",
  rows: { account_id: string; key?: string; sic_code?: string }[]
) {
  // Resolve agency UUID + reference UUID per row, then INSERT ... ON CONFLICT DO NOTHING.
  const accountIds = Array.from(new Set(rows.map((r) => r.account_id)));
  const agencyByAcct = new Map<string, string>();
  for (let i = 0; i < accountIds.length; i += 200) {
    const slice = accountIds.slice(i, i + 200);
    const { data, error } = await supabase
      .from("agencies")
      .select("id, account_id")
      .eq("tenant_id", TENANT_ID)
      .in("account_id", slice);
    if (error) throw error;
    for (const r of data ?? []) agencyByAcct.set((r as any).account_id, (r as any).id);
  }

  const refMap =
    table === "agency_carriers" ? refs.carrierByNorm
    : table === "agency_affiliations" ? refs.affiliationByNorm
    : refs.sicByCode;

  const inserts: any[] = [];
  let unmatchedRef = 0;
  let unmatchedAgency = 0;
  for (const r of rows) {
    const agencyId = agencyByAcct.get(r.account_id);
    if (!agencyId) { unmatchedAgency++; continue; }
    const refKey = table === "agency_sic_codes" ? r.sic_code! : r.key!;
    const refId = refMap.get(refKey);
    if (!refId) { unmatchedRef++; continue; }
    inserts.push({ tenant_id: TENANT_ID, agency_id: agencyId, [fkColumn]: refId });
  }

  // De-dup within this batch
  const seen = new Set<string>();
  const unique = inserts.filter((r) => {
    const k = `${r.agency_id}|${r[fkColumn]}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  let inserted = 0;
  for (let i = 0; i < unique.length; i += 500) {
    const slice = unique.slice(i, i + 500);
    const { error } = await supabase
      .from(table)
      .upsert(slice, { onConflict: `agency_id,${fkColumn}`, ignoreDuplicates: true });
    if (error) throw error;
    inserted += slice.length;
  }
  return { inserted, unmatchedRef, unmatchedAgency, total: rows.length };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function loadFile(filePath: string) {
  const t0 = Date.now();
  console.log(`\n=== ${path.basename(filePath)} ===`);
  const parsed = parseWorkbook(filePath);
  console.log(
    `[parse] agencies=${parsed.agencies.length} contacts=${parsed.contacts.length} carriers=${parsed.carriers.length} affiliations=${parsed.affiliations.length} sics=${parsed.sics.length}`
  );

  // Canary scrub
  const cleanAgencies: AgencyRow[] = [];
  let scrubbedAgencies = 0;
  const blockedAccountIds = new Set<string>();
  for (const r of parsed.agencies as AgencyRow[]) {
    const hit = scrubAgency(r);
    if (hit) {
      scrubbedAgencies++;
      blockedAccountIds.add(r.account_id as string);
      console.log(`  [scrub] agency BLOCKED: account_id=${r.account_id} name='${r.name}' canary='${hit.source}' pattern='${hit.pattern}'`);
    } else {
      cleanAgencies.push(r);
    }
  }
  const cleanContacts: ContactRow[] = [];
  let scrubbedContacts = 0;
  for (const r of parsed.contacts as ContactRow[]) {
    // Drop contacts whose agency was blocked (cascade) OR whose own fields trip a pattern.
    if (blockedAccountIds.has((r as any)._account_id)) {
      scrubbedContacts++;
      continue;
    }
    const hit = scrubContact(r);
    if (hit) {
      scrubbedContacts++;
      console.log(`  [scrub] contact BLOCKED: account_id=${(r as any)._account_id} name='${(r as any).first_name} ${(r as any).last_name}' canary='${hit.source}'`);
    } else {
      cleanContacts.push(r);
    }
  }
  // Drop link rows whose agency was blocked
  const cleanCarriers = parsed.carriers.filter((r) => !blockedAccountIds.has(r.account_id));
  const cleanAffiliations = parsed.affiliations.filter((r) => !blockedAccountIds.has(r.account_id));
  const cleanSics = parsed.sics.filter((r) => !blockedAccountIds.has(r.account_id));
  console.log(`[scrub] blocked ${scrubbedAgencies} agencies + ${scrubbedContacts} contacts (cascading link rows)`);

  const a = await upsertAgencies(cleanAgencies);
  console.log(`[agencies] inserted=${a.inserted} updated=${a.updated} total=${a.total}`);

  const c = await upsertContacts(cleanContacts);
  console.log(`[contacts] inserted=${c.inserted} skipped_dup=${c.skipped} total=${c.total}`);

  const cl = await upsertLinks("agency_carriers", "carrier_id", cleanCarriers);
  console.log(`[carriers] linked=${cl.inserted} unmatched_ref=${cl.unmatchedRef} unmatched_agency=${cl.unmatchedAgency} total=${cl.total}`);

  const al = await upsertLinks("agency_affiliations", "affiliation_id", cleanAffiliations);
  console.log(`[affiliations] linked=${al.inserted} unmatched_ref=${al.unmatchedRef} unmatched_agency=${al.unmatchedAgency} total=${al.total}`);

  const sl = await upsertLinks("agency_sic_codes", "sic_code_id", cleanSics);
  console.log(`[sic_codes] linked=${sl.inserted} unmatched_ref=${sl.unmatchedRef} unmatched_agency=${sl.unmatchedAgency} total=${sl.total}`);

  console.log(`[done] ${path.basename(filePath)} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: tsx scripts/load-adlist.ts <file1.xlsx> [file2.xlsx ...]");
    process.exit(1);
  }
  await loadRefs();
  await loadCanaries();
  for (const f of args) {
    if (!fs.existsSync(f)) {
      console.error(`File not found: ${f}`);
      continue;
    }
    try {
      await loadFile(f);
    } catch (err: any) {
      console.error(`[ERROR] ${f}:`, err.message ?? err);
      console.error(err.stack ?? "");
      process.exitCode = 2;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
