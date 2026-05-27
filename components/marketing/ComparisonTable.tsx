import { Check, Minus } from "lucide-react";

const ROWS: Array<{ feature: string; agencySignal: boolean; legacy: "no" | "limited" }> = [
  { feature: "Transparent starting prices", agencySignal: true, legacy: "no" },
  { feature: "Paid sample available", agencySignal: true, legacy: "limited" },
  { feature: "Monthly subscription option", agencySignal: true, legacy: "limited" },
  { feature: "Custom list builder", agencySignal: true, legacy: "limited" },
  { feature: "National founder pricing", agencySignal: true, legacy: "limited" },
  { feature: "Built for budget-conscious buyers", agencySignal: true, legacy: "no" },
];

const LEGACY_LABEL: Record<"no" | "limited", string> = {
  no: "Often no",
  limited: "Usually limited or sales-led",
};

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Feature comparison between Agency Signal and legacy quote-driven commercial-insurance data vendors.
        </caption>
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Feature
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-teal-700">
              Agency Signal
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Legacy quote-driven vendors
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <th scope="row" className="px-4 py-3 font-semibold text-slate-900">
                {row.feature}
              </th>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2 text-teal-700">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Yes</span>
                  Yes
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Minus className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">No or limited</span>
                  {LEGACY_LABEL[row.legacy]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
