import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Plug,
  Workflow,
  CreditCard,
  Building2,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CircleSlash,
  Webhook,
  Lock,
  Server,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STRIPE_DASHBOARD = "https://dashboard.stripe.com/test";
const PUBLIC_INTEGRATIONS_URL = "https://directory.seven16group.com/integrations";

type State = "live" | "scaffolded" | "promised" | "future";

type Provider = {
  slug: string;
  name: string;
  category: "Payments" | "Automation" | "CRM" | "Email" | "Monitoring";
  state: State;
  description: string;
  /** What the public /integrations marketing page tells customers about it */
  marketing_promise: string | null;
  /** What's actually wired up in code */
  reality: string;
  envVars: { name: string; required: boolean }[];
  links: { label: string; href: string; external?: boolean }[];
};

const PROVIDERS: Provider[] = [
  {
    slug: "stripe",
    name: "Stripe",
    category: "Payments",
    state: "live",
    description: "Subscription billing, checkout, webhook events.",
    marketing_promise: null,
    reality:
      "Connected to Stripe sandbox (acct_1TLUF6HmqSDkUoqw). 2 active Growth Member subscriptions, $198 MRR. Webhook handler at /api/stripe/webhook with signature verification.",
    envVars: [
      { name: "STRIPE_SECRET_KEY",     required: true  },
      { name: "STRIPE_WEBHOOK_SECRET", required: true  },
      { name: "NEXT_PUBLIC_APP_URL",   required: true  },
    ],
    links: [
      { label: "Stripe dashboard",  href: STRIPE_DASHBOARD, external: true },
      { label: "Billing module",    href: "/admin/billing" },
    ],
  },
  {
    slug: "zapier",
    name: "Zapier / Make",
    category: "Automation",
    state: "scaffolded",
    description: "CSV export endpoint usable as a Zapier/Make trigger to fan out to 1,000+ apps.",
    marketing_promise:
      "Marketing page says 'Available now' — copy a saved list export URL, paste into Zapier, fan out to anywhere.",
    reality:
      "/api/export route exists but returns 501 not_implemented. Token issuance, RLS, credit deduction not yet wired. Path is scaffolded but customers can't actually use it today.",
    envVars: [],
    links: [
      { label: "Public /integrations page", href: PUBLIC_INTEGRATIONS_URL, external: true },
      { label: "Source: app/api/export/route.ts", href: "https://github.com/gtminsightlab-cmd/saas-agency-database/blob/main/app/api/export/route.ts", external: true },
    ],
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    category: "CRM",
    state: "promised",
    description: "Native OAuth + push contacts to a HubSpot list. Two-way sync future.",
    marketing_promise: "Marketing page lists HubSpot as 'Coming soon' with a disabled Connect button.",
    reality: "No code path. Customers can use the (still-stubbed) Zapier flow as a workaround once /api/export ships.",
    envVars: [
      { name: "HUBSPOT_CLIENT_ID",     required: true },
      { name: "HUBSPOT_CLIENT_SECRET", required: true },
    ],
    links: [
      { label: "Public /integrations page", href: PUBLIC_INTEGRATIONS_URL, external: true },
    ],
  },
  {
    slug: "salesforce",
    name: "Salesforce",
    category: "CRM",
    state: "promised",
    description: "Create Leads or Contacts in your Salesforce org via OAuth.",
    marketing_promise: "Marketing page lists Salesforce as 'Coming soon' with a disabled Connect button.",
    reality: "No code path. SFDC requires Connected App + OAuth + bulk upsert via REST or Bulk API.",
    envVars: [
      { name: "SALESFORCE_CLIENT_ID",     required: true },
      { name: "SALESFORCE_CLIENT_SECRET", required: true },
    ],
    links: [
      { label: "Public /integrations page", href: PUBLIC_INTEGRATIONS_URL, external: true },
    ],
  },
  {
    slug: "mailchimp",
    name: "Mailchimp",
    category: "Email",
    state: "promised",
    description: "Drop contacts into a Mailchimp audience as subscribed members.",
    marketing_promise: "Marketing page lists Mailchimp as 'Coming soon'.",
    reality: "No code path. Mailchimp API requires personal API key + audience ID per user.",
    envVars: [],
    links: [
      { label: "Public /integrations page", href: PUBLIC_INTEGRATIONS_URL, external: true },
    ],
  },
  {
    slug: "pipedrive",
    name: "Pipedrive",
    category: "CRM",
    state: "promised",
    description: "Add contacts as People + create Deals in your Pipedrive pipeline.",
    marketing_promise: "Marketing page lists Pipedrive as 'Coming soon'.",
    reality: "No code path.",
    envVars: [
      { name: "PIPEDRIVE_CLIENT_ID",     required: true },
      { name: "PIPEDRIVE_CLIENT_SECRET", required: true },
    ],
    links: [
      { label: "Public /integrations page", href: PUBLIC_INTEGRATIONS_URL, external: true },
    ],
  },
  {
    slug: "slack",
    name: "Slack",
    category: "Monitoring",
    state: "future",
    description: "Post deploy + alert events to a team channel.",
    marketing_promise: null,
    reality: "Not on the public roadmap. Easy add — single Incoming Webhook URL is enough for v1.",
    envVars: [{ name: "SLACK_WEBHOOK_URL", required: true }],
    links: [],
  },
  {
    slug: "supabase",
    name: "Supabase",
    category: "Payments",
    state: "live",
    description: "Postgres + auth + RLS — the core platform, not a removable integration.",
    marketing_promise: null,
    reality:
      "Project sdlsdovuljuymgymarou. 41 public tables under RLS, 40 migrations applied, 138 MB DB. See System Health for live state.",
    envVars: [
      { name: "NEXT_PUBLIC_SUPABASE_URL",      required: true },
      { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true },
      { name: "SUPABASE_SERVICE_ROLE_KEY",     required: true },
    ],
    links: [
      { label: "Supabase dashboard", href: "https://supabase.com/dashboard/project/sdlsdovuljuymgymarou", external: true },
      { label: "System Health",      href: "/admin/system-health" },
    ],
  },
];

