type UseCasePlayProps = {
  number: string;
  title: string;
  who: string;
  signal: string;
  when: string;
  action: string;
  result: string;
};

export function UseCasePlay({
  number,
  title,
  who,
  signal,
  when,
  action,
  result,
}: UseCasePlayProps) {
  return (
    <article className="grid gap-6 border-t border-slate-200 py-10 md:grid-cols-[120px_1fr]">
      <div className="text-sm font-black text-teal-700">{number}</div>
      <div>
        <h3 className="text-2xl font-black tracking-[-0.02em] text-slate-950">{title}</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Info label="Who" value={who} />
          <Info label="Signal" value={signal} />
          <Info label="When" value={when} />
          <Info label="Action" value={action} />
        </div>
        <p className="mt-5 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
          <span className="font-black">Result: </span>
          {result}
        </p>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm leading-6 text-slate-700">{value}</div>
    </div>
  );
}
