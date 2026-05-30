import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy — Seven16 Intel",
  description:
    "How Seven16 Intel collects, uses, and protects your data. What we share with third parties. How to request access, correction, deletion, or export of your data.",
};

const LAST_UPDATED = "2026-05-24";

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <MarketingHeader isAuthed={!!user} theme="dark" />

      <PageHero
        variant="dark"
        eyebrow={`Last updated ${LAST_UPDATED} · DRAFT`}
        title="Privacy Policy."
        description="What we collect, how we use it, what we share with third parties, and how to exercise your rights over your data. Written operator-direct — no boilerplate buried."
        primaryCta={{ label: "Request data deletion", href: "/account/delete" }}
        secondaryCta={{ label: "Email questions", href: "mailto:hello@seven16group.com?subject=Privacy%20question" }}
      />

      <Section variant="muted">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong className="font-black">DRAFT — awaiting counsel review.</strong> This policy is published in good faith and accurately describes current practice. It will be replaced with a counsel-reviewed version before charter outreach scales beyond the hand-picked cohort. If anything here conflicts with what we tell you in writing or in a contract, the contract governs.
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="1. Who we are"
        title="Seven16 Intel, a Seven16 Group product."
      >
        <div className="max-w-3xl space-y-4 text-base leading-7 text-slate-700">
          <p>
            Seven16 Intel is operated by Seven16 Group. We process data described below as the &ldquo;controller&rdquo; under GDPR terminology — i.e., we decide what data is collected and what it&rsquo;s used for. Where you contact us about your data, you&rsquo;ll be talking to a human at <a href="mailto:hello@seven16group.com" className="font-bold text-teal-700 hover:text-teal-800">hello@seven16group.com</a>.
          </p>
          <p>
            This policy covers the Seven16 Intel product at <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">seven16intel.com</code> (legacy traffic on <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">agencysignal.co</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">directory.seven16group.com</code> 308-redirects here). It does not cover other Seven16 Group products (DOT Intel, DOTCarriers, DOTAgencies, Bind Lab) which publish their own policies on their own domains.
          </p>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="2. What we collect"
        title="The minimum needed to run the product."
      >
        <div className="max-w-3xl space-y-5 text-base leading-7 text-slate-700">
          <article>
            <h3 className="text-base font-black text-slate-950">Account data you give us</h3>
            <ul className="mt-2 space-y-1 text-sm leading-6">
              <li>· Email address (required to sign in)</li>
              <li>· Full name (optional; helps us address you correctly)</li>
              <li>· Password (hashed via Supabase Auth; we never see the plaintext)</li>
              <li>· Organization name (if you create or join a team)</li>
            </ul>
          </article>
          <article>
            <h3 className="text-base font-black text-slate-950">Usage data we observe</h3>
            <ul className="mt-2 space-y-1 text-sm leading-6">
              <li>· Pages you visit (via Vercel Analytics — anonymized, no third-party cookies)</li>
              <li>· Search filters you run and lists you save (so we can show them back to you)</li>
              <li>· Export history (credits charged, files generated)</li>
              <li>· IP address and user-agent (for security logs + rate-limiting, retained 30 days)</li>
              <li>· Errors and crashes (via Sentry — stack traces, page URL, user ID)</li>
            </ul>
          </article>
          <article>
            <h3 className="text-base font-black text-slate-950">Payment data we never see</h3>
            <p className="mt-2 text-sm leading-6">
              When you pay, you do so via Stripe. We see only the transaction reference, plan tier, and status — never your card number, expiration, CVV, or billing address. Stripe is the controller of payment data; their policy at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-teal-700 hover:text-teal-800">stripe.com/privacy</a> governs that path.
            </p>
          </article>
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="3. How we use it"
        title="Run the product, secure it, and improve it. Nothing else."
      >
        <div className="max-w-3xl space-y-4 text-base leading-7 text-slate-700">
          <p>We use the data above to: authenticate you and authorize what you can see; serve features (search, lists, exports); bill you accurately; debug errors; prevent abuse (rate-limit, bot-check via Cloudflare Turnstile); and improve the product based on aggregated, anonymized usage patterns.</p>
          <p>We do <strong className="font-black text-slate-950">not</strong> sell your data. We do <strong className="font-black text-slate-950">not</strong> use your data to train ML models for third parties. We do <strong className="font-black text-slate-950">not</strong> share your account data with advertisers.</p>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="4. Third-party processors"
        title="Who else touches your data."
      >
        <div className="max-w-3xl space-y-3 text-base leading-7 text-slate-700">
          <p>We use these processors to run the product. Each has its own privacy policy you should read separately.</p>
          <ul className="space-y-2 text-sm leading-6">
            <li>· <strong className="font-black text-slate-950">Supabase</strong> — auth + database + storage. Data residency: us-east-1.</li>
            <li>· <strong className="font-black text-slate-950">Vercel</strong> — hosting + page analytics + speed insights. Data residency: edge-distributed.</li>
            <li>· <strong className="font-black text-slate-950">Stripe</strong> — payment processing. Sees payment data only.</li>
            <li>· <strong className="font-black text-slate-950">Sentry</strong> — error tracking. Stack traces + page URL + user ID; we redact form values.</li>
            <li>· <strong className="font-black text-slate-950">Cloudflare Turnstile</strong> — bot-check on signup/signin/forgot-password.</li>
            <li>· <strong className="font-black text-slate-950">Upstash</strong> — rate-limit cache. Sees IP + user ID; 1-hour rolling window.</li>
            <li>· <strong className="font-black text-slate-950">Seven16 Group Support</strong> — the chat widget at the bottom of every page. Conversations stored on <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">seven16groupsupport.com</code>; not in the Seven16 Intel database.</li>
            <li>· <strong className="font-black text-slate-950">Better Stack</strong> — uptime monitoring. Sees public-page status; not your account data.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="5. Your rights"
        title="Access, correct, delete, export."
      >
        <div className="max-w-3xl space-y-4 text-base leading-7 text-slate-700">
          <p>Under GDPR (if you&rsquo;re in the EU), CCPA/CPRA (if you&rsquo;re in California), and similar laws elsewhere, you have the right to:</p>
          <ul className="space-y-1 text-sm leading-6">
            <li>· <strong className="font-black text-slate-950">Access</strong> the data we hold about you</li>
            <li>· <strong className="font-black text-slate-950">Correct</strong> inaccuracies</li>
            <li>· <strong className="font-black text-slate-950">Delete</strong> your account and associated personal data</li>
            <li>· <strong className="font-black text-slate-950">Export</strong> your data in a portable format</li>
            <li>· <strong className="font-black text-slate-950">Object</strong> to processing for certain purposes</li>
            <li>· <strong className="font-black text-slate-950">Withdraw consent</strong> for any opt-in processing</li>
          </ul>
          <p>For deletion: visit <a href="/account/delete" className="font-bold text-teal-700 hover:text-teal-800">/account/delete</a> while signed in. For everything else, email <a href="mailto:hello@seven16group.com" className="font-bold text-teal-700 hover:text-teal-800">hello@seven16group.com</a> and we&rsquo;ll respond within 30 days. We may need to verify your identity before processing the request.</p>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="6. Retention"
        title="What we keep, for how long, and why."
      >
        <div className="max-w-3xl space-y-3 text-base leading-7 text-slate-700">
          <ul className="space-y-2 text-sm leading-6">
            <li>· <strong className="font-black text-slate-950">Account data</strong> — until you delete your account. After deletion request, soft-deleted immediately; hard-deleted within 30 days.</li>
            <li>· <strong className="font-black text-slate-950">Audit log</strong> — retained indefinitely for security and dispute-resolution purposes (records of significant actions: sign-ins, exports, billing changes, deletion requests).</li>
            <li>· <strong className="font-black text-slate-950">Financial records</strong> — retained per US tax law (typically 7 years), even after account deletion. Required for IRS / state revenue agency compliance.</li>
            <li>· <strong className="font-black text-slate-950">Aggregated usage data</strong> — retained anonymized; cannot be re-identified to you.</li>
            <li>· <strong className="font-black text-slate-950">Web server / rate-limit logs</strong> — 30 days.</li>
            <li>· <strong className="font-black text-slate-950">Error logs (Sentry)</strong> — 90 days.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="7. Contact"
        title="Reach us about your data."
      >
        <div className="max-w-3xl text-base leading-7 text-slate-700">
          <p>For privacy-specific questions, requests, or complaints: <a href="mailto:hello@seven16group.com?subject=Privacy%20question" className="font-bold text-teal-700 hover:text-teal-800">hello@seven16group.com</a>. We aim to respond within 5 business days; we will not exceed 30 days for substantive responses.</p>
        </div>
      </Section>

      <MarketingFooter />
    </div>
  );
}
