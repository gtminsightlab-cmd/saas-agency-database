import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account deletion received — Seven16 Intel",
  description: "Your Seven16 Intel account deletion request has been received and processed.",
};

/**
 * Renders after the server action soft-deletes the user + signs them out.
 * Public page (no auth required) since the user is now signed out.
 */
export default function DeleteConfirmedPage() {
  return (
    <div>
      <MarketingHeader isAuthed={false} theme="dark" />

      <main className="min-h-[60vh] bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <CheckCircle2 className="h-6 w-6 text-teal-700" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-[-0.02em] text-slate-950">
              Deletion request received.
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Your account has been deactivated and you&rsquo;ve been signed out. We&rsquo;ll permanently remove your personal data from our active systems within 30 days per our Privacy Policy.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-700">
              You&rsquo;ll receive a deletion-complete email at the address on file once the 30-day process finishes.
            </p>

            <div className="mt-6 rounded-md bg-slate-50 border border-slate-200 p-4 text-sm leading-6 text-slate-700">
              <strong className="font-black text-slate-950">Changed your mind?</strong> Email <a href="mailto:hello@seven16group.com?subject=Reverse%20account%20deletion%20request" className="font-bold text-teal-700 hover:text-teal-800">hello@seven16group.com</a> within the 30-day window and we can restore your account before the hard-delete runs.
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500"
              >
                Back to homepage
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Read the Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
