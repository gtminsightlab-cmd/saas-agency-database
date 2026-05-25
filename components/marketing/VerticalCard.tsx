import Link from "next/link";

type VerticalCardProps = {
  name: string;
  mappedCarriers: number | string;
  description: string;
  tiers: {
    exposure: number | string;
    growing: number | string;
    specialist: number | string;
  };
  metrics: {
    agencies: number | string;
    locations: number | string;
    contacts: number | string;
    emails?: number | string;
    linkedin?: number | string;
    mobiles?: number | string;
  };
  href?: string;
};

export function VerticalCard({
  name,
  mappedCarriers,
  description,
  tiers,
  metrics,
  href,
}: VerticalCardProps) {
  const content = (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-950">{name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            {mappedCarriers} specialty carriers mapped
          </p>
        </div>
      </div>

      <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200">
        <Metric label="Exposure" value={tiers.exposure} />
        <Metric label="Growing" value={tiers.growing} />
        <Metric label="Specialist" value={tiers.specialist} />
      </div>

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 md:grid-cols-3">
        <Metric label="Agencies" value={metrics.agencies} />
        <Metric label="Locations" value={metrics.locations} />
        <Metric label="Contacts" value={metrics.contacts} />
        {metrics.emails ? <Metric label="Emails" value={metrics.emails} /> : null}
        {metrics.linkedin ? <Metric label="LinkedIn" value={metrics.linkedin} /> : null}
        {metrics.mobiles ? <Metric label="Mobiles" value={metrics.mobiles} /> : null}
      </div>

      {href ? (
        <div className="mt-5 text-sm font-bold text-teal-700">View vertical →</div>
      ) : null}
    </article>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-b border-r border-slate-200 p-3 last:border-r-0">
      <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-slate-950">{value}</div>
    </div>
  );
}
