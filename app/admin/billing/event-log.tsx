"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Filter, RefreshCw, Activity } from "lucide-react";
import type { EventSummary } from "./_lib/stripe-fetchers";

const TYPE_TONE: Record<string, string> = {
  // success-shaped events
  "checkout.session.completed":      "bg-admin-ok/15 text-admin-ok",
  "invoice.paid":                    "bg-admin-ok/15 text-admin-ok",
  "customer.subscription.created":   "bg-admin-ok/15 text-admin-ok",
  // mutation events
  "customer.subscription.updated":   "bg-admin-accent/15 text-admin-accent",
  "customer.subscription.deleted":   "bg-admin-warn/15 text-admin-warn",
  "invoice.payment_failed":          "bg-admin-danger/15 text-admin-danger",
  "charge.dispute.created":          "bg-admin-danger/15 text-admin-danger",
  "charge.refunded":                 "bg-admin-warn/15 text-admin-warn",
};

function toneFor(type: string): string {
  return TYPE_TONE[type] ?? "bg-admin-surface-2 text-admin-text-mute";
}

export function EventLog({
  events,
  dashboardBase,
}: {
  events: EventSummary[];
  dashboardBase: string;
}) {
  const [filter, setFilter] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  const types = useMemo(() => {
    const set = new Set(events.map((e) => e.type));
    return Array.from(set).sort();
  }, [events]);

  const visible = useMemo(() => {
    let v = events;
    if (filter) v = v.filter((e) => e.type === filter);
    if (pendingOnly) v = v.filter((e) => e.pending_webhooks > 0);
    return v;
  }, [events, filter, pendingOnly]);

  const total = events.length;
  const pending = events.filter((e) => e.pending_webhooks > 0).length;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-admin-border-2 bg-admin-surface-2/40 p-3">
        <Filter className="h-3.5 w-3.5 text-admin-text-dim" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-admin-border bg-admin-surface-2 px-2 py-1.5 text-xs text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="">All types ({total})</option>
          {types.map((t) => {
            const n = events.filter((e) => e.type === t).length;
            return (
              <option key={t} value={t}>
                {t} ({n})
              </option>
            );
          })}
        </select>
        <label className="inline-flex items-center gap-2 text-xs text-admin-text-mute select-none">
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(e) => setPendingOnly(e.target.checked)}
            className="rounded border-admin-border bg-admin-surface-2"
          />
          Pending webhooks only ({pending})
        </label>
        <span className="ml-auto text-xs text-admin-text-mute tabular-nums">
          {visible.length} of {total}
        </span>
      </div>

      {/* Event list */}
      {visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-admin-border bg-admin-surface-2/40 py-8 text-center">
          <Activity className="mx-auto h-5 w-5 text-admin-text-dim" />
          <div className="mt-2 text-sm text-admin-text-mute">No events match.</div>
        </div>
      ) : (
        <ul className="divide-y divide-admin-border-2 rounded-md border border-admin-border-2 bg-admin-surface-2/30 overflow-hidden">
          {visible.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className={`text-[10px] font-mono rounded px-1.5 py-0.5 shrink-0 ${toneFor(e.type)}`}
              >
                {e.type}
              </span>
              <div className="min-w-0 flex-1 flex flex-col">
                <code className="text-[11px] text-admin-text truncate">{e.id}</code>
                {e.object_id && (
                  <code className="text-[10px] text-admin-text-dim truncate">→ {e.object_id}</code>
                )}
              </div>
              {e.pending_webhooks > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-admin-warn/15 px-2 py-0.5 text-[10px] font-semibold text-admin-warn"
                  title="Webhooks not yet acknowledged by all endpoints"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  {e.pending_webhooks} pending
                </span>
              )}
              <span className="text-[10px] text-admin-text-dim shrink-0 tabular-nums">
                {new Date(e.created * 1000).toLocaleString()}
              </span>
              <a
                href={`${dashboardBase}/events/${e.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-admin-text-dim hover:text-admin-accent shrink-0"
                title="Open in Stripe"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
