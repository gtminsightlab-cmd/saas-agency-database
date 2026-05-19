import Link from "next/link";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/LoadingState";
import clsx from "clsx";

type Delta = {
  value: string;
  intent?: "positive" | "negative" | "neutral";
};

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: Delta;
  icon?: ComponentType<LucideProps>;
  href?: string;
  loading?: boolean;
};

const intentClasses: Record<NonNullable<Delta["intent"]>, string> = {
  positive: "text-emerald-700",
  negative: "text-rose-700",
  neutral: "text-gray-500"
};

const intentIcons: Record<NonNullable<Delta["intent"]>, ComponentType<LucideProps>> = {
  positive: ArrowUpRight,
  negative: ArrowDownRight,
  neutral: ArrowRight
};

/**
 * Single KPI tile. Composes into KPI rows above a DataTable or chart.
 * Per D-024: loading state (Skeleton), partial-data resilience (delta is
 * optional), accessible (icon + text, never color-alone).
 */
export function MetricCard({
  title,
  value,
  subtitle,
  delta,
  icon: Icon,
  href,
  loading
}: Props) {
  const intent = delta?.intent ?? "neutral";
  const IntentIcon = intentIcons[intent];

  const inner = (
    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</div>
        {Icon && <Icon className="h-4 w-4 text-gray-400 flex-none" aria-hidden="true" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold text-gray-900 tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
        )}
        {delta && !loading && (
          <span className={clsx("inline-flex items-center gap-0.5 text-xs font-medium", intentClasses[intent])}>
            <IntentIcon className="h-3 w-3" aria-hidden="true" />
            {delta.value}
          </span>
        )}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-500 truncate">{subtitle}</div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
