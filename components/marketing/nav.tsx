import Link from "next/link";

export function MarketingNav({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          Seven16 <span className="font-light text-gray-500">Agency Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          <a href="#pricing" className="hidden sm:block text-sm text-gray-700 hover:text-gray-900 px-3 py-2">
            Pricing
          </a>
          <a href="#how-it-works" className="hidden sm:block text-sm text-gray-700 hover:text-gray-900 px-3 py-2">
            How it works
          </a>
          {isAuthed ? (
            <Link
              href="/build-list"
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Go to app
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
