"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SaveListButton({ filterQs }: { filterQs: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You need to be signed in to save a list.");
      setSaving(false);
      return;
    }
    const { data: appUser } = await supabase
      .from("app_users")
      .select("id,tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!appUser) {
      setError("User record not found.");
      setSaving(false);
      return;
    }
    const { data, error: insertError } = await supabase
      .from("saved_lists")
      .insert({
        tenant_id: appUser.tenant_id,
        created_by: appUser.id,
        name,
        filters: { querystring: filterQs }
      })
      .select("id")
      .maybeSingle();
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setOpen(false);
    router.push(`/build-list/download?id=${data?.id ?? ""}&name=${encodeURIComponent(name)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Save
      </button>
      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-gray-900">Name your list</h3>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="mt-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 255))}
                maxLength={255}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="mt-1 text-right text-xs text-gray-400">{name.length}/255</div>
            </div>
            {error && (
              <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2"
              >
                Back
              </button>
              <button
                type="button"
                disabled={saving || !name.trim()}
                onClick={save}
                className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function defaultName() {
  const d = new Date();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${mm}-${dd}-${yyyy} ${h}:${String(m).padStart(2, "0")}${ampm}`;
}
