import Link from "next/link";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Truck,
  Stethoscope,
  HardHat,
  Wheat,
  Building2,
  Home,
  UtensilsCrossed,
  Factory,
  Cpu,
  Flame,
  ShoppingCart,
  Briefcase,
  ArrowRight,
  Users,
  Mail,
} from "lucide-react";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/LoadingState";
import { StatusPill } from "@/components/ui/StatusPill";

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Truck,
  Stethoscope,
  HardHat,
  Wheat,
  Building2,
  Home,
  UtensilsCrossed,
  Factory,
  Cpu,
  Flame,
  ShoppingCart,
  Briefcase,
};

export type VerticalOpportunityCardProps = {
  slug: string;
  name: string;
  iconKey?: string | null;
  agencyCount: number;
  contactCount: number;
  contactsWithEmail: number;
  mappedCarrierCount: number;
  agenciesSpecialist: number;
  loading?: boolean;
  /** Optional href override; defaults to /verticals/[slug]. */
  href?: string;
};

/**
 * Card surface for a single vertical opportunity. Used on /home and any
 * dashboard surface that lists verticals as actionable cards (rather than
 * the longer marketing-style cards on /verticals).
 *
 * Per D-024:
 *   - Loading state (Skeleton placeholders on every numeric)
 *   - Partial-data resilience (zero counts render "—", never crash)
 *   - Accessible (focus-visible ring, semantic heading, icon decorative)
 *
 * Density tier ("Specialist hub" / "Strong coverage" / "Emerging") is
 * derived from `agenciesSpecialist` + `agencyCount` — visible signal for
 * which verticals are densest in the data without needing a separate
 * column header.
 */
export function VerticalOpportunityCard({
  slug,
  name,
  iconKey,
  agencyCount,
  contactCount,
  contactsWithEmail,
  mappedCarrierCount,
  agenciesSpecialist,
  loading,
  href,
}: VerticalOpportunityCardProps) {
  const Icon = (iconKey && ICON_MAP[iconKey]) || Briefcase;
  const target = href ?? `/verticals/${slug}`;

  const tier = densityTier({ agencyCount, agenciesSpecialist });
  const emailPct =
    contactCount > 0
      ? Math.round((contactsWithEmail / contactCount) * 100)
      : null;

  return (
    <Link
      href={target}
      className="group block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      aria-label={`${name} vertical — open detail page`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700"
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900">{name}</h3>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {mappedCarrierCount} specialty {mappedCarrierCount === 1 ? "carrier" : "carriers"}
            </p>
          </div>
        </div>
        <StatusPill
          tone={tier.tone}
          label={tier.label}
          className="shrink-0"
        />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
        <Stat label="Agencies" value={agencyCount} loading={loading} icon={Users} />
        <Stat label="Contacts" value={contactCount} loading={loading} />
        <Stat
          label={emailPct !== null ? `${emailPct}% email` : "Emails"}
          value={contactsWithEmail}
          loading={loading}
          icon={Mail}
        />
      </dl>

      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:text-brand-800">
        View detail
        <ArrowRight
          className="h-3 w-3 transition group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  loading,
  icon: Icon,
}: {
  label: string;
  value: number;
  loading?: boolean;
  icon?: ComponentType<LucideProps>;
}) {
  return (
    <div>
      <dt className="flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
        {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
        {label}
      </dt>
      <dd className="mt-0.5 font-mono text-sm font-semibold text-gray-900 tabular-nums">
        {loading ? (
          <Skeleton className="mx-auto h-4 w-10" />
        ) : value > 0 ? (
          value.toLocaleString()
        ) : (
          "—"
        )}
      </dd>
    </div>
  );
}

function densityTier({
  agencyCount,
  agenciesSpecialist,
}: {
  agencyCount: number;
  agenciesSpecialist: number;
}): { label: string; tone: "success" | "info" | "neutral" } {
  if (agenciesSpecialist >= 100) return { label: "Specialist hub", tone: "success" };
  if (agencyCount >= 2000) return { label: "Strong coverage", tone: "info" };
  if (agencyCount >= 250) return { label: "Emerging", tone: "neutral" };
  return { label: "Niche", tone: "neutral" };
}

/**
 * Convenience grid wrapper. Renders a responsive grid (1-up mobile,
 * 2-up tablet, 4-up desktop) and applies the loading skeleton shell when
 * the verticals array is empty AND `loading` is true.
 */
export function VerticalOpportunityGrid({
  verticals,
  loading,
  emptyHeading = "No verticals available yet",
  emptyBody = "Data is loading or no verticals have been seeded for this tenant.",
}: {
  verticals: VerticalOpportunityCardProps[];
  loading?: boolean;
  emptyHeading?: string;
  emptyBody?: string;
}) {
  if (loading && verticals.length === 0) {
    return (
      <ul className={clsx("grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}>
            <SkeletonCard />
          </li>
        ))}
      </ul>
    );
  }

  if (verticals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm font-semibold text-gray-900">{emptyHeading}</p>
        <p className="mt-1 text-xs text-gray-600">{emptyBody}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {verticals.map((v) => (
        <li key={v.slug}>
          <VerticalOpportunityCard {...v} />
        </li>
      ))}
    </ul>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-32" />
      <Skeleton className="mt-1 h-3 w-20" />
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-6 w-12" />
        ))}
      </div>
    </div>
  );
}
