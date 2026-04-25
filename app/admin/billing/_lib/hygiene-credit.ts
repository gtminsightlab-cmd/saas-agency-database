/**
 * Hygiene Credit eligibility math.
 *
 * Decision (per session-3 trust copy notes): 10% off at month 6 and month 12,
 * framed as a loyalty thank-you, not as data-decay compensation. The credit is
 * NOT YET wired to Stripe — there's no Subscription Schedule with phased
 * pricing or programmatic coupon. This module computes who's eligible based on
 * subscription created_at so admin can plan the rollout.
 */
import type { SubSummary } from "./stripe-fetchers";

export type EligibilityWindow = {
  /** "approaching" = anchor falls within `windowDays` days from now */
  approaching: SubSummary[];
  /** "passed" = anchor already passed; credit should have applied if wiring were live */
  passed: SubSummary[];
};

const SIX_MONTHS_MS  = 1000 * 60 * 60 * 24 * 30 * 6;
const TWELVE_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 12;
const DAY_MS = 1000 * 60 * 60 * 24;

export function classifyHygieneEligibility(
  subs: SubSummary[],
  anchor: 6 | 12,
  windowDays = 30,
  now: number = Date.now()
): EligibilityWindow {
  const ms = anchor === 6 ? SIX_MONTHS_MS : TWELVE_MONTHS_MS;
  const out: EligibilityWindow = { approaching: [], passed: [] };

  for (const s of subs) {
    if (s.status !== "active" && s.status !== "trialing") continue;
    if (s.interval !== "month") continue; // only recurring monthly plans get the credit
    const createdAt = s.created * 1000;
    const anchorAt = createdAt + ms;
    const days = (anchorAt - now) / DAY_MS;
    if (days <= 0 && days > -windowDays) {
      out.passed.push(s);
    } else if (days > 0 && days <= windowDays) {
      out.approaching.push(s);
    }
  }
  return out;
}

export function fmtAge(createdSec: number, now: number = Date.now()): string {
  const days = Math.floor((now / 1000 - createdSec) / 86400);
  if (days < 60) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months - years * 12;
  return rem ? `${years}y ${rem}mo` : `${years}y`;
}
