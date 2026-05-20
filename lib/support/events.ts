// Support-event emitter for Seven16 Group Support.
//
// Stage-1 readiness shipped Session C. Real POST to the support platform
// waits on SUPPORT_PLATFORM_API_URL + SUPPORT_PLATFORM_API_KEY being set in
// Vercel env. Until then this function `console.debug`s in dev and is a
// no-op in prod.
//
// Non-blocking by design — emit failures must NEVER affect product UX.
// See `docs/support-integration-readiness.md` §6 for the event catalog.

/**
 * Catalog of every support event Agency Signal may emit. Add new events here
 * (not as freeform strings) so the support platform has a stable contract.
 */
export type SupportEventName =
  // Universal — fire from any Seven16 product
  | "support_widget_opened"
  | "support_message_started"
  | "demo_requested"
  | "sales_question_asked"
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_blocked"
  | "onboarding_completed"
  | "ticket_requested"
  | "download_failed"
  | "export_failed"
  | "api_error"
  | "billing_question_started"
  | "partner_program_clicked"
  | "usage_limit_reached"
  // Agency Signal–specific
  | "email_verification_started"
  | "email_verification_failed"
  | "lead_list_created"
  | "credits_exhausted"
  | "upgrade_clicked"
  | "api_key_question_started";

export type SupportEventPayload = Record<string, unknown>;

/**
 * Fire-and-forget event emit. Returns void; never throws.
 *
 * Behavior:
 *   - No SUPPORT_PLATFORM_API_URL → `console.debug` in dev, silent in prod.
 *   - Configured → POST to ${SUPPORT_PLATFORM_API_URL}/events with the
 *     server-to-server API key. Network errors are swallowed silently.
 *
 * Use this from server actions / API routes only — emitting from the client
 * would leak SUPPORT_PLATFORM_API_KEY. (The client should call the internal
 * `/api/internal/support/events` route instead, which gates on session auth
 * and forwards server-side.)
 */
export async function emitSupportEvent(
  name: SupportEventName,
  payload: SupportEventPayload = {},
): Promise<void> {
  const apiUrl = process.env.SUPPORT_PLATFORM_API_URL;
  const apiKey = process.env.SUPPORT_PLATFORM_API_KEY;
  const productSlug = process.env.NEXT_PUBLIC_PRODUCT_SLUG ?? "agencysignal";

  const body = {
    product_slug: productSlug,
    event: name,
    payload,
    occurred_at: new Date().toISOString(),
  };

  if (!apiUrl || !apiKey) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[support-event:dev-noop]", body);
    }
    return;
  }

  try {
    await fetch(`${apiUrl}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // Keep request lightweight; do not block product flows.
      keepalive: true,
    });
  } catch {
    // Intentionally swallowed — emit is best-effort, never blocks UX.
  }
}
