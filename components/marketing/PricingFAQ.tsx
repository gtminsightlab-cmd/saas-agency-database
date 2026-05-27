type FAQ = {
  question: string;
  answer: string;
};

const FAQS: FAQ[] = [
  {
    question: "Can I buy just one state?",
    answer:
      "Yes. You can build a custom file around one state, several states, or a multi-region mix. Pricing depends on how many records match your selected filters.",
  },
  {
    question: "Can I test the data first?",
    answer:
      "Yes. Start with a 50-contact sample for $75 and review the records in your own workflow before upgrading.",
  },
  {
    question: "Do you offer monthly subscriptions?",
    answer:
      "Yes. Monthly plans (Starter, Growth, Pro) are designed for teams that want ongoing access without committing to a large annual license.",
  },
  {
    question: "What if I want the full database?",
    answer:
      "The National Founder License gives you full U.S. access for $12,500 annually — a lower-friction alternative to legacy providers.",
  },
  {
    question: "Can I upgrade from a sample or smaller order?",
    answer:
      "Yes. If you start small and want more data later, we can apply your first purchase toward a larger package within a defined upgrade window.",
  },
  {
    question: "How is pricing calculated for custom files?",
    answer:
      "Bulk purchases are priced by selected record count, with automatic volume discounts as your order grows (from $1.20/record at 100 down to $0.40/record at 15,000+).",
  },
];

export function PricingFAQ() {
  return (
    <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
      {FAQS.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-lg border border-slate-200 bg-white p-5 open:bg-slate-50"
        >
          <summary className="cursor-pointer list-none text-base font-bold text-slate-950 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 rounded-sm">
            <span className="flex items-start justify-between gap-3">
              <span>{faq.question}</span>
              <span
                aria-hidden="true"
                className="select-none text-xl font-black leading-none text-teal-700 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-6 text-slate-700">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
