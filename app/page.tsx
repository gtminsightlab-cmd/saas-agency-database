import Link from "next/link";
import { Check, Filter, Download, Search, Zap, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";

export const dynamic = "force-dynamic";

export default async function MarketingHome() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Live row counts to use as social proof in the hero (pulled from Supabase)
  const [carriers, affiliations, plans] = await Promise.all([
    supabase.from("carriers").select("id", { count: "exact", head: true }),
    supabase.from("affiliations").select("id", { count: "exact", head: true }),
    supabase
      .from("billing_plans")
      .select("code, name, tagline, price_cents, interval, download_quota, features, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
  ]);

  const carrierCount = carriers.count ?? 0;
  const affiliationCount = affiliations.count ?? 0;

  return (
    <div className="bg-white">
      <MarketingNav isAuthed={!!user} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Zap className="h-3.5 w-3.5" />
              Built for insurance carriers, MGAs, and wholesalers
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find the right commercial agency <span className="text-brand-600">in seconds</span>.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Search {carrierCount.toLocaleString()}+ carriers and {affiliationCount}+ cluster
              networks across tens of thousands of independent agencies. Filter by appointments,
              geography, AMS, and agency size. Export contact rosters on demand.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href={user ? "/build-list" : "/sign-up"}
                className="rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                {user ? "Go to your dashboard" : "Get started — free"}
              </Link>
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-gray-900 hover:text-gray-700"
              >
                See how it works →
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              No credit card required · Free forever plan
            </p>
          </div>

          {/* Trust bar */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-3xl mx-auto">
            <Stat label="Carriers" value={carrierCount.toLocaleString()} />
            <Stat label="Affiliations" value={affiliationCount.toString()} />
            <Stat label="Agencies indexed" value="36,000+" />
   