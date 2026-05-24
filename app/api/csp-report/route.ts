/**
 * CSP violation report sink. The `Content-Security-Policy-Report-Only`
 * header in next.config.mjs points `report-uri` here; browsers POST a
 * JSON report (legacy `csp-report` envelope or Reporting API array)
 * whenever a directive would have blocked something.
 *
 * Reports forward to Sentry as warning-level messages so Master O can
 * review violations in the Sentry dashboard before flipping the CSP
 * header from Report-Only to enforcing mode.
 *
 * Sentry tunneling is already configured (`tunnelRoute: "/monitoring"`
 * in next.config.mjs) so report → Sentry traffic doesn't need an
 * additional connect-src exception.
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

type LegacyCspReport = {
  "csp-report"?: Record<string, unknown>;
};

type ReportingApiEntry = {
  type?: string;
  url?: string;
  body?: Record<string, unknown>;
};

export async function POST(req: Request) {
  // Browsers send CSP reports as POSTs with content-type either
  // application/csp-report (legacy) or application/reports+json (Reporting API).
  // Both bodies parse as JSON; we accept either shape.
  let raw: unknown = null;
  try {
    raw = await req.json();
  } catch {
    // Malformed report — silently 204 so we don't expose parser-error info to
    // a potential attacker probing the endpoint.
    return new NextResponse(null, { status: 204 });
  }

  const violations: Record<string, unknown>[] = [];

  if (Array.isArray(raw)) {
    for (const entry of raw as ReportingApiEntry[]) {
      if (entry?.body && typeof entry.body === "object") {
        violations.push({ ...entry.body, _reportType: entry.type ?? "report" });
      }
    }
  } else if (raw && typeof raw === "object") {
    const legacy = (raw as LegacyCspReport)["csp-report"];
    if (legacy && typeof legacy === "object") {
      violations.push(legacy);
    } else {
      violations.push(raw as Record<string, unknown>);
    }
  }

  for (const v of violations) {
    const directive = String(v["effective-directive"] ?? v["violated-directive"] ?? "unknown");
    const blockedUri = String(v["blocked-uri"] ?? v["blockedURL"] ?? "unknown");
    const documentUri = String(v["document-uri"] ?? v["documentURL"] ?? "unknown");

    Sentry.captureMessage(`CSP violation: ${directive}`, {
      level: "warning",
      tags: {
        source: "csp-report",
        directive,
        blocked_host: safeHost(blockedUri),
        document_path: safePath(documentUri),
      },
      extra: { violation: v },
    });
  }

  // 204 — no response body for CSP reports.
  return new NextResponse(null, { status: 204 });
}

function safeHost(uri: string): string {
  try {
    return new URL(uri).host || uri;
  } catch {
    return uri.slice(0, 80);
  }
}

function safePath(uri: string): string {
  try {
    return new URL(uri).pathname || "/";
  } catch {
    return uri.slice(0, 80);
  }
}
