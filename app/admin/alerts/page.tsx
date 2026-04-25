import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Alerts & Risk"
      subtitle="Mass-export attempts · watermark canary detections · advisor regressions."
      bullets={[
        "Severity table grouped by category",
        "Watermark-canary live feed",
        "Vercel deploy + Supabase advisor regression watchers",
      ]}
    />
  );
}
