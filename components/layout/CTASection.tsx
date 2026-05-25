import Link from "next/link";

type CTA = {
  label: string;
  href: string;
};

type CTASectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryCta: CTA;
  secondaryCta?: CTA;
  /**
   * Use "gold" for Charter-specific CTAs where the primary action button should
   * carry the founder-economics gold accent. Default "blue" matches the rest of
   * the marketing surface.
   */
  primaryVariant?: "blue" | "gold";
};

/**
 * Closing CTA band — dark by default, single strong thought + one primary action.
 * Step 6 of the Agency Signal page schematic.
 */
export function CTASection({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  primaryVariant = "blue",
}: CTASectionProps) {
  const primaryButtonClass =
    primaryVariant === "gold"
      ? "inline-flex items-center justify-center rounded-md bg-gold-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-gold-400"
      : "inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500";

  return (
    <section className="border-t border-slate-800 bg-[#050B1E] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-balance text-3xl font-black tracking-[-0.03em] md:text-5xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{description}</p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={primaryCta.href} className={primaryButtonClass}>
              {primaryCta.label}
            </Link>
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-md border border-slate-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/5"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
