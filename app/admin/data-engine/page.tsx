import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Data Engine"
      subtitle="Sources · Pipelines · Records · Freshness — the AdList ingestion control center."
      bullets={[
        "Drag/drop xlsx upload that runs the watermark-filter → dedup → merge pipeline",
        "Visual pipeline flow with retry on each node",
        "Per-table freshness scoreboard that drives Hygiene Credit eligibility",
      ]}
    />
  );
}
