import Link from "next/link";

const FOOTER_LINKS: Array<{ heading: string; links: Array<{ label: string; href: string }> }> = [
  {
    heading: "Product",
    links: [
      { label: "Verticals", href: "/verticals" },
      { label: "Use cases", href: "/use-cases" },
      { label: "Analytics", href: "/analytics/carriers" },
      { label: "Methodology", href: "/methodology" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    heading: "Plans",
    links: [
      { label: "Pricing", href: "/#pricing" },
      { label: "Enterprise", href: "/enterprise" },
      { label: "Charter Member", href: "/charter" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Delete my data", href: "/account/delete" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="text-xl font-bold tracking-tight text-white">Agency Signal</div>
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">by Seven16 Group</p>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Distribution intelligence for commercial insurance. The appointment trail behind every U.S.
              commercial agency, refreshed monthly against state filings.
            </p>
          </div>
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">{col.heading}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Seven16 Group. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Verified against state DOI filings. Data sources are confidential.
          </p>
        </div>
      </div>
    </footer>
  );
}
