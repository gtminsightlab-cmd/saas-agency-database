"use client";

import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import clsx from "clsx";

type ErrorStateProps = {
  heading?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  supportLink?: ReactNode;
  className?: string;
};

export function ErrorState({
  heading = "Something went wrong",
  message = "We hit an error loading this view. Please try again.",
  onRetry,
  retryLabel = "Try again",
  supportLink,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-6 py-10 text-center",
        className
      )}
    >
      <AlertTriangle className="h-9 w-9 text-rose-600" aria-hidden="true" />
      <h3 className="text-base font-semibold text-rose-900">{heading}</h3>
      <p className="max-w-md text-sm text-rose-800">{message}</p>
      {(onRetry || supportLink) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {retryLabel}
            </button>
          )}
          {supportLink}
        </div>
      )}
    </div>
  );
}
