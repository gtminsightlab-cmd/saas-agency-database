import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="Search & Index"
      subtitle="What filters do users pick? Which combinations convert to a download?"
      bullets={[
        "Filter combination histogram",
        "Zero-result detector (UX bug indicator)",
        "Debug ranking toggle for the AI ranking layer when added",
      ]}
    />
  );
}
