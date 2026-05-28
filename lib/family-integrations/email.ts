/**
 * Seven16 Email API client — family-wide transactional + marketing email.
 *
 * Per family doctrine (D-026 + D-027 + `reference_seven16_email_platform.md`):
 *   - All Seven16 products call `seven16email.com` for ANY email send
 *     (transactional + marketing). Never wire per-product SMTP / Resend /
 *     SendGrid clients in satellite repos. Single shared service = single
 *     deliverability surface + suppression list + compliance posture.
 *     (URL updated 2026-05-27 — was `api.seven16email.com` in the earlier
 *     locked plan; root-domain `seven16email.com` per the canonical catalog.)
 *   - Sender topology is enforced server-side: transactional goes from
 *     `notify.seven16email.com`, marketing from `mail.seven16email.com`,
 *     NEVER from agencysignal.io / dotintel.io / bindlab.io / etc.
 *   - Suppression checks, unsubscribe handling, idempotency, retry-with-
 *     backoff all live in the Email platform. Satellites just call.
 *
 * Status (2026-05-27): the Email platform itself is scaffolded but the
 * Next.js routes aren't deployed to seven16email.com yet. This client
 * is forward-compatible — when env vars `SEVEN16EMAIL_API_URL` +
 * `SEVEN16EMAIL_API_KEY` land, sends activate. Until then, every call
 * is a logged null-render so satellite signup flows don't break.
 *
 * Null-render pattern matches `lib/support/*` per D-027 Practice 1:
 * satellites are integration-INTEGRATABLE, not integration-DEPENDENT.
 */

/** Canonical template keys the Email platform understands. */
export type EmailTemplateKey =
  // `charter_member_welcome` REMOVED 2026-05-27 per D-039 (executes
  // D-034 family-wide Charter Member kill).
  | "growth_member_welcome"
  | "snapshot_purchase_welcome";

export type SendEmailPayload = {
  /** Recipient email address. */
  to: string;
  /** Template the Email platform should render (content lives there, not here). */
  template_key: EmailTemplateKey;
  /** Template variables — keys depend on the template. */
  template_data?: Record<string, unknown>;
  /**
   * Satellite identifier per D-026 canonical slug list. Always `agencysignal`
   * for sends originating from this repo. Used by the Email platform for
   * routing + attribution + suppression scoping.
   */
  source_product: "agencysignal";
  /**
   * Stable idempotency key per D-027 Practice 7. Pattern:
   * `<source_product>:<event_type>:<sha256-of-identity-fields>` recommended.
   * For checkout-triggered welcome emails: `agencysignal:welcome:<stripe_session_id>`
   * works since session IDs are unique + immutable.
   */
  idempotency_key: string;
};

export type SendEmailResult =
  | { ok: true; message_id: string }
  | { ok: false; error: string };

/**
 * Send a transactional email via the Seven16 Email platform.
 *
 * Returns `{ok: false, error: "email_not_configured"}` when env vars are
 * unset — the caller should log + continue, not throw. Welcome emails are
 * nice-to-have; missing one shouldn't block a paid signup.
 */
export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const apiUrl = process.env.SEVEN16EMAIL_API_URL;
  const apiKey = process.env.SEVEN16EMAIL_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn(
      `[seven16email] env not configured, skipping send (template=${payload.template_key} to=${redactEmail(payload.to)})`
    );
    return { ok: false, error: "email_not_configured" };
  }

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/send`, {
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
      console.warn(`[seven16email] send failed (template=${payload.template_key}): ${error}`);
      return { ok: false, error };
    }

    const body = (await res.json().catch(() => ({}))) as { message_id?: string };
    return { ok: true, message_id: body.message_id ?? "" };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`[seven16email] send threw (template=${payload.template_key}): ${error}`);
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
