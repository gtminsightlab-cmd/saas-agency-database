import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CarrierManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function AdminVerticalDetail({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: vertical } = await supabase
    .from("vertical_markets")
    .select("id,slug,name,description")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!vertical) notFound();

  const { data: mapped } = await supabase
    .from("carrier_verticals")
    .select("carrier_id,note,weight,carriers(id,name,group_name)")
    .eq("vertical_id", vertical.id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/verticals"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> All verticals
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Vertical</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">{vertical.name}</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">{vertical.description}</p>
      </div>

      <CarrierManager
        verticalId={vertical.id}
        verticalName={vertical.name}
        initialMapped={(mapped ?? []) as any}
      />
    </div>
  );
}
