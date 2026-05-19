import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { CheckCircle2, AlertCircle, Clock, Info, XCircle, ShieldCheck } from "lucide-react";
import clsx from "clsx";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "verified";

type StatusPillProps = {
  tone?: Tone;
  icon?: ComponentType<LucideProps>;
  label: string;
  srPrefix?: string;
  className?: string;
};

const TONE_STYLES: Record<Tone, { bg: string; text: string; ring: string; defaultIcon: ComponentType<LucideProps> }> = {
  success:  { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", defaultIcon: CheckCircle2 },
  warning:  { bg: "bg-amber-50",   text: "text-amber-800",   ring: "ring-amber-200",   defaultIcon: AlertCircle  },
  danger:   { bg: "bg-rose-50",    text: "text-rose-800",    ring: "ring-rose-200",    defaultIcon: XCircle      },
  info:     { bg: "bg-blue-50",    text: "text-blue-800",    ring: "ring-blue-200",    defaultIcon: Info         },
  neutral:  { bg: "bg-slate-100",  text: "text-slate-700",   ring: "ring-slate-200",   defaultIcon: Clock        },
  verified: { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", defaultIcon: ShieldCheck  },
};

export function StatusPill({ tone = "neutral", icon, label, srPrefix, className }: StatusPillProps) {
  const styles = TONE_STYLES[tone];
  const Icon = icon ?? styles.defaultIcon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        styles.bg,
        styles.text,
        styles.ring,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {srPrefix && <span className="sr-only">{srPrefix}:</span>}
      <span>{label}</span>
    </span>
  );
}
