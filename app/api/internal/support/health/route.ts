// Seven16 Group Support — readiness probe.
//
// Returns 200 with a readiness payload so the support platform can confirm
// reachability + diagnose missing env vars during its own bootstrap.
// Gate is open-ish at Stage 1: if SUPPORT_PLATFORM_API_KEY is unset, the
// route responds anyway (so the platform can detect "AS reachable but not
// yet wired"). Once the key IS set, the route requires Bearer auth.
//
// See `docs/support-integration-readiness.md` §7.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const apiKey = process.env.SUPPORT_PLATFORM_API_KEY;
  const productSlug = process.env.NEXT_PUBLIC_PRODUCT_SLUG ?? "agencysignal";
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL ?? null;
  const signingConfigured = Boolean(process.env.SUPPORT_CONTEXT_SIGNING_SECRET);
  const webhookConfigured = Boolean(process.env.SUPPORT_WEBHOOK_SECRET);
  const apiKeyConfigured = Boolean(apiKey);

  if (apiKey) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json(
    {
      product_slug: productSlug,
      support_url: supportUrl,
      readiness: true,
      stage: "1-readiness",
      api_key_configured: apiKeyConfigured,
      signing_configured: signingConfigured,
      webhook_configured: webhookConfigured,
      version: "0.1.0-readiness",
      shipped_at: "2026-05-19",
    },
    { status: 200 },
  );
}
