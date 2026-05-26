/**
 * Seven16 Command Center push-event client — family-wide customer state.
 *
 * Per family doctrine (D-026 + D-027 + `reference_family_api_integration_mesh.md`):
 *   - Satellite products push customer state events (signups, conversions,
 *     plan changes, charter enrollment, engagement) to `seven16command.com`.
 *     Command IS system-of-record for cross-product customer identity per
 *     Practice 2; satellites never run their own cross-product CRM.
 *   - Hub-and-spoke shape: satellites push to Command, Command fans state
 *     out to other satellites via webhooks (D-027 § rule 4 — no
 *     point-to-point satellite ↔ satellite calls).
 *   - Idempotency required on every write (D-027 § rule 5 + Practice 7).
 *     Key format: `<source_product>:<event_type>:<stable-hash-of-identity-fields>`.
 *   - Auth: per-satellite Bearer API key (Practice 1). Env var name:
 *     `SEVEN16COMMAND_INGEST_API_KEY`. URL: `SEVEN16COMMAND_API_URL`
 *     (production) — preview deploys point at sandbox via Vercel env scoping
 *     (Practice 5).
 *
 * Status (2026-05-25): Command itself is in Phase 1 foundation build per
 * `project_seven16_command_center_scope.md`; the `/api/ingest` route is
 * scaffolded but not deployed yet. This client is forward-compatible — when
 * the env vars land, pushes activate. Until then, every call is a logged
 * null-render so satellite signup flows don't break (D-027 Practice 1
 * null-render pattern, same as `email.ts`).
 *
 * Pushed events:
 *   - `customer_signup` — first paid touch (subscription OR snapshot)
 *   - `charter_member_enrolled` — Charter Member status granted at checkout
 *   - `subscription_started` — Growth subscription completed (paid recurring)
 *   - `subscription_changed` — recurring plan changed (downgrade/upgrade/swap)
 *   - `subscription_cancelled` — recurring plan cancelled
 *   - `snapshot_purchased` — one-time Snapshot purchase completed
 */

/** Canonical event keys Command's /api/ingest understands from agencysignal. */
export type CommandEventType =
  | "customer_signup"
  | "charter_member_enrolled"
  | "subscription_started"
  | "subscription_changed"
  | "subscription_cancelled"
  | "snapshot_purchased";

export type CommandContact = {
  /** Email is the primary identity field; Command reconciles by email on first touch. */
  email: string;
  /** Optional name fields; Command stores if present. */
  first_name?: string;
  last_name?: string;
  /** Satellite-local user UUID (Supabase `app_users.id`). Lets Command back-ref. */
  satellite_user_id?: string;
};

export type PushEventPayload = {
  /** Canonical satellite slug per D-026 + D-027 Practice 1. Always `agencysignal` from this repo. */
  source_product: "agencysignal";
  /** Event type — Command routes + fan-outs based on this. */
  event_type: CommandEventType;
  /** Customer identity — Command reconciles by email + returns/assigns `seven16_customer_id`. */
  contact: CommandContact;
  /** Event-specific data payload. Shape depends on event_type. */
  event_data?: Record<string, unknown>;
  /**
   * Stable idempotency key per D-027 Practice 7. Pattern:
   * `<source_product>:<event_type>:<stable-id>`. Examples:
   *   - `agencysignal:customer_signup:<app_user_id>`
   *   - `agencysignal:charter_member_enrolled:<stripe_customer_id>`
   *   - `agencysignal:subscription_started:<stripe_subscription_id>`
   *   - `agencysignal:snapshot_purchased:<stripe_session_id>`
   */
  idempotency_key: string;
};

export type PushEventResult =
  | { ok: true; seven16_customer_id: string }
  | { ok: false; error: string };

/**
 * Push a customer-state event to Seven16 Command.
 *
 * Returns `{ok: false, error: "command_not_configured"}` when env vars are
 * unset — the caller should log + continue, not throw. Per D-027 Practice 1,
 * a missing Command push must not block a paid signup flow. The next push
 * event (or a Command-side re-sync job) will re-establish state.
 */
export async function pushCommandEvent(payload: PushEventPayload): Promise<PushEventResult> {
  const apiUrl = process.env.SEVEN16COMMAND_API_URL;
  const apiKey = process.env.SEVEN16COMMAND_INGEST_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn(
      `[seven16command] env not configured, skipping push (event=${payload.event_type} to=${redactEmail(payload.contact.email)})`
    );
    return { ok: false, error: "command_not_configured" };
  }

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/ingest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": payload.idempotency_key,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const error = typeof errBody === "object" && errBody && "error" in errBody
        ? String((errBody as { error: unknown }).error)
        : `http_${res.status}`;
      console.warn(`[seven16command] push failed (event=${payload.event_type}): ${error}`);
      return { ok: false, error };
    }

    const body = (await res.json().catch(() => ({}))) as { seven16_customer_id?: string };
    return { ok: true, seven16_customer_id: body.seven16_customer_id ?? "" };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`[seven16command] push threw (event=${payload.event_type}): ${error}`);
    return { ok: false, error };
  }
}

/** Redact an email for log lines so we never write the full address to stdout. */
function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "<malformed>";
  const localRedacted = local.length <= 2 ? local : `${local[0]}***${local[local.length - 1]}`;
  return `${localRedacted}@${domain}`;
}
