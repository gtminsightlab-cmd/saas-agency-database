import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Usage & Limits"
      subtitle="Per-tenant caps for searches, exports, list downloads, and API calls."
      bullets={[
        "Sliders for each cap with hard/soft toggle",
        "Default limits stored in a tenant_limits table (to be created)",
        "Per-tenant override view",
      ]}
    />
  );
}
