import Link from "next/link";
import { SignInForm } from "./form";

export default async function SignInPage({
  searchParams: _searchParams
}: {
  searchParams?: Promise<{ next?: string; error?: string }>;
}) {
  const searchParams = await _searchParams;
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — marketing rail */}
      <aside className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Seven16 <span className="font-light opacity-80">Agency Directory</span>
        </Link>
        <div className="space-y-6 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight">
            Every commercial insurance agency in one searchable directory.
          </h1>
          <p className="text-lg text-brand-100">
            Filter 36,000+ agencies by carrier appointments, cluster affiliations,
            geography, and agency management system. Export contact rosters on
            demand.
          </p>
          <ul className="space-y-2 text-brand-100">
            <li className="flex gap-3 items-start">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/70 flex-none" />
              <span>Browse + filter free, pay only to download</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/70 flex-none" />
              <span>Cancel anytime, no annual contract</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/70 flex-none" />
              <span>Built for carriers, MGAs, and wholesalers</span>
            </li>
          </ul>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} Seven16 Group</p>
      </aside>

      {/* Right — form */}
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-600">
              Sign in to continue building lists.
            </p>
          </div>
          <SignInForm nextPath={searchParams?.next ?? "/build-list"} />
          <p className="mt-6 text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign up free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
