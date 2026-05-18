// D-023 Pillar 6 / BACKLOG #1 — Saved-list refresh + change detection
//
// Family pattern (D-013): Vercel-Cron → API route → Edge Function with
// direct postgres.js connection. Bypasses PostgREST schema cache issues
// per memory `feedback_postgrest_schema_cache_stuck.md`.
//
// For each saved_list:
//   1. Parse filter_json.querystring → filter params (mirrors save-button.tsx)
//   2. Call get_saved_list_entity_ids RPC → current agency_ids[] + contact_ids[]
//   3. Compare against latest saved_list_snapshots row
//   4. Write saved_list_changes rows for set-diff (added/removed)
//   5. Write new snapshot
//   6. Update saved_lists.has_updates (true when changes detected) + last_run_at

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const COUNTRY_MAP: Record<string, string> = { US: "USA", CA: "CAN" };

function csvIds(v: string | null): string[] {
  return v ? v.split(",").filter(Boolean) : [];
}

function asNum(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

interface RunSummary {
  processed: number;
  first_run_initialized: number;
  diffed_with_changes: number;
  changes_written: number;
  errors: number;
  error_messages: string[];
  elapsed_ms: number;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    return new Response(
      JSON.stringify({ error: "SUPABASE_DB_URL not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const sql = postgres(dbUrl, { prepare: false });
  const startedAt = Date.now();

  const summary: RunSummary = {
    processed: 0,
    first_run_initialized: 0,
    diffed_with_changes: 0,
    changes_written: 0,
    errors: 0,
    error_messages: [],
    elapsed_ms: 0,
  };

  try {
    const lists = await sql<
      { id: string; tenant_id: string; filter_json: any }[]
    >`
      SELECT id, tenant_id, filter_json
      FROM public.saved_lists
      ORDER BY id
    `;

    for (const list of lists) {
      summary.processed++;
      try {
        const qs: string = list.filter_json?.querystring ?? "";
        const params = new URLSearchParams(qs);

        const accountTypeIds = csvIds(params.get("at"));
        const locationTypeIds = csvIds(params.get("lt"));
        const amsIds = csvIds(params.get("ams"));
        const carrierIds = csvIds(params.get("cr"));
        const affiliationIds = csvIds(params.get("af"));
        const sicIds = csvIds(params.get("in"));
        const stateIds = csvIds(params.get("st"));
        const country = params.get("c");
        const accountName = params.get("an") || params.get("name");
        const minority = params.get("min");
        const premiumMin = asNum(params.get("pmin"));
        const premiumMax = asNum(params.get("pmax"));
        const revenueMin = asNum(params.get("rmin"));
        const revenueMax = asNum(params.get("rmax"));
        const empMin = asNum(params.get("emin"));
        const empMax = asNum(params.get("emax"));

        let stateCodes: string[] = [];
        if (stateIds.length) {
          const rows = await sql<{ code: string }[]>`
            SELECT code FROM public.states WHERE id = ANY(${stateIds}::uuid[])
          `;
          stateCodes = rows.map((r) => r.code).filter(Boolean);
        }

        const carrierArr = carrierIds.length ? carrierIds : null;
        const affilArr = affiliationIds.length ? affiliationIds : null;
        const sicArr = sicIds.length ? sicIds : null;
        const accountTypeArr = accountTypeIds.length ? accountTypeIds : null;
        const locationTypeArr = locationTypeIds.length ? locationTypeIds : null;
        const amsArr = amsIds.length ? amsIds : null;
        const stateArr = stateCodes.length ? stateCodes : null;
        const countryVal = country ? (COUNTRY_MAP[country] ?? country) : null;
        const minorityVal =
          minority === "yes" ? true : minority === "no" ? false : null;

        const entityRows = await sql<
          { agency_ids: string[]; contact_ids: string[] }[]
        >`
          SELECT agency_ids, contact_ids FROM public.get_saved_list_entity_ids(
            ${carrierArr},
            ${affilArr},
            ${sicArr},
            ${accountTypeArr},
            ${locationTypeArr},
            ${amsArr},
            ${stateArr},
            ${countryVal},
            ${premiumMin},
            ${premiumMax},
            ${revenueMin},
            ${revenueMax},
            ${empMin},
            ${empMax},
            ${minorityVal},
            ${accountName || null},
            'contains'
          )
        `;

        const current = entityRows[0];
        const currentAgencyIds: string[] = current?.agency_ids ?? [];
        const currentContactIds: string[] = current?.contact_ids ?? [];

        const snapshotRows = await sql<
          {
            id: string;
            snapshot_payload: { agency_ids?: string[]; contact_ids?: string[] };
          }[]
        >`
          SELECT id, snapshot_payload
          FROM public.saved_list_snapshots
          WHERE saved_list_id = ${list.id}
          ORDER BY created_at DESC
          LIMIT 1
        `;

        const latest = snapshotRows[0];
        const hasPrevious = !!latest;
        const previousAgencyIds: string[] =
          latest?.snapshot_payload?.agency_ids ?? [];
        const previousContactIds: string[] =
          latest?.snapshot_payload?.contact_ids ?? [];

        let hadChanges = false;
        let changesForList = 0;

        if (hasPrevious) {
          const prevAgencySet = new Set(previousAgencyIds);
          const currAgencySet = new Set(currentAgencyIds);
          const agenciesAdded = currentAgencyIds.filter(
            (id) => !prevAgencySet.has(id),
          );
          const agenciesRemoved = previousAgencyIds.filter(
            (id) => !currAgencySet.has(id),
          );

          const prevContactSet = new Set(previousContactIds);
          const currContactSet = new Set(currentContactIds);
          const contactsAdded = currentContactIds.filter(
            (id) => !prevContactSet.has(id),
          );
          const contactsRemoved = previousContactIds.filter(
            (id) => !currContactSet.has(id),
          );

          const changes: Array<{
            tenant_id: string;
            saved_list_id: string;
            change_type: string;
            entity_type: string;
            entity_id: string;
          }> = [];

          for (const aid of agenciesAdded) {
            changes.push({
              tenant_id: list.tenant_id,
              saved_list_id: list.id,
              change_type: "agency_added",
              entity_type: "agency",
              entity_id: aid,
            });
          }
          for (const aid of agenciesRemoved) {
            changes.push({
              tenant_id: list.tenant_id,
              saved_list_id: list.id,
              change_type: "agency_removed",
              entity_type: "agency",
              entity_id: aid,
            });
          }
          for (const cid of contactsAdded) {
            changes.push({
              tenant_id: list.tenant_id,
              saved_list_id: list.id,
              change_type: "contact_added",
              entity_type: "contact",
              entity_id: cid,
            });
          }
          for (const cid of contactsRemoved) {
            changes.push({
              tenant_id: list.tenant_id,
              saved_list_id: list.id,
              change_type: "contact_removed",
              entity_type: "contact",
              entity_id: cid,
            });
          }

          if (changes.length > 0) {
            hadChanges = true;
            changesForList = changes.length;
            summary.diffed_with_changes++;
            summary.changes_written += changes.length;

            // Batch insert to stay well under PostgREST 16KB header cap
            // (memory: feedback_postgrest_in_filter_header_cap.md). Even though
            // we're on direct postgres.js, batching keeps individual statements small.
            const BATCH = 500;
            for (let i = 0; i < changes.length; i += BATCH) {
              const batch = changes.slice(i, i + BATCH);
              await sql`
                INSERT INTO public.saved_list_changes ${sql(
                  batch,
                  "tenant_id",
                  "saved_list_id",
                  "change_type",
                  "entity_type",
                  "entity_id",
                )}
              `;
            }
          }
        } else {
          summary.first_run_initialized++;
        }

        // Always write a new snapshot (point-in-time payload)
        await sql`
          INSERT INTO public.saved_list_snapshots (
            tenant_id, saved_list_id, snapshot_payload, agency_count, contact_count
          ) VALUES (
            ${list.tenant_id},
            ${list.id},
            ${
              sql.json({
                agency_ids: currentAgencyIds,
                contact_ids: currentContactIds,
              })
            },
            ${currentAgencyIds.length},
            ${currentContactIds.length}
          )
        `;

        // Update saved_lists state: last_run_at always; has_updates only flips to true
        // on detected changes (never auto-clears — that's the user's ack action).
        if (hadChanges) {
          await sql`
            UPDATE public.saved_lists
            SET last_run_at = NOW(),
                has_updates = TRUE,
                accounts_count = ${currentAgencyIds.length},
                contacts_count = ${currentContactIds.length}
            WHERE id = ${list.id}
          `;
        } else {
          await sql`
            UPDATE public.saved_lists
            SET last_run_at = NOW(),
                accounts_count = ${currentAgencyIds.length},
                contacts_count = ${currentContactIds.length}
            WHERE id = ${list.id}
          `;
        }
      } catch (e) {
        summary.errors++;
        summary.error_messages.push(
          `list ${list.id}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
  } finally {
    await sql.end();
  }

  summary.elapsed_ms = Date.now() - startedAt;

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
