import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY env var is not set");
  _stripe = new Stripe(key, { apiVersion: "2024-09-30.acacia" });
  return _stripe;
}

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://directory.seven16group.com";
