// D-023 Pillar 6 / BACKLOG #1 — Delta CSV export for a saved list
//
// GET /api/saved-lists/[id]/delta-export
//
// Returns CSV of saved_list_changes since last_acknowledged_at (or all if
// never acknowledged), with hydrated agency/contact fields. Inline-clears
// has_updates and stamps last_acknowledged_at on successful build.
//
// RLS scopes saved_list_changes / agencies / contacts to caller's tenant.

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvEscape).join(",");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return new Response(JSON.stringify({ error: "missing list id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createClient();

  // Fetch the saved list (RLS-scoped). Need name + last_acknowledged_at.
  const { data: list, error: listError } = await supabase
    .from("saved_lists")
    .select("id, name, last_acknowledged_at")
    .eq("id", id)
    .maybeSingle();

  if (listError) {
    return new Response(JSON.stringify({ error: listError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!list) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch changes since last acknowledgment (or all if never acked).
  let changesQuery = supabase
    .from("saved_list_changes")
    .select("change_type, entity_type, entity_id, detected_at")
    .eq("saved_list_id", id)
    .order("detected_at", { ascending: true });

  if (list.last_acknowledged_at) {
    changesQuery = changesQuery.gt("detected_at", list.last_acknowledged_at);
  }

  const { data: changes, error: changesError } = await changesQuery;
  if (changesError) {
    return new Response(JSON.stringify({ error: changesError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = changes ?? [];

  // Collect entity IDs for hydration
  const agencyIds = Array.from(
    new Set(rows.filter((r) => r.entity_type === "agency").map((r) => r.entity_id)),
  );
  const contactIds = Array.from(
    new Set(rows.filter((r) => r.entity_type === "contact").map((r) => r.entity_id)),
  );

  // Hydrate agencies (batch to stay well under PostgREST 16KB header cap;
  // memory: feedback_postgrest_in_filter_header_cap.md — 150 UUID safe batch).
  const agencyMap = new Map<string, any>();
  if (agencyIds.length) {
    const BATCH = 150;
    for (let i = 0; i < agencyIds.length; i += BATCH) {
      const batch = agencyIds.slice(i, i + BATCH);
      const { data, error } = await supabase
        .from("agencies")
        .select("id, name, state, main_phone, web_address, email")
        .in("id", batch);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      for (const a of data ?? []) agencyMap.set(a.id, a);
    }
  }

  // Hydrate contacts + their agency context
  const contactMap = new Map<string, any>();
  const contactAgencyIds = new Set<string>();
  if (contactIds.length) {
    const BATCH = 150;
    for (let i = 0; i < contactIds.length; i += BATCH) {
      const batch = contactIds.slice(i, i + BATCH);
      const { data, error } = await supabase
        .from("contacts")
        .select(
          "id, first_name, last_name, title, email_primary, mobile_phone, work_phone, state, agency_id",
        )
        .in("id", batch);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      for (const c of data ?? []) {
        contactMap.set(c.id, c);
        if (c.agency_id) contactAgencyIds.add(c.agency_id);
      }
    }
    // Hydrate the agencies referenced by these contacts (those not already loaded)
    const missingAgencyIds = Array.from(contactAgencyIds).filter(
      (aid) => !agencyMap.has(aid),
    );
    if (missingAgencyIds.length) {
      for (let i = 0; i < missingAgencyIds.length; i += BATCH) {
        const batch = missingAgencyIds.slice(i, i + BATCH);
        const { data, error } = await supabase
          .from("agencies")
          .select("id, name, state")
          .in("id", batch);
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        for (const a of data ?? []) agencyMap.set(a.id, a);
      }
    }
  }

  // Build CSV
  const header = [
    "change_type",
    "entity_type",
    "detected_at",
    "agency_name",
    "agency_state",
    "contact_name",
    "title",
    "email",
    "phone",
    "web_address",
    "entity_id",
  ];
  const csvLines: string[] = [csvRow(header)];

  for (const r of rows) {
    if (r.entity_type === "agency") {
      const a = agencyMap.get(r.entity_id);
      csvLines.push(
        csvRow([
          r.change_type,
          r.entity_type,
          r.detected_at,
          a?.name ?? "",
          a?.state ?? "",
          "",
          "",
          a?.email ?? "",
          a?.main_phone ?? "",
          a?.web_address ?? "",
          r.entity_id,
        ]),
      );
    } else if (r.entity_type === "contact") {
      const c = contactMap.get(r.entity_id);
      const a = c?.agency_id ? agencyMap.get(c.agency_id) : null;
      const fullName = [c?.first_name, c?.last_name].filter(Boolean).join(" ");
      csvLines.push(
        csvRow([
          r.change_type,
          r.entity_type,
          r.detected_at,
          a?.name ?? "",
          a?.state ?? c?.state ?? "",
          fullName,
          c?.title ?? "",
          c?.email_primary ?? "",
          c?.mobile_phone ?? c?.work_phone ?? "",
          "",
          r.entity_id,
        ]),
      );
    }
  }

  const csv = csvLines.join("\r\n") + "\r\n";

  // Inline acknowledge: flip has_updates=false + bump last_acknowledged_at.
  // Even if there were zero rows, we still ack — user opened the delta and
  // confirmed they want to mark as reviewed.
  await supabase
    .from("saved_lists")
    .update({
      has_updates: false,
      last_acknowledged_at: new Date().toISOString(),
    })
    .eq("id", id);

  const safeName = (list.name || "saved-list")
    .replace(/[^a-z0-9\-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "saved-list";
  const ts = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}-delta-${ts}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
