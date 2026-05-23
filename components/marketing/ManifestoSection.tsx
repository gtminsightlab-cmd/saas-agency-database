/**
 * Operator-voice manifesto section. Editorial pull-quote between the
 * methodology block and the data-trust block on the marketing home.
 *
 * Voice: plain-spoken, distribution-literate, no SaaS-bro framing. The
 * section IS the brand "why" statement — distribution is judgment work,
 * not spreadsheet work. Per family P12 (no founder-personal claims),
 * stays in operator-voice category language without naming Master O.
 */
export function ManifestoSection() {
  return (
    <section
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-24"
      aria-labelledby="manifesto-heading"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.04),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Operator&rsquo;s view
          </div>

          <h2
            id="manifesto-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
          >
            Distribution is not a spreadsheet problem.
            <br />
            <span className="text-blue-700">It&rsquo;s a judgment problem.</span>
          </h2>
        </div>

        <div className="mt-10 space-y-5 text-center text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
          <p>
            Who can actually write this business? Who already understands the risk? Who&rsquo;s
            holding the carrier paper your program competes with? Who has too many markets?
            Who has too few? Who&rsquo;s worth a BDM&rsquo;s time?
          </p>

          <p>
            For years, distribution teams answered those questions with old CRM notes, conference
            memory, website logos, and generic lead databases. None of which read the appointment
            trail.
          </p>

          <p className="font-semibold text-navy-900">
            Agency Signal gives the market a better map.
          </p>

          <p>
            We start with the appointment trail because that&rsquo;s where market access shows
            up. Then we normalize the writing companies, connect them to parent groups, score
            the agency signal, and give distribution teams a list they can actually work.
          </p>
        </div>

        <div className="mt-12 mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

        <p className="mt-8 text-center font-serif italic text-lg leading-relaxed text-slate-600 sm:text-xl">
          The goal is not more names.
          <br />
          The goal is fewer wasted conversations.
        </p>
      </div>
    </section>
  );
}
