import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";

export function ComingSoon({
  title,
  subtitle,
  bullets,
}: {
  title: string;
  subtitle: string;
  bullets?: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">{title}</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">{title}</h1>
        <p className="mt-1 text-sm text-admin-text-mute">{subtitle}</p>
      </div>

      <div className="rounded-xl border border-dashed border-admin-border bg-admin-surface p-10 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-admin-warn/15 text-admin-warn">
          <Construction className="h-5 w-5" />
        </span>
        <h2 className="mt-3 text-lg font-semibold text-admin-text">Module scaffolded</h2>
        <p className="mt-1 text-sm text-admin-text-mute max-w-md mx-auto">
          This page is reserved in the sidebar. Implementation is queued — see the build plan in the
          admin spec.
        </p>
        {bullets && (
          <ul className="mt-5 mx-auto max-w-md text-left text-xs text-admin-text-mute space-y-1.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1 w-1 rounded-full bg-admin-text-dim" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
