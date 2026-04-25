import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Billing"
      subtitle="MRR · plans · Stripe webhook health · Hygiene Credit ledger."
      bullets={[
        "Plans: Free Trial, Snapshot $125, Growth Member $99/mo (sandbox)",
        "Stripe webhook last-50 events with status, latency, retries, replay",
        "Hygiene Credit eligible-subscribers ledger (10% off month 6 + 12)",
      ]}
    />
  );
}
