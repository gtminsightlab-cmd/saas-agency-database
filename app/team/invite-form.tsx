"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export default function InviteForm({ remaining }: { remaining: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    setInviteLink(null);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim().toLowerCase(), full_name: fullName.trim() || null }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.message || `Could not send invite (${res.status})`);
        setBusy(false);
        return;
      }
      // Success — show shareable sign-up link, clear form, refresh list.
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setInviteLink(`${origin}/sign-up?email=${encodeURIComponent(email.trim().toLowerCase())}&invited=1`);
      setEmail("");
      setFullName("");
      setBusy(false);
      startTransition(() => router.refresh());
    } catch (err: any) {
      setError(err?.message || "Network error sending invite");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="invite_email" className="block text-xs font-medium text-gray-700">Work email</label>
          <input
            id="invite_email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            disabled={busy}
          />
        </div>
        <div>
          <label htmlFor="invite_name" className="block text-xs font-medium text-gray-700">Full name <span className="text-gray-400">(optional)</span></label>
          <input
            id="invite_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            disabled={busy}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || pending}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {busy ? "Sending…" : "Send invite"}
        </button>
        <span className="text-xs text-gray-500">{remaining} seat{remaining === 1 ? "" : "s"} remaining</span>
      </div>

      {inviteLink && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <div className="font-semibold">Invite reserved.</div>
          <p className="mt-1 text-green-800 text-xs">
            Share this sign-up link with them — when they create their account using this email, they&apos;ll join your team automatically:
          </p>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-green-300 bg-white px-2 py-1.5 text-xs font-mono text-gray-700 overflow-x-auto">
            <span className="truncate">{inviteLink}</span>
            <button
              type="button"
              onClick={() => { navigator.clipboard?.writeText(inviteLink); }}
              className="ml-auto rounded-md border border-green-300 px-2 py-0.5 text-[11px] font-semibold text-green-800 hover:bg-green-100 shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
