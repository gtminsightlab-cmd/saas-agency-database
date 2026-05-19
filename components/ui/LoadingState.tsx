import { Loader2 } from "lucide-react";
import clsx from "clsx";

type LoadingStateProps = {
  label?: string;
  variant?: "inline" | "block" | "overlay";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_MAP = {
  sm: { spinner: "h-4 w-4", text: "text-xs" },
  md: { spinner: "h-5 w-5", text: "text-sm" },
  lg: { spinner: "h-8 w-8", text: "text-base" },
};

export function LoadingState({
  label = "Loading…",
  variant = "inline",
  size = "md",
  className,
}: LoadingStateProps) {
  const sizes = SIZE_MAP[size];

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={clsx(
        "flex items-center gap-2 text-slate-600",
        variant === "block" && "justify-center py-8",
        variant === "overlay" && "absolute inset-0 z-10 justify-center bg-white/70 backdrop-blur-sm",
        className
      )}
    >
      <Loader2 className={clsx(sizes.spinner, "animate-spin text-blue-600")} aria-hidden="true" />
      <span className={clsx(sizes.text, "font-medium")}>{label}</span>
    </div>
  );

  return content;
}

type SkeletonProps = { className?: string };

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={clsx("animate-pulse rounded bg-slate-200", className)}
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}
