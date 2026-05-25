import Link from "next/link";

type PricingCardProps = {
  name: string;
  audience: string;
  price: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
};

export function PricingCard({
  name,
  audience,
  price,
  features,
  cta,
  href,
  highlighted = false,
}: PricingCardProps) {
  return (
    <article
      className={
        highlighted
          ? "relative rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-lg"
          : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      }
    >
      {highlighted ? (
        <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
          Most popular
        </div>
      ) : null}

      <h3 className="text-xl font-black text-slate-950">{name}</h3>
      <p className="mt-1 text-sm text-slate-600">{audience}</p>

      <div className="mt-6 text-3xl font-black tracking-[-0.03em] text-slate-950">
        {price}
      </div>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span className="text-teal-700">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={
          highlighted
            ? "mt-8 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-500"
            : "mt-8 inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-950 hover:bg-slate-50"
        }
      >
        {cta}
      </Link>
    </article>
  );
}
