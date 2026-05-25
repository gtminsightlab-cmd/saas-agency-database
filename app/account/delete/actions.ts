"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Delete-my-data soft-delete action.
 *
 * What it does NOW (Stage 1):
 *   1. Verify the user is authenticated
 *   2. Mark app_users.is_active = false for this user's row
 *   3. Insert audit_log entry tagged 'account_delete_requested'
 *   4. Sign out (clears session cookie)
 *   5. Redirect to confirmation page
 *
 * What it does NOT do (Stage 2 — deferred to dedicated session):
 *   - Hard-delete auth.users record via Supabase Auth admin API
 *     (requires service_role; happens manually within 30 days)
 *   - Stripe customer deletion (manual via Stripe dashboard for now)
 *   - Cascading delete of saved_lists / search history (kept for the
 *     30-day grace window in case user wants to reverse)
 *
 * The "delete within 30 days" promise from /privacy is honored by
 * Master O processing this queue manually via Supabase Auth admin
 * dashboard. With pre-revenue volume this is sustainable; automation
 * comes when daily-deletes >5.
 */
export async function requestAccountDeletion(formData: FormData) {
  const confirmText = (formData.get("confirm") as string | null)?.trim();
  if (confirmText !== "DELETE") {
    return { ok: false, error: 'You must type "DELETE" exactly to confirm.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false, error: "Not signed in. Please sign in and try again." };
  }

  // Soft-delete: flip is_active=false on this user's app_users row.
  // RLS allows users to update their own row per the existing tenant
  // policy; if not, surface the error rather than silently failing.
  const { error: updateErr } = await supabase
    .from("app_users")
    .update({ is_active: false })
    .eq("user_id", user.id);

  if (updateErr) {
    return {
      ok: false,
      error: `Could not deactivate your account: ${updateErr.message}. Please email hello@seven16group.com directly.`,
    };
  }

  // Audit log: record the deletion request so Master O can process the
  // hard-delete within 30 days. This is the durable signal — even if
  // sign-out fails or the page navigation aborts, the request is logged.
  // Schema: action + resource_type are required (NOT NULL); resource_id
  // points at the user's auth uuid; metadata holds the structured detail.
  await supabase.from("audit_log").insert({
    action: "account_delete_requested",
    actor_user_id: user.id,
    actor_email: user.email,
    resource_type: "account",
    resource_id: user.id,
    metadata: {
      requested_at: new Date().toISOString(),
      source: "self_serve_/account/delete",
    },
  });

  // Sign out — clears the session cookie. The user is now both
  // soft-deleted (is_active=false) and signed out.
  await supabase.auth.signOut();

  redirect("/account/delete/confirmed");
}
