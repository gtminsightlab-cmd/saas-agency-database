import Link from "next/link";
import { Users2, Crown, Mail, ArrowLeft, Lock } from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import InviteForm from "./invite-form";
import TeamRowActions from "./row-actions";

export const dynamic = "force-dynamic";

type SeatInfo = {
  used: number;
  cap: number;
  plan_name: string | null;
  has_active_plan: boolean;
  can_invite: boolean;
};

type TeamRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  invite_status: "active" | "invited" | "revoked";
  invited_at: string | null;
  accepted_at: string | null;
  invited_by_email: string | null;
  is_self: boolean;
};

export default async function TeamPage() {
  const supabase = createClient();

  const [{ data: seatRows }, { data: teamRows }] = await Promise.all([
    supabase.rpc("get_my_seat_info"),
    supabase.rpc("list_my_team"),
  ]);

  const seat: SeatInfo = (seatRows as SeatInfo[] | null)?.[0] ?? {
    used: 0, cap: 1, plan_name: null, has_active_plan: false, can_invite: false,
  };
  const rows: TeamRow[] = (teamRows ?? []) as TeamRow[];

  const remaining = Math.max(0, seat.cap - seat.used);
  const owner = rows.find((r) => r.invited_at === null);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/build-list"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <span className="text-sm text-gray-500">
            {seat.used} of {seat.cap} seat{seat.cap === 1 ? "" : "s"} used
            {seat.plan_name ? <> &middot; <span className="font-medium text-gray-700">{seat.plan_name}</span> plan</> : null}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl">
          Paid plans include the account owner plus up to 2 invited team members.
          Invitees sign in with their own login and inherit the same plan + tenant data.
        </p>

        {/* KPI strip */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Stat label="Active members" value={rows.filter((r) => r.invite_status === "active").length} Icon={Users2} />
          <Stat label="Pending invites" value={rows.filter((r) => r.invite_status === "invited").length} Icon={Mail} />
          <Stat label="Seats remaining" value={remaining} Icon={Crown} highlight={remaining > 0} />
        </div>

        {/* Invite form / upgrade gate */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
          <header className="mb-3">
            <h2 className="text-base font-semibold text-gray-900">Invite a team member</h2>
            <p className="mt-1 text-xs text-gray-500">
              They&apos;ll get a link to set up their own account. The seat is reserved as soon as you send the invite.
            </p>
          </header>

          {!seat.has_active_plan ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Inviting team members requires a paid plan.</div>
                  <p className="mt-1 text-amber-800">
                    Upgrade to share access with up to 2 colleagues on the same data, filters, and downloads.
                  </p>
                  <Link href="/#pricing" className="mt-2 inline-block text-sm font-semibold text-amber-900 underline">
                    See pricing &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : remaining <= 0 ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              You&apos;ve used all {seat.cap} seats on your plan. Revoke a pending invite to free up a seat.
            </div>
          ) : (
            <InviteForm remaining={remaining} />
          )}
        </section>

        {/* Members table */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <header className="px-5 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Members &amp; pending invites</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Owner is the original account holder. Invites convert to active the moment the invitee signs up.
            </p>
          </header>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">User</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Role</th>
                <th className="px-5 py-2.5 font-medium">Invited</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">No members yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className={r.invite_status === "invited" ? "bg-amber-50/40" : ""}>
                  <td className="px-5 py-3 align-top">
                    <div className="font-medium text-gray-900 truncate">{r.full_name || r.email.split("@")[0]}</div>
                    <div className="text-xs text-gray-500 truncate">{r.email}</div>
                    {r.is_self && <span className="mt-1 inline-block rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">You</span>}
                  </td>
                  <td className="px-5 py-3 align-top">
                    <StatusPill status={r.invite_status} />
                  </td>
                  <td className="px-5 py-3 align-top text-gray-700">
                    {r.invited_at === null ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Crown className="h-3.5 w-3.5" /> Owner
                      </span>
                    ) : (
                      <span className="text-gray-500">{r.role.replace("_", " ")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 align-top text-xs text-gray-500">
                    {r.invited_at
                      ? <>{new Date(r.invited_at).toLocaleDateString()} <br /><span className="text-gray-400">by {r.invited_by_email ?? "—"}</span></>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3 align-top text-right">
                    {r.invite_status === "invited" && (
                      <TeamRowActions id={r.id} email={r.email} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-500">
          Need more than 3 seats? Reply to your latest invoice or email <a href="mailto:hello@seven16group.com" className="font-medium text-brand-700">hello@seven16group.com</a> &mdash; team plans available.
        </p>
      </div>
    </AppShell>
  );
}

function Stat({
  label, value, Icon, highlight = false,
}: {
  label: string; value: number; Icon: typeof Users2; highlight?: boolean;
}) {
  return (
    <div className={"rounded-lg border p-4 " + (highlight ? "border-brand-200 bg-brand-50/50" : "border-gray-200 bg-white")}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">{label}</span>
        <Icon className={"h-4 w-4 " + (highlight ? "text-brand-700" : "text-gray-400")} />
      </div>
      <div className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: "active" | "invited" | "revoked" }) {
  if (status === "active") {
    return <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800">Active</span>;
  }
  if (status === "invited") {
    return <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Pending</span>;
  }
  return <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">Revoked</span>;
}
