// Seven16 Group Support widget — Stage-1 readiness placeholder.
//
// DO NOT mount globally yet. This component renders `null` until
// `seven16groupsupport.com` is live AND signing/API-key env vars are
// populated. The Props type matches the future production contract so
// existing call sites don't need to change when the real widget lands.
//
// Architecture rule (locked):
//   Agency Signal is support-INTEGRATABLE, not support-DEPENDENT.
//   The widget must NEVER break the app if the support platform is offline.
//
// Mount-point plan (future):
//   - Public marketing pages → `app/layout.tsx` (mode="public_presales")
//   - Authenticated app shell → `components/app/shell.tsx` (mode="customer_support")
//
// See `docs/support-integration-readiness.md` for the full spec.

import type { SupportMode } from "@/lib/support/context";

export type Seven16SupportWidgetProps = {
  /** Always `"agencysignal"` for this repo. Required so the support platform routes correctly. */
  productSlug: "agencysignal";
  /** Which support flow the widget should open in. */
  mode: SupportMode;
  /** Short-lived signed JWT carrying safe user context. Required for authed modes. */
  userContextToken?: string;
  /** URL pathname when the widget was rendered. Helps the AI agent know what screen the user is on. */
  currentPath?: string;
  /** Visual theme. Defaults to system. */
  theme?: "light" | "dark" | "system";
};

/**
 * Renders `null` at Stage 1 by design. When `seven16groupsupport.com` ships,
 * this component will become a client component that injects the support
 * widget script and passes the signed context token across the iframe boundary.
 *
 * Stage-1 contract:
 *   - Never throws.
 *   - Never reads env vars (browser context).
 *   - Never makes network calls.
 *   - Safe to render anywhere, including SSR.
 */
export function Seven16SupportWidget(_props: Seven16SupportWidgetProps): null {
  // Stage 1: deliberate null render. Do not add a loader, fallback, or
  // hidden DOM marker — keeps the placeholder zero-cost.
  return null;
}
