import { Check, X } from "lucide-react";

type Row = { generic: string; agencySignal: string };

const ROWS: Row[] = [
  { generic: "Targets by title and revenue band",        agencySignal: "Targets by verified carrier appointment" },
  { generic: "Stale CRM records",                        agencySignal: "Monthly refresh against state DOI filings" },
  { generic: "No proof of market access",                agencySignal: "Per-row verified-as-of date" },
  { generic: "Parent groups hidden",                     agencySignal: "Writing company → parent group mapping" },
  { generic: "More names, lower fit",                    agencySignal: "Fewer names, higher recruit fit" },
];

export function ComparisonSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="comparison-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="comparison-heading" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Appointment intelligence beats contact data.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Generic B2B contact databases answer one question. Carrier financial-data vendors answer another. Neither
            tells you which agencies actually hold the carrier paper your program competes with this quarter.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <div className="px-6 py-3">Generic contact database</div>
            <div className="border-l border-slate-200 bg-blue-50 px-6 py-3 text-blue-900">Seven16 Intel</div>
          </div>
          <ul className="divide-y divide-slate-200">
            {ROWS.map((row) => (
              <li key={row.generic} className="grid grid-cols-2">
                <div className="flex items-start gap-2 px-6 py-4 text-sm text-slate-600">
                  <X className="mt-0.5 h-4 w-4 flex-none text-rose-500" aria-label="Limitation" />
                  <span>{row.generic}</span>
                </div>
                <div className="flex items-start gap-2 border-l border-slate-200 bg-blue-50/40 px-6 py-4 text-sm font-medium text-navy-900">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-600" aria-label="Strength" />
                  <span>{row.agencySignal}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
