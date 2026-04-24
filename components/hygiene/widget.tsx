import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function HygieneWidget() {
  const supabase = createClient();
  const { data } = await supabase.from("v_my_hygiene_summary").select("*").maybeSingle();
  const updatesThisMonth = data?.updates_this_month ?? 0;
  const listsNeedingRedownload = data?.lists_needing_redownload ?? 0;

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-4">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-green-100">
        <ShieldCheck className="h-5 w-5 text-green-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-green-900">
          {updatesThisMonth > 0
            ? "We updated " + updatesThisMonth.toLocaleString() + " of your saved contacts this month."
            : "Your saved contacts are up-to-date."}
        </div>
        {listsNeedingRedownload > 0 && (
          <div className="text-xs text-green-800 mt-0.5">
            {listsNeedingRedownload} list{listsNeedingRedownload === 1 ? "" : "s"} ready for a free re-download.
          </div>
        )}
      </div>
      <Link
        href="/hygiene"
        className="inline-flex items-center gap-1 rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
      >
        View <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
