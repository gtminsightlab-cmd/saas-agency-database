import Link from "next/link";

const links = [
  { href: "/agency-directory", label: "Agency Directory" },
  { href: "/build-list", label: "Build a List" },
  { href: "/saved-lists", label: "Saved Lists" },
  { href: "/downloads", label: "Downloads" },
  { href: "/quick-search", label: "Quick Search" },
  { href: "/data-mapping", label: "Data Mapping" }
];

export function Nav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-brand-900">
          Seven16 Agency Directory
        </Link>
        <ul className="flex gap-4 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded px-2 py-1 text-gray-700 hover:bg-brand-50 hover:text-brand-600"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
