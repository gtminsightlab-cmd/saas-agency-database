import { FileText, Building2, GitMerge, CalendarClock, UserCheck, BadgeCheck } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type Tile = {
  heading: string;
  body: string;
  icon: ComponentType<LucideProps>;
};

const TILES: Tile[] = [
  { icon: FileText,      heading: "State DOI filings",            body: "Public department-of-insurance filings are the ground truth for who's appointed where." },
  { icon: Building2,     heading: "Writing company normalization", body: "Carrier subsidiaries are reconciled to a canonical writing-company entity per filing." },
  { icon: GitMerge,      heading: "Parent group mapping",          body: "Writing companies roll up to their parent insurance group so program competition is legible." },
  { icon: CalendarClock, heading: "30-day refresh cycle",          body: "The full pipeline runs monthly. Rows stamped older than a quarter are flagged stale." },
  { icon: UserCheck,     heading: "Dual-agent review",             body: "Confidence-tier outputs from automated matching get a second pass before they flip to verified." },
  { icon: BadgeCheck,    heading: "Verified-as-of per row",        body: "Every agency, contact, and appointment carries a verified-as-of date — no opaque last-refreshed banner." },
];

export function DataTrustSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="trust-heading" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Verified against the filings buyers actually trust.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Every signal in the platform traces back to a public source. The methodology is open — the data is what it is.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map(({ icon: Icon, heading, body }) => (
            <li
              key={heading}
              className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5"
            >
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-navy-900">{heading}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
