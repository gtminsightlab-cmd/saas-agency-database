import Link from "next/link";

export function SampleOfferBanner() {
  return (
    <aside
      aria-label="Starter sample offer"
      className="rounded-xl border border-cyan-200 bg-cyan-50 px-6 py-8 md:px-10 md:py-10"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Not ready for a big purchase?</p>
          <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950">
            Start with 50 filtered commercial-insurance contacts for $75.
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Choose your geography and filters, export the records, and see the quality for yourself. If you
            move into a larger order later, we can apply your sample toward the upgrade within the window.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-md bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            Try the sample &rarr;
          </Link>
        </div>
      </div>
    </aside>
  );
}
