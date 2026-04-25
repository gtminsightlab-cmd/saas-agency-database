import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Admin Settings"
      subtitle="Feature flags · env-var inventory · tenant defaults · audit log."
      bullets={[
        "Feature flag toggles (vertical filters, beta features, app dark mode)",
        "Env-var inventory: what's set in Vercel, what's missing",
        "Audit log search",
      ]}
    />
  );
}
