import { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  variant?: "light" | "muted" | "dark";
};

export function Section({
  eyebrow,
  title,
  description,
  children,
  variant = "light",
}: SectionProps) {
  const classes = {
    light: "bg-white text-slate-950",
    muted: "bg-slate-50 text-slate-950",
    dark: "bg-[#050B1E] text-white",
  };

  return (
    <section className={`${classes[variant]} py-16 md:py-24`}>
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {(eyebrow || title || description) ? (
          <div className="mb-10 max-w-3xl">
            {eyebrow ? (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-balance text-3xl font-black tracking-[-0.03em] md:text-5xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                className={
                  variant === "dark"
                    ? "mt-5 text-lg leading-8 text-slate-300"
                    : "mt-5 text-lg leading-8 text-slate-600"
                }
              >
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}
