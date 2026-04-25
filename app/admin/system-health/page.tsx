import { ComingSoon } from "../_shell/coming-soon";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ComingSoon
      title="System Health"
      subtitle="API · Database · Data Loaders · Logs."
      bullets={[
        "Status grid pulling from PostgREST + Supabase advisors + Vercel + Stripe",
        "pg_stat_statements + Edge Function tail",
        "GitHub Actions latest run",
      ]}
    />
  );
}