export default async function IntegrationsPage() {
  const supabase = await createClient();

  const [
    { data: stripeCustomers },
    { data: billingPlans },
  ] = await Promise.all([
    supabase.from("stripe_customers").select("stripe_customer_id"),
    supabase.from("billing_plans").select("id,code,name,stripe_price_id"),
  ]);

  // Server-side env var presence check (server component only — never leaked to client)
  const envState: Record<string, boolean> = {};
  for (const p of PROVIDERS) for (const ev of p.envVars) envState[ev.name] = Boolean(process.env[ev.name]);

  // KPI counts
  const counts = {
    live: PROVIDERS.filter((p) => p.state === "live").length,
    scaffolded: PROVIDERS.filter((p) => p.state === "scaffolded").length,
    promised: PROVIDERS.filter((p) => p.state === "promised").length,
    future: PROVIDERS.filter((p) => p.state === "future").length,
  };
  const requiredEnvCount = Object.keys(envState).length;
  const setEnvCount = Object.values(envState).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Integrations</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Connections &amp; webhooks</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Honest state of every external integration — what&rsquo;s actually wired up in code, what&rsquo;s
          scaffolded but stubbed, what the public marketing page promises customers, and what&rsquo;s
          purely future scope. The gap between &ldquo;Marketing promise&rdquo; and &ldquo;Reality&rdquo; is what to
          watch.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Live"        value={counts.live}        Icon={ShieldCheck}    tone="ok"     hint="Wired + customer-usable today" />
        <Kpi label="Scaffolded"  value={counts.scaffolded}  Icon={AlertTriangle}  tone="warn"   hint="Code path exists but returns 501" />
        <Kpi label="Promised"    value={counts.promised}    Icon={CircleSlash}    tone="warn"   hint="On public /integrations page, not built" />
        <Kpi label="Env vars"    value={`${setEnvCount}/${requiredEnvCount}`} Icon={Lock} tone={setEnvCount === requiredEnvCount ? "ok" : "warn"} hint="Set in current Vercel env" />
      </div>

      {/* Truth-vs-promise banner if mismatch exists */}
      {counts.promised + counts.scaffolded > 0 && (
        <div className="rounded-xl border border-admin-warn/40 bg-admin-warn/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-admin-warn shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-admin-text">
                {counts.promised} integrations promised on the public site, {counts.scaffolded} scaffolded but stubbed
              </h2>
              <p className="mt-1 text-xs text-admin-text-mute max-w-2xl">
                The public{" "}
                <a
                  href={PUBLIC_INTEGRATIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-admin-accent hover:underline inline-flex items-center gap-1"
                >
                  /integrations page
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>{" "}
                tells customers HubSpot, Salesforce, Mailchimp, and Pipedrive are &ldquo;Coming soon&rdquo;
                with disabled Connect buttons — that&rsquo;s honest framing. Zapier/Make is shown as
                &ldquo;Available now&rdquo; but depends on /api/export which is currently a 501 stub. Either
                ship the export route or soften the Zapier copy until it&rsquo;s real.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Provider cards by state */}
      <div className="grid gap-4 md:grid-cols-2">
        {(["live", "scaffolded", "promised", "future"] as State[]).flatMap((s) =>
          PROVIDERS.filter((p) => p.state === s).map((p) => (
            <ProviderCard key={p.slug} p={p} envState={envState} />
          ))
        )}
      </div>

      {/* Stripe-specific deep panel */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-admin-accent" />
            <h2 className="text-sm font-semibold text-admin-text">Stripe deep state</h2>
          </div>
          <Link
            href="/admin/billing"
            className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
          >
            Open Billing
            <ExternalLink className="h-3 w-3" />
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Stripe customers in DB"     value={(stripeCustomers ?? []).length} />
          <Stat label="Plans wired to Stripe price" value={((billingPlans ?? []) as { stripe_price_id: string | null }[]).filter((p) => p.stripe_price_id).length} />
          <Stat label="Webhook signature secret"   value={envState["STRIPE_WEBHOOK_SECRET"] ? "set" : "missing"} tone={envState["STRIPE_WEBHOOK_SECRET"] ? "ok" : "warn"} />
        </div>
      </section>

      {/* Outbound webhook log placeholder */}
      <section className="rounded-xl border border-dashed border-admin-border bg-admin-surface p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-warn/15 text-admin-warn shrink-0">
            <Webhook className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-admin-text">Outbound webhook event log</h2>
            <p className="mt-1 text-xs text-admin-text-mute max-w-2xl">
              We don&rsquo;t emit outbound webhooks yet — there&rsquo;s no event publishing path. Once we
              add CRM connectors, each push will land here with retry status. That requires (a) an{" "}
              <code className="text-admin-text">outbound_webhook_events</code> table, (b) a publisher
              that wraps each integration call, (c) a backoff retry worker. Defer until first CRM
              integration ships.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-admin-text-mute">
              <li>· Per-event status: queued / sent / failed / retried</li>
              <li>· Provider response code + first 500 chars of body</li>
              <li>· Retry button (idempotency-key based)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Env var inventory */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-admin-text-dim" />
            <h2 className="text-sm font-semibold text-admin-text">Env var inventory</h2>
          </div>
          <span className="text-xs text-admin-text-mute tabular-nums">
            {setEnvCount} of {requiredEnvCount} set in Vercel env
          </span>
        </header>
        <p className="text-xs text-admin-text-mute mb-4">
          Server-side check at request time. Values are not displayed — only presence/absence.
        </p>
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2">
            <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
              <th className="px-4 py-2 font-medium">Variable</th>
              <th className="px-4 py-2 font-medium">Used by</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-2">
            {Object.entries(envState)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([name, set]) => {
                const usedBy = PROVIDERS.filter((p) => p.envVars.some((ev) => ev.name === name)).map(
                  (p) => p.name
                );
                return (
                  <tr key={name}>
                    <td className="px-4 py-2 align-top">
                      <code className="text-xs text-admin-text">{name}</code>
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-admin-text-mute">
                      {usedBy.join(", ")}
                    </td>
                    <td className="px-4 py-2 align-top">
                      {set ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-admin-ok">
                          <ShieldCheck className="h-3 w-3" />
                          set
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-admin-warn">
                          <XCircle className="h-3 w-3" />
                          not set
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function Kpi({
  label,
  value,
  Icon,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  Icon: typeof Plug;
  tone: "ok" | "warn" | "danger" | "mute";
  hint: string;
}) {
  const cls =
    tone === "ok"
      ? "text-admin-ok bg-admin-ok/15"
      : tone === "warn"
      ? "text-admin-warn bg-admin-warn/15"
      : tone === "danger"
      ? "text-admin-danger bg-admin-danger/15"
      : "text-admin-text-dim bg-admin-surface-2";
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${cls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "mute",
}: {
  label: string;
  value: string | number;
  tone?: "ok" | "warn" | "mute";
}) {
  const cls =
    tone === "ok"
      ? "text-admin-ok"
      : tone === "warn"
      ? "text-admin-warn"
      : "text-admin-text";
  return (
    <div className="rounded-md border border-admin-border-2 bg-admin-surface-2 p-3">
      <div className="text-[10px] uppercase tracking-wider text-admin-text-dim">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${cls}`}>{value}</div>
    </div>
  );
}

const STATE_LABEL: Record<State, { label: string; cls: string; Icon: typeof ShieldCheck }> = {
  live:       { label: "Live",        cls: "bg-admin-ok/15 text-admin-ok",         Icon: ShieldCheck     },
  scaffolded: { label: "Scaffolded",  cls: "bg-admin-warn/15 text-admin-warn",     Icon: AlertTriangle   },
  promised:   { label: "Promised",    cls: "bg-admin-warn/15 text-admin-warn",     Icon: CircleSlash     },
  future:     { label: "Future",      cls: "bg-admin-text-dim/15 text-admin-text-dim", Icon: Clock       },
};

function ProviderCard({
  p,
  envState,
}: {
  p: Provider;
  envState: Record<string, boolean>;
}) {
  const sl = STATE_LABEL[p.state];
  const requiredOk = p.envVars.every((ev) => !ev.required || envState[ev.name]);
  return (
    <div
      className={[
        "rounded-xl border bg-admin-surface p-5",
        p.state === "live"
          ? "border-admin-ok/30"
          : p.state === "scaffolded"
          ? "border-admin-warn/40"
          : "border-admin-border-2",
      ].join(" ")}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-admin-text-dim">{p.category}</div>
          <h3 className="mt-0.5 text-sm font-semibold text-admin-text">{p.name}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sl.cls}`}
        >
          <sl.Icon className="h-2.5 w-2.5" />
          {sl.label}
        </span>
      </header>

      <p className="mt-2 text-xs text-admin-text-mute">{p.description}</p>

      <div className="mt-4 space-y-3 text-xs">
        {p.marketing_promise && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-admin-text-dim font-semibold">
              Marketing promise
            </div>
            <div className="mt-0.5 text-admin-text-mute">{p.marketing_promise}</div>
          </div>
        )}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-admin-text-dim font-semibold">
            Reality
          </div>
          <div className="mt-0.5 text-admin-text">{p.reality}</div>
        </div>
        {p.envVars.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-admin-text-dim font-semibold">
              Env vars{" "}
              {requiredOk ? (
                <span className="ml-1 text-admin-ok">(complete)</span>
              ) : (
                <span className="ml-1 text-admin-warn">(missing)</span>
              )}
            </div>
            <ul className="mt-1 space-y-0.5">
              {p.envVars.map((ev) => (
                <li key={ev.name} className="inline-flex items-center gap-1.5 mr-3">
                  {envState[ev.name] ? (
                    <ShieldCheck className="h-3 w-3 text-admin-ok" />
                  ) : (
                    <XCircle className="h-3 w-3 text-admin-warn" />
                  )}
                  <code className="text-admin-text-mute">{ev.name}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {p.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 pt-3 border-t border-admin-border-2">
          {p.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noreferrer" : undefined}
              className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
            >
              {l.label}
              {l.external && <ExternalLink className="h-3 w-3" />}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// keep imports referenced
const _kept = { Workflow, Building2, Server };
