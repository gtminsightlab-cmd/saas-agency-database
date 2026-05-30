import { withSentryConfig } from "@sentry/nextjs";

// Content-Security-Policy directives. Deployed in REPORT-ONLY mode first
// (see header key below) so violations surface to Sentry via /api/csp-report
// without breaking the site. Master O reviews the Sentry CSP-violation
// stream for a week, tunes any gaps (likely Stripe / Vercel-Analytics /
// Sentry-tunnel adjustments), then flips the header key from
// `Content-Security-Policy-Report-Only` -> `Content-Security-Policy` to
// enforce.
//
// `'unsafe-inline'` on script-src + style-src is a known compromise for
// Next.js 16 + Tailwind without a nonce-injecting middleware. The
// nonce-based upgrade path is tracked in SECURITY.md as a follow-up.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://js.stripe.com https://*.vercel-scripts.com https://*.vercel-insights.com",
  "script-src-elem 'self' 'unsafe-inline' https://challenges.cloudflare.com https://js.stripe.com https://*.vercel-scripts.com https://*.vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  "style-src-elem 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://*.upstash.io https://api.stripe.com https://*.vercel-insights.com https://*.vercel-scripts.com",
  "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://hooks.stripe.com https://seven16groupsupport.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
  "report-uri /api/csp-report",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  async redirects() {
    // Canonical hostname = seven16intel.com (LOCKED 2026-05-30 — Seven16 Intel rebrand).
    //
    // Product was originally "Agency Signal" at agencysignal.co. Rebranded
    // to "Seven16 Intel" at seven16intel.com to avoid brand collision with
    // a separate "AgencySignal" company operating a marketing-agency
    // directory product at agencysignal.io (third-party owned).
    //
    // Both legacy hostnames 308-redirect to the new canonical:
    //   - directory.seven16group.com → seven16intel.com (pre-SESSION_38 legacy)
    //   - agencysignal.co            → seven16intel.com (SESSION_38 → SESSION_40 legacy)
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "directory.seven16group.com" }],
        destination: "https://seven16intel.com/:path*",
        permanent: true
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "agencysignal.co" }],
        destination: "https://seven16intel.com/:path*",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // REPORT-ONLY for first deploy. Flip to "Content-Security-Policy" to enforce.
          { key: "Content-Security-Policy-Report-Only", value: CSP_DIRECTIVES }
        ]
      }
    ];
  }
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: { enabled: true },
  disableLogger: true,
  tunnelRoute: "/monitoring"
});
