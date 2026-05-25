import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Service — Agency Signal",
  description:
    "Terms of Service for Agency Signal. Service description, acceptable use, account responsibility, billing, data ownership, termination, governing law.",
};

const LAST_UPDATED = "2026-05-24";

export default async function TermsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <MarketingHeader isAuthed={!!user} theme="dark" />

      <PageHero
        variant="dark"
        eyebrow={`Last updated ${LAST_UPDATED} · DRAFT`}
        title="Terms of Service."
        description="The contract between you and Seven16 Group when you use Agency Signal. Plain English where possible; the legalese only shows up where we can't avoid it."
        primaryCta={{ label: "Read the Privacy Policy", href: "/privacy" }}
        secondaryCta={{ label: "Email questions", href: "mailto:hello@seven16group.com?subject=Terms%20question" }}
      />

      <Section variant="muted">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong className="font-black">DRAFT — awaiting counsel review.</strong> These terms are published in good faith and accurately describe how the service works. They will be replaced with a counsel-reviewed version before charter outreach scales beyond the hand-picked cohort. If anything here conflicts with what we tell you in writing or in a signed contract, the contract governs.
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="1. The service"
        title="What you're paying for."
      >
        <div className="max-w-3xl space-y-4 text-base leading-7 text-slate-700">
          <p>Agency Signal is a commercial-insurance-distribution intelligence platform: a searchable directory of U.S. commercial insurance agencies, scored by carrier-appointment behavior, refreshed monthly against state filings. Free tier is browse-only. Paid tiers add exports (verified contact records). Enterprise+ is annual-contract distribution intelligence at state-by-state pricing.</p>
          <p>Service description is illustrative — features ship over time and we&rsquo;ll update this page when material additions land. We do not commit to keeping any specific feature in perpetuity.</p>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="2. Your account"
        title="What you commit to."
      >
        <div className="max-w-3xl space-y-3 text-base leading-7 text-slate-700">
          <ul className="space-y-2 text-sm leading-6">
            <li>· Provide accurate sign-up information. We may suspend accounts using fake names or aliases for evasion purposes.</li>
            <li>· Keep your credentials confidential. Sharing logins across multiple users on the same seat violates the seat license — buy team seats for that.</li>
            <li>· Tell us promptly if you suspect your account was accessed without authorization.</li>
            <li>· One natural-person human per seat. No bot accounts.</li>
            <li>· You must be 18+ and authorized to enter into this contract on behalf of yourself or an organization.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="3. Acceptable use"
        title="What you can and can't do with the data."
      >
        <div className="max-w-3xl space-y-4 text-base leading-7 text-slate-700">
          <p>You may use Agency Signal data to: research the U.S. commercial-insurance distribution market; identify agencies that match your distribution criteria; recruit agency relationships for your carrier, MGA, wholesaler, or program; train your producer team on the methodology.</p>
          <p>You may <strong className="font-black text-slate-950">not</strong>:</p>
          <ul className="space-y-2 text-sm leading-6">
            <li>· Resell, sublicense, or redistribute exported data to third parties not on your contract.</li>
            <li>· Bulk-scrape the directory via automated means outside the official export feature. We rate-limit and log everything.</li>
            <li>· Use the data for purposes unrelated to commercial-insurance distribution (e.g., consumer marketing, political campaigns, debt collection).</li>
            <li>· Reverse-engineer the methodology to build a competing product.</li>
            <li>· Use the data in ways that violate applicable law (TCPA spam, GDPR consent violations, etc.). The compliance burden for your outreach is yours.</li>
            <li>· Pretend Agency Signal data implies any carrier appointment, underwriting approval, or contractual relationship that doesn&rsquo;t exist. Agency Signal data reflects observable appointment behavior, nothing more.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="4. Data ownership"
        title="Who owns what."
      >
        <div className="max-w-3xl space-y-3 text-base leading-7 text-slate-700">
          <ul className="space-y-2 text-sm leading-6">
            <li>· <strong className="font-black text-slate-950">You own</strong> your account data, your saved searches, your saved lists, your uploaded files, and the export records you generate.</li>
            <li>· <strong className="font-black text-slate-950">We own</strong> the underlying agency directory, the carrier mapping, the scoring methodology, the IP of the assembled dataset, the brand, the codebase, and all aggregated/anonymized usage analytics.</li>
            <li>· <strong className="font-black text-slate-950">License you grant us</strong> to your account data: a non-exclusive, royalty-free license to host, process, display, and back up your data solely for the purpose of providing the service. This license ends when you delete your account (subject to retention requirements in the Privacy Policy).</li>
            <li>· <strong className="font-black text-slate-950">License we grant you</strong> to the directory: a non-exclusive, non-transferable, revocable license to access and use the directory in accordance with your active subscription tier and the acceptable-use limits above.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="5. Billing"
        title="How payment works."
      >
        <div className="max-w-3xl space-y-3 text-base leading-7 text-slate-700">
          <ul className="space-y-2 text-sm leading-6">
            <li>· Subscriptions auto-renew monthly or annually until you cancel.</li>
            <li>· Cancel anytime from your account settings. Cancellation takes effect at the end of the current billing period — no pro-rated refunds for the partial period unless your local consumer-protection law requires otherwise.</li>
            <li>· One-time exports (Snapshot tier, credit top-ups) are non-refundable once the export is delivered.</li>
            <li>· Past-due accounts may have their access suspended after 14 days non-payment. We&rsquo;ll email you first.</li>
            <li>· Enterprise+ pricing is annual-contract; payment terms are in your contract.</li>
            <li>· Taxes (sales tax, VAT, GST) are your responsibility where applicable; we don&rsquo;t collect on your behalf.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="6. Service availability"
        title="No SLA, best effort."
      >
        <div className="max-w-3xl text-base leading-7 text-slate-700">
          <p>We aim for high availability and monitor uptime via Better Stack. We don&rsquo;t commit to an SLA in these baseline Terms — uptime guarantees are negotiated separately for Enterprise+ contracts. We&rsquo;ll communicate planned maintenance windows in advance via in-app notification or email.</p>
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="7. Limitations"
        title="What we don't promise."
      >
        <div className="max-w-3xl space-y-3 text-base leading-7 text-slate-700">
          <p>To the extent permitted by law:</p>
          <ul className="space-y-2 text-sm leading-6">
            <li>· The service is provided <strong className="font-black text-slate-950">&ldquo;as is&rdquo;</strong> without warranties of merchantability, fitness for a particular purpose, or non-infringement beyond what your local law requires.</li>
            <li>· Agency Signal data is not a guarantee of carrier appointment, agency willingness to write your business, or any contractual relationship between you and the agencies in the directory.</li>
            <li>· Our liability for any single incident is capped at the amount you paid us in the trailing 12 months, with reasonable exceptions for fraud and gross negligence as your local law requires.</li>
            <li>· We&rsquo;re not liable for indirect, incidental, consequential, or punitive damages arising from your use of the service.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="8. Termination"
        title="When the relationship ends."
      >
        <div className="max-w-3xl space-y-3 text-base leading-7 text-slate-700">
          <ul className="space-y-2 text-sm leading-6">
            <li>· You may cancel anytime from your account settings. Use <a href="/account/delete" className="font-bold text-teal-700 hover:text-teal-800">/account/delete</a> to fully delete your data.</li>
            <li>· We may suspend or terminate accounts that violate acceptable use, fail to pay, or that we have reasonable grounds to believe are being used fraudulently. We&rsquo;ll give notice except where the violation is severe.</li>
            <li>· Sections that should survive (e.g., data ownership, limitations, governing law) survive termination.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="9. Governing law"
        title="Where disputes get resolved."
      >
        <div className="max-w-3xl text-base leading-7 text-slate-700">
          <p>Governing law and venue: <strong className="font-black text-slate-950">[TBD by counsel — placeholder].</strong> Until counsel-reviewed, disputes should be raised first via email to <a href="mailto:hello@seven16group.com" className="font-bold text-teal-700 hover:text-teal-800">hello@seven16group.com</a> for good-faith resolution.</p>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="10. Changes"
        title="How we update these terms."
      >
        <div className="max-w-3xl text-base leading-7 text-slate-700">
          <p>We may update these terms. Material changes get notified via email and an in-app banner at least 14 days before they take effect. Continued use after the effective date constitutes acceptance. If you don&rsquo;t accept the new terms, cancel before the effective date.</p>
        </div>
      </Section>

      <MarketingFooter />
    </div>
  );
}
