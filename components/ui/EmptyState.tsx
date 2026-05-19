import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { Inbox } from "lucide-react";
import clsx from "clsx";

type EmptyStateProps = {
  icon?: ComponentType<LucideProps>;
  heading: string;
  body?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  heading,
  body,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={clsx(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center",
        className
      )}
    >
      <Icon className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <h3 className="text-base font-semibold text-slate-900">{heading}</h3>
      {body && <p className="max-w-md text-sm text-slate-600">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
