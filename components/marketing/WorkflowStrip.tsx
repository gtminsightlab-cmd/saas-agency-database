type WorkflowStep = {
  label: string;
  description: string;
};

export function WorkflowStrip({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.label} className="relative rounded-xl bg-slate-50 p-4">
          <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-black text-white">
            {index + 1}
          </div>
          <h3 className="text-sm font-black text-slate-950">{step.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
