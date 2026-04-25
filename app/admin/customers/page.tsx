import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Customers"
      subtitle="Tenants and users — impersonate, reset credits, adjust limits, suspend."
      bullets={[
        "Tenant table → drawer with Users, Plan, Seats, Usage %, Last Active",
        "Impersonate (one-shot signed JWT, audit-logged)",
        "Bulk actions: suspend, adjust limits, reset credits",
      ]}
    />
  );
}
