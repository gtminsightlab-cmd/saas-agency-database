// Safe support-context payload builder for Seven16 Group Support.
//
// Stage-1 readiness shipped Session C. Real HMAC signing waits on
// SUPPORT_CONTEXT_SIGNING_SECRET being populated in Vercel env.
//
// See `docs/support-integration-readiness.md` §5 for the full spec.

export type SupportMode =
  | "public_presales"
  | "customer_support"
  | "onboarding"
  | "technical_sales"
  | "account_management";

/**
 * Allowlist-only payload type. TypeScript will reject any attempt to add
 * fields not declared here, which is the primary safety mechanism against
 * accidental PII / secret leakage. If a new field is needed, add it here
 * first AND update `docs/support-integration-readiness.md` §5.
 *
 * NEVER add: api keys, passwords, payment data, full DB records, third-party
 * tokens, confidential internal notes, service-role keys.
 */
export type SafeSupportContext = {
  product_slug: "agencysignal";
  mode: SupportMode;
  user_id?: string;
  organization_id?: string;
  email?: string;
  role?: string;
  plan?: string;
  account_status?: string;
  current_path?: string;
  issued_at: string;
  expires_at: string;
};

export type BuildSafeSupportContextArgs = {
  mode: SupportMode;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  organization?: {
    id?: string;
    plan?: string;
    account_status?: string;
  };
  current_path?: string;
  /** Override token lifetime (ms). Defaults to 5 minutes. */
  ttl_ms?: number;
};

const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * Builds a SafeSupportContext for the widget / support platform. Pulls only
 * allowlisted fields from the inputs; anything else is dropped silently.
 *
 * Stage 1: the result is a plain object (not yet signed). When
 * SUPPORT_CONTEXT_SIGNING_SECRET is configured, pass the result to
 * `signSupportContext` to produce a JWT for transport.
 */
export function buildSafeSupportContext(
  args: BuildSafeSupportContextArgs,
): SafeSupportContext {
  const now = Date.now();
  const ttl = args.ttl_ms ?? DEFAULT_TTL_MS;

  return {
    product_slug: "agencysignal",
    mode: args.mode,
    user_id: args.user?.id,
    organization_id: args.organization?.id,
    email: args.user?.email,
    role: args.user?.role,
    plan: args.organization?.plan,
    account_status: args.organization?.account_status,
    current_path: args.current_path,
    issued_at: new Date(now).toISOString(),
    expires_at: new Date(now + ttl).toISOString(),
  };
}

/**
 * Stage 1: returns the sentinel `"TODO_SIGN"`. Stage 2 will replace the body
 * with HMAC-SHA256 signing using SUPPORT_CONTEXT_SIGNING_SECRET. The function
 * signature is stable so call sites don't change.
 *
 * Why we ship the stub: it locks the call shape so authed routes can wire
 * `signSupportContext(buildSafeSupportContext({...}))` today and just start
 * working when the env var is set.
 */
export function signSupportContext(_ctx: SafeSupportContext): string {
  const secret = process.env.SUPPORT_CONTEXT_SIGNING_SECRET;
  if (!secret) {
    return "TODO_SIGN";
  }
  // TODO(session-D-or-later): implement HMAC-SHA256 with `secret`, return
  // a compact JWT (header.payload.signature). Keep payload identical to
  // the input ctx so the support platform can decode without our help.
  return "TODO_SIGN";
}
