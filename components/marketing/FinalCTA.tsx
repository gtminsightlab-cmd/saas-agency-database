import Link from "next/link";
import { ArrowRight } from "lucide-react";

type FinalCTAProps = {
  isAuthed: boolean;
};

export function FinalCTA({ isAuthed }: FinalCTAProps) {
  const primaryHref = isAuthed ? "/build-list" : "/sign-up";
  const primaryLabel = isAuthed ? "Open your dashboard" : "Browse agencies free";

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20" aria-labelledby="final-cta-heading">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 id="final-cta-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Distribution is not a spreadsheet problem. It&rsquo;s a judgment problem.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Who can actually write this business? Who already understands the risk? Who&rsquo;s worth a BDM&rsquo;s
          time? Browse the directory free, filter by carrier appointment, and build a recruit list grounded in
          verified market access — not job titles or self-reported tags.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/enterprise"
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Talk to distribution team
          </Link>
        </div>
      </div>
    </section>
  );
}
