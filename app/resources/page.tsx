import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Crosshair,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";
import { Sidebar } from "@/components/app/sidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resources — Methodology, recruit plays, and the case for targeted data | Seven16",
  description:
    "Field-tested methodology and recruit plays for using carrier-appointment intelligence to build a defensible recruit list. Updated as new pieces ship.",
};

type Article = {
  slug: string;
  href: string;
  category: "Methodology" | "Recruit play" | "Comparison" | "Glossary";
  title: string;
  blurb: string;
  readTime: string;
  status: "published" | "coming";
  icon: React.ComponentType<{ className?: string }>;
};

const ARTICLES: Article[] = [
  {
    slug: "methodology",
    href: "/methodology",
    category: "Methodology",
    title: "How to identify target agencies by vertical",
    blurb:
      "The three signals — Volume, Specialization Tier, and Carrier Diversity — that turn a 36,000-row directory into a recruit list of a few hundred names. Plus five named recruit plays distribution leaders run in production.",
    readTime: "9 min read",
    status: "published",
    icon: Compass,
  },
  {
    slug: "vs-zoominfo",
    href: "#",
    category: "Comparison",
    title: "Seven16 vs. ZoomInfo, AM Best, and building it in-house",
    blurb:
      "Three categories of vendors live in this space — none of them answer the question that actually drives appointment wins. A side-by-side comparison of what each is good for and what each gets wrong.",
    readTime: "6 min read",
    status: "coming",
    icon: Layers,
  },
  {
    slug: "glossary",
    href: "#",
    category: "Glossary",
    title: "Glossary — Specialization Tier, Diversity Index, Composite Score",
    blurb:
      "Plain-English definitions for every scoring column in the directory. Use this when handing off a list to a producer team or briefing a new hire on the methodology.",
    readTime: "3 min read",
    status: "coming",
    icon: BookOpen,
  },
];

const CATEGORY_STYLES: Record<Article["category"], { bg: string; text: string; border: string }> = {
  Methodology: { bg: "bg-brand-50", text: "text-brand-700", border: "border-brand-100" },
  "Recruit play": { bg: "bg-success-50", text: "text-success-700", border: "border-success-100" },
  Comparison: { bg: "bg-navy-50", text: "text-navy-700", border: "border-navy-100" },
  Glossary: { bg: "bg-gold-50", text: "text-gold-800", border: "border-gold-100" },
};

export default async function ResourcesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sidebarProps:
    | { email: string; fullName: string | null; isSuperAdmin: boolean }
    | null = null;
  if (user) {
    const { data: appUser } = await supabase
      .from("app_users")
      .select("email, full_name, role")
      .eq("user_id", user.id)
      .maybeSingle();
    sidebarProps = {
      email: appUser?.email ?? user.email ?? "",
      fullName: appUser?.full_name ?? null,
      isSuperAdmin: appUser?.role === "super_admin",
    };
  }

  const body = (
    <div className="bg-white">
      {!user && <MarketingNav isAuthed={false} />}

      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <BookOpen className="h-3.5 w-3.5" />
              Resources
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
              The case for targeted data{" "}
              <span className="text-brand-600">over wide data.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Field-tested methodology, recruit plays, and side-by-side comparisons for teams who
              are tired of paying for general-purpose contact databases that don&rsquo;t answer the
              question that actually drives appointment wins: <em>which agencies hold which
              carriers, and which of those agencies have room for one more</em>.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              New pieces ship as the team writes them. Subscribe to the changelog at the bottom of
              the page to get the next one in your inbox.
            </p>
          </div>
        </div>
      </section>

      {/* ============== ARTICLE CARDS ============== */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      {/* ============== WHY TARGETED ============== */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
              <Crosshair className="h-3.5 w-3.5" />
              The argument in two paragraphs
            </div>
            <h2 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-navy-800">
              Why targeted carrier-appointment data beats wide contact data.
            </h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-gray-700">
              <p>
                A general contact database tells you where 36,000 agencies are and how to reach
                them. That sounds useful until you ask the question your producer team will ask
                next: <em>which of these 36,000 actually writes my line of business with the
                carriers I compete with?</em> The answer is buried &mdash; not in the contact
                database, but in the carrier-appointment data the database doesn&rsquo;t carry.
              </p>
              <p>
                Targeted data is what gets you from 36,000 to the 200 who can pick up the phone
                and bind your program tomorrow. That&rsquo;s where the dollars are. A recruit list
                of 200 high-fit names beats a list of 6,000 lookalikes &mdash; less wasted dialing,
                fewer producer hours burned on captives, and a measurably higher AOR conversion
                rate against the agencies who can actually bind.
              </p>
              <p className="text-sm italic text-gray-600">
                The methodology piece above is the long version of this argument. Read it before
                your next list-buying decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-brand-700">
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            See the methodology applied to 12 verticals.
          </h2>
          <p className="mt-3 text-base text-brand-100 max-w-2xl mx-auto">
            Each vertical card is the framework above &mdash; in production. Specialty carrier
            list, agency counts by tier, refreshed every 30 days.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/verticals"
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
            >
              Open verticals
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/methodology"
              className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 inline-flex items-center gap-2"
            >
              Read the methodology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

  if (sidebarProps) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar {...sidebarProps} />
        <div className="flex-1 min-w-0 overflow-x-hidden">{body}</div>
      </div>
    );
  }

  return body;
}

function ArticleCard({ article }: { article: Article }) {
  const Icon = article.icon;
  const styles = CATEGORY_STYLES[article.category];
  const isPublished = article.status === "published";

  const card = (
    <article
      className={`group flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition ${
        isPublished
          ? "border-gray-200 hover:border-brand-300 hover:shadow"
          : "border-gray-200 opacity-75"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles.bg} ${styles.text} ${styles.border}`}
        >
          <Icon className="h-3 w-3" />
          {article.category}
        </span>
        {!isPublished && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-semibold leading-snug text-navy-800">{article.title}</h3>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-600">{article.blurb}</p>
      <div className="mt-auto pt-5 flex items-center justify-between text-[11px] text-gray-500">
        <span>{article.readTime}</span>
        {isPublished && (
          <span className="inline-flex items-center gap-1 text-brand-700 font-semibold group-hover:text-brand-800">
            Read
            <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </article>
  );

  if (isPublished) {
    return (
      <Link href={article.href} className="block h-full">
        {card}
      </Link>
    );
  }
  return card;
}
