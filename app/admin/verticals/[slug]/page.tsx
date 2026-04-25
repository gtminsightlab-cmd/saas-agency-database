import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarrierManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function AdminVerticalDetail({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: vertical } = await supabase
    .from("vertical_markets")
    .select("id,slug,name,description")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!vertical) notFound();

  // Mapped carriers for this vertical
  const { data: mapped } = await supabase
    .from("carrier_verticals")
    .select("carrier_id,note,weight,carriers(id,name,group_name)")
    .eq("vertical_id", vertical.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/verticals" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
          ← All verticals
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy-800">{vertical.name}</h1>
        <p className="mt-1 text-sm text-gray-600">{vertical.description}</p>
      </div>

      <CarrierManager
        verticalId={vertical.id}
        verticalName={vertical.name}
        initialMapped={(mapped ?? []) as any}
      />
    </div>
  );
}
