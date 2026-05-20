import { Check } from "lucide-react";
import clsx from "clsx";

export type Step = "build" | "review" | "download";

const steps: { key: Step; label: string; n: number }[] = [
  { key: "build", label: "Build", n: 1 },
  { key: "review", label: "Review", n: 2 },
  { key: "download", label: "Download", n: 3 }
];

/**
 * Linear 3-step progress indicator for the Build Recruit List flow.
 * Read-only — steps are not clickable; the user navigates via Save / Edit
 * Filters / Download CTAs on each page. D-024 a11y polish (Session 29):
 *  - <nav aria-label="Progress"> landmark + semantic ordered list
 *  - aria-current="step" on the active step
 *  - sr-only status text per step so screen readers announce "completed",
 *    "current step", or "upcoming"
 *  - connectors are aria-hidden (decorative)
 */
export function ProgressStepper({ current }: { current: Step }) {
  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-0 text-sm">
        {steps.map((s, i) => {
          const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming";
          const statusLabel =
            state === "done" ? "Completed" : state === "current" ? "Current step" : "Upcoming";
          return (
            <li
              key={s.key}
              className="flex items-center"
              aria-current={state === "current" ? "step" : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                    state === "done" && "bg-green-500 text-white",
                    state === "current" && "bg-brand-600 text-white",
                    state === "upcoming" && "bg-gray-200 text-gray-500"
                  )}
                  aria-hidden="true"
                >
                  {state === "done" ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span
                  className={clsx(
                    "font-medium",
                    state === "current" && "text-gray-900",
                    state === "done" && "text-gray-700",
                    state === "upcoming" && "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
                <span className="sr-only">— {statusLabel}</span>
              </div>
              {i < steps.length - 1 && (
                <span className="mx-4 h-px w-12 sm:w-20 bg-gray-200" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
