/**
 * Synthetic smoke test — Agency Signal public-surface health check.
 *
 * Exits 0 if every check passes, 1 on first failure (with details printed).
 * Designed for pre-charter-launch gating + future cron health checks.
 *
 * Run:
 *   SMOKE_TARGET=https://agencysignal.co npm run smoke
 *
 * (Defaults to https://agencysignal.co when SMOKE_TARGET unset.)
 *
 * What it checks (all unauthenticated — safe to run against production):
 * 1. Public marketing pages return 200 (/, /about, /faq, /use-cases, etc.)
 * 2. HTTP security headers present on /
 * 3. CSP report endpoint accepts a sample violation (204)
 * 4. Authed API endpoints reject unauthenticated requests (401)
 * 5. Stripe webhook rejects requests without signature (400)
 *
 * What it does NOT check (manual smoke in LAUNCH_CHECKLIST.md):
 * - Real signup flow (requires email + Turnstile + Supabase round-trip)
 * - Real export (requires authed session + credits)
 * - PITR availability (Supabase dashboard check)
 * - Sentry / Better Stack alert routing (manual test required)
 */

const TARGET = (process.env.SMOKE_TARGET ?? "https://agencysignal.co").replace(/\/$/, "");

type CheckResult = { name: string; ok: boolean; detail: string };

const results: CheckResult[] = [];

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  const flag = ok ? "✓" : "✗";
  const color = ok ? "[32m" : "[31m";
  const reset = "[0m";
  console.log(`  ${color}${flag}${reset} ${name} — ${detail}`);
}

async function fetchSafe(url: string, init?: RequestInit): Promise<{ status: number; headers: Headers; body: string } | { error: string }> {
  try {
    const res = await fetch(url, { ...init, redirect: "manual" });
    const body = await res.text().catch(() => "");
    return { status: res.status, headers: res.headers, body };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

async function checkPublicPages() {
  console.log("\n[1/5] Public marketing pages");
  const pages = [
    "/",
    "/about",
    "/faq",
    "/use-cases",
    "/methodology",
    "/enterprise",
    "/charter",
    "/verticals",
    "/sign-up",
    "/sign-in",
  ];
  for (const path of pages) {
    const url = `${TARGET}${path}`;
    const res = await fetchSafe(url);
    if ("error" in res) {
      record(`GET ${path}`, false, `fetch error: ${res.error}`);
      continue;
    }
    const ok = res.status === 200;
    record(`GET ${path}`, ok, `status ${res.status}`);
  }
}

async function checkSecurityHeaders() {
  console.log("\n[2/5] HTTP security headers on /");
  const res = await fetchSafe(`${TARGET}/`);
  if ("error" in res) {
    record("security headers", false, `fetch error: ${res.error}`);
    return;
  }
  const required = [
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
  ];
  for (const header of required) {
    const value = res.headers.get(header);
    record(
      `header: ${header}`,
      !!value,
      value ? value.slice(0, 80) : "MISSING"
    );
  }
  // CSP can be either enforcing or report-only — Session D ships Report-Only.
  const csp = res.headers.get("content-security-policy") || res.headers.get("content-security-policy-report-only");
  const cspMode = res.headers.get("content-security-policy") ? "ENFORCING" : "Report-Only";
  record(
    "header: content-security-policy(-report-only)",
    !!csp,
    csp ? `${cspMode} · ${csp.length} chars` : "MISSING"
  );
}

async function checkCspReportEndpoint() {
  console.log("\n[3/5] CSP report endpoint");
  const sampleReport = {
    "csp-report": {
      "document-uri": `${TARGET}/`,
      "violated-directive": "script-src",
      "effective-directive": "script-src",
      "original-policy": "default-src 'self'",
      "blocked-uri": "https://example.com/probe.js",
      disposition: "report",
    },
  };
  const res = await fetchSafe(`${TARGET}/api/csp-report`, {
    method: "POST",
    headers: { "Content-Type": "application/csp-report" },
    body: JSON.stringify(sampleReport),
  });
  if ("error" in res) {
    record("POST /api/csp-report", false, `fetch error: ${res.error}`);
    return;
  }
  record("POST /api/csp-report", res.status === 204, `status ${res.status} (expected 204)`);
}

async function checkApiAuthGates() {
  console.log("\n[4/5] API auth gates (unauth requests should 401)");
  const protectedEndpoints = [
    { method: "POST", path: "/api/team/invite", body: { email: "smoke@example.com" } },
  ];
  for (const ep of protectedEndpoints) {
    const res = await fetchSafe(`${TARGET}${ep.path}`, {
      method: ep.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ep.body ?? {}),
    });
    if ("error" in res) {
      record(`${ep.method} ${ep.path} unauth`, false, `fetch error: ${res.error}`);
      continue;
    }
    // 401 is the expected gate. 400 is also acceptable (some routes validate
    // payload before auth). 429 means rate limiting already kicked in (also fine).
    // Anything 2xx is a failure — that means unauth made it through.
    const ok = res.status === 401 || res.status === 400 || res.status === 429;
    record(
      `${ep.method} ${ep.path} unauth`,
      ok,
      `status ${res.status} (expected 401/400/429, got ${res.status})`
    );
  }
}

async function checkStripeWebhook() {
  console.log("\n[5/5] Stripe webhook signature gate");
  const res = await fetchSafe(`${TARGET}/api/stripe/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ smoke: true }),
  });
  if ("error" in res) {
    record("POST /api/stripe/webhook unsigned", false, `fetch error: ${res.error}`);
    return;
  }
  // Should reject because no Stripe signature header. 400 is the expected
  // response from Stripe's signature verification.
  const ok = res.status === 400;
  record(
    "POST /api/stripe/webhook unsigned",
    ok,
    `status ${res.status} (expected 400, got ${res.status})`
  );
}

async function main() {
  const startedAt = Date.now();
  console.log("\n========================================");
  console.log("Agency Signal smoke test");
  console.log(`Target: ${TARGET}`);
  console.log(`Started: ${new Date().toISOString()}`);
  console.log("========================================");

  await checkPublicPages();
  await checkSecurityHeaders();
  await checkCspReportEndpoint();
  await checkApiAuthGates();
  await checkStripeWebhook();

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  const duration = ((Date.now() - startedAt) / 1000).toFixed(2);

  console.log("\n========================================");
  console.log(`Summary: ${passed} passed · ${failed} failed · ${duration}s`);
  console.log("========================================\n");

  if (failed > 0) {
    console.log("Failures:");
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`  - ${r.name}: ${r.detail}`);
    }
    console.log("");
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal smoke error:", err);
  process.exit(1);
});
