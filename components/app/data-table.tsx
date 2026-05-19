import type { ReactNode } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

type State = "ready" | "loading" | "empty" | "error";

type Props = {
  state?: State;
  emptyHeading?: string;
  emptyBody?: string;
  emptyAction?: ReactNode;
  errorMessage?: string;
  children: ReactNode;
};

/**
 * Chrome wrapper around a semantic <table>. Slot-based state handling
 * (loading / empty / error / ready) wires the D-024 primitives without
 * the caller needing to import them. Caller renders <table>...</table>
 * inside as children when state === "ready" (the default).
 *
 * Stays server-component-friendly. For client-side retry on error, the
 * caller wraps DataTable in an <ErrorBoundary> from components/ui or
 * relies on Next's error.tsx route boundary.
 */
export function DataTable({
  state = "ready",
  emptyHeading = "No records yet",
  emptyBody = "When data lands it'll show here.",
  emptyAction,
  errorMessage = "We couldn't load this table.",
  children
}: Props) {
  if (state === "loading") {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <LoadingState variant="block" label="Loading…" />
      </div>
    );
  }
  if (state === "empty") {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <EmptyState heading={emptyHeading} body={emptyBody} action={emptyAction} />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ErrorState message={errorMessage} />
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      {children}
    </div>
  );
}
