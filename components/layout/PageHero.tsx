import Link from "next/link";
import { ReactNode } from "react";

type CTA = {
  label: string;
  href: string;
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  primaryCta?: CTA;
  secondaryCta?: CTA;
  rightRail?: ReactNode;
  variant?: "dark" | "light";
};

export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  primaryCta,
  secondaryCta,
  rightRail,
  variant = "dark",
}: PageHeroProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={
        isDark
          ? "border-b border-slate-800 bg-[#050B1E] text-white"
          : "border-b border-slate-200 bg-slate-50 text-slate-950"
      }
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-28">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div
              className={
                isDark
                  ? "mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200"
                  : "mb-5 inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700"
              }
            >
              {eyebrow}
            </div>
          ) : null}

          <h1 className="text-balance text-4xl font-black tracking-[-0.04em] md:text-6xl">
            {title}
            {highlight ? (
              <>
                {" "}
                <span className={isDark ? "text-cyan-300" : "text-teal-700"}>
                  {highlight}
                </span>
              </>
            ) : null}
          </h1>

          {description ? (
            <p
              className={
                isDark
                  ? "mt-6 max-w-2xl text-lg leading-8 text-slate-300"
                  : "mt-6 max-w-2xl text-lg leading-8 text-slate-600"
              }
            >
              {description}
            </p>
          ) : null}

          {(primaryCta || secondaryCta) ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500"
                >
                  {primaryCta.label}
                </Link>
              ) : null}

              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className={
                    isDark
                      ? "inline-flex items-center justify-center rounded-md border border-slate-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/5"
                      : "inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                  }
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {rightRail ? (
          <div className="flex items-center">
            {rightRail}
          </div>
        ) : null}
      </div>
    </section>
  );
}
