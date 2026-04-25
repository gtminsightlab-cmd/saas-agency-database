import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Hygiene & Refresh"
      subtitle="Neilson watermark denylist · refresh queue · last-loaded-at per source."
      bullets={[
        "Editable Neilson canary list (emails, phone numbers, agency-name patterns)",
        "Refresh queue sorted by oldest data first",
        "Date heatmap of last-loaded-at per source",
      ]}
    />
  );
}
