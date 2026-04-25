import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Integrations"
      subtitle="Stripe (sandbox) · CRM stubs · Zapier · webhook event log."
      bullets={[
        "Show real status: connected, stub-scaffolded, not configured",
        "Per-integration env-var inventory",
        "Outbound webhook log with retry status",
      ]}
    />
  );
}
