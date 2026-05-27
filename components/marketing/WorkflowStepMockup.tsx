import { Workflow } from "lucide-react";

type WorkflowStep = {
  num: number;
  title: string;
  detail: string;
  meta: string;
};

const STEPS: WorkflowStep[] = [
  { num: 1, title: "Define the appointment shape",       detail: "Pick the carrier, state, vertical, and class of business that matches your distribution gap.",      meta: "~30 sec" },
  { num: 2, title: "Filter the agency universe",         detail: "Agency Signal narrows ~42k commercial agencies to the ones appointed (or not) where you need them.", meta: "Real-time"  },
  { num: 3, title: "Review verified appointment context", detail: "Each row carries the carrier match, last-verified date, contacts, and parent-group mapping.",         meta: "May 2026" },
  { num: 4, title: "Export the recruit list",            detail: "Save as a recruit list or download a CSV with the contacts your team needs to call this week.",       meta: "Export-ready" },
];

export function WorkflowStepMockup() {
  return (
    <figure
      role="img"
      aria-label="Example use-case workflow: 4-step playbook from defining the appointment shape through exporting the recruit list."
      className="relative w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1 shadow-2xl shadow-blue-900/20 backdrop-blur"
    >
      <div className="rounded-[14px] bg-slate-900 ring-1 ring-inset ring-slate-700/50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Workflow className="h-3.5 w-3.5" aria-hidden="true" />
            Recruit Playbook
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-[11px] font-medium text-slate-300">Live</span>
          </div>
        </div>

        <ol className="divide-y divide-slate-800">
          {STEPS.map((step) => (
            <li key={step.num} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/40">
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 font-mono text-xs font-semibold text-cyan-200"
              >
                {step.num}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-100">{step.title}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{step.meta}</span>
                </div>
                <p className="mt-0.5 text-xs leading-5 text-slate-400">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex items-center justify-between gap-3 border-t border-slate-700/60 px-4 py-3 text-[11px] text-slate-400">
          <span>Most teams complete this loop in under 10 minutes.</span>
          <span className="font-mono text-slate-500">/build-list</span>
        </div>
      </div>
    </figure>
  );
}
