import Link from "next/link";

type EditorialCardProps = {
  category: string;
  title: string;
  description: string;
  meta?: string;
  href?: string;
  comingSoon?: boolean;
};

export function EditorialCard({
  category,
  title,
  description,
  meta,
  href,
  comingSoon = false,
}: EditorialCardProps) {
  const content = (
    <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
          {category}
        </span>
        {comingSoon ? (
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Coming soon
          </span>
        ) : null}
      </div>

      <h3 className="mt-6 text-xl font-black tracking-[-0.02em] text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-8 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{meta}</span>
        {!comingSoon ? <span className="text-teal-700">Read →</span> : null}
      </div>
    </article>
  );

  if (!href || comingSoon) return <div>{content}</div>;

  return <Link href={href}>{content}</Link>;
}
