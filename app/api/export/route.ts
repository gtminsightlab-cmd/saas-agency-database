import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceUsageOrRespond } from "@/lib/usage/enforce";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/export?list=<saved_list_id>[&format=csv]
 *
 * Streams a CSV of agencies matching the saved list's stored filters.
 * Auth: existing session cookie (super_admin or list owner).
 * Cap: counts as one `export` action; hard cap returns 429 with Retry-After.
 *
 * Token-based auth (per-user export keys for Zapier) deferred to v2 — once
 * the api_tokens table lands the auth path branches on `?token=…`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const listId = url.searchParams.get("list");
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();

  if (!listId) {
    return NextResponse.json(
      { error: "missing_list_param", message: "GET /api/export?list=<saved_list_id>" },
      { status: 400 }
    );
  }
  if (format !== "csv") {
    return NextResponse.json(
      { error: "unsupported_format", message: "Only format=csv is supported." },
      { status: 400 }
    );
  }

  // Cap enforcement BEFORE we do the work
  const blocked = await enforceUsageOrRespond("export", 1, {
    route: "/api/export",
    list_id: listId,
    format,
  });
  if (blocked) return blocked;

  const supabase = createClient();

  // Auth check — must be a logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Look up the saved list (RLS limits to caller's tenant)
  const { data: saved, error: listErr } = await supabase
    .from("saved_lists")
    .select("id,name,filter_json,user_id,tenant_id")
    .eq("id", listId)
    .maybeSingle();
  if (listErr || !saved) {
    return NextResponse.json(
      { error: "list_not_found", message: "Saved list not found or you don't have access." },
      { status: 404 }
    );
  }

  // Decode the stored querystring back into URLSearchParams
  const filterJson = (saved.filter_json ?? {}) as { querystring?: string };
  const qs = new URLSearchParams(filterJson.querystring ?? "");

  // Build the agency query from the same filter shape the review page uses
  const csvRows = await runAgencyQuery(supabase, qs);

  const filename = sanitizeFilename(saved.name ?? `export-${listId.slice(0, 8)}`);
  return new Response(csvRows, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/* ---------------- query + CSV building ---------------- */

const CSV_COLUMNS = [
  "agency_id",
  "agency_name",
  "address_line1",
  "city",
  "state",
  "zip",
  "country",
  "main_phone",
  "fax",
  "primary_url",
  "premium_pc",
  "revenue_total",
  "employees_total",
  "minority_owned",
] as const;

const COUNTRY_MAP: Record<string, string> = { US: "USA", CA: "CAN" };

function csvNum(v: string | null | undefined) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function runAgencyQuery(
  supabase: ReturnType<typeof createClient>,
  qs: URLSearchParams
): Promise<string> {
  // Direct filters
  const accountTypeIds = (qs.get("at") ?? "").split(",").filter(Boolean);
  const locationTypeIds = (qs.get("lt") ?? "").split(",").filter(Boolean);
  const amsIds = (qs.get("ams") ?? "").split(",").filter(Boolean);
  const country = qs.get("c");
  const stateIds = (qs.get("st") ?? "").split(",").filter(Boolean);
  const accountName = qs.get("name") ?? null;
  const minority = qs.get("min") ?? null;
  const premiumMin = csvNum(qs.get("pmin"));
  const premiumMax = csvNum(qs.get("pmax"));
  const revenueMin = csvNum(qs.get("rmin"));
  const revenueMax = csvNum(qs.get("rmax"));
  const empMin = csvNum(qs.get("emin"));
  const empMax = csvNum(qs.get("emax"));

  let q = supabase
    .from("agencies")
    .select(
      "id,name,address_line1,city,state,zip,country,main_phone,fax,primary_url,premium_pc,revenue_total,employees_total,minority_owned,account_type_id,location_type_id,agency_mgmt_system_id"
    )
    .order("name")
    .limit(50000);

  if (accountTypeIds.length) q = q.in("account_type_id", accountTypeIds);
  if (locationTypeIds.length) q = q.in("location_type_id", locationTypeIds);
  if (amsIds.length) q = q.in("agency_mgmt_system_id", amsIds);
  if (country) q = q.eq("country", COUNTRY_MAP[country] ?? country);
  if (accountName) q = q.ilike("name", `%${accountName}%`);
  if (minority === "yes") q = q.eq("minority_owned", true);
  if (minority === "no") q = q.eq("minority_owned", false);
  if (premiumMin != null) q = q.gte("premium_pc", premiumMin);
  if (premiumMax != null) q = q.lte("premium_pc", premiumMax);
  if (revenueMin != null) q = q.gte("revenue_total", revenueMin);
  if (revenueMax != null) q = q.lte("revenue_total", revenueMax);
  if (empMin != null) q = q.gte("employees_total", empMin);
  if (empMax != null) q = q.lte("employees_total", empMax);

  // State filter via state_id lookup
  if (stateIds.length) {
    const { data: states } = await supabase.from("states").select("code").in("id", stateIds);
    const codes = (states ?? []).map((s: any) => s.code).filter(Boolean);
    if (codes.length) q = q.in("state", codes);
  }

  const { data, error } = await q;
  if (error) {
    return [
      `# error: ${error.message}`,
      CSV_COLUMNS.join(","),
    ].join("\n");
  }

  const lines: string[] = [CSV_COLUMNS.join(",")];
  for (const r of (data ?? []) as any[]) {
    lines.push(
      [
        r.id,
        r.name,
        r.address_line1,
        r.city,
        r.state,
        r.zip,
        r.country,
        r.main_phone,
        r.fax,
        r.primary_url,
        r.premium_pc,
        r.revenue_total,
        r.employees_total,
        r.minority_owned === true ? "yes" : r.minority_owned === false ? "no" : "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  return lines.join("\n") + "\n";
}

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "export";
}
