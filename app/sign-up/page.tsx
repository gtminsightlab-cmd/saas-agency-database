import Link from "next/link";
import { SignUpForm } from "./form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Seven16 <span className="font-light opacity-80">Agency Directory</span>
        </Link>
        <div className="space-y-6 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight">
            Start with 0 free lookups, upgrade when you&apos;re ready.
          </h1>
          <p className="text-lg text-brand-100">
            No credit card required. Browse 36,000+ commercial agencies with
            every filter unlocked. Downloads are metered — pay by subscription
            or per batch.
          </p>
          <div className="rounded-lg bg-white/10 p-4 text-sm">
            <div className="font-semibold text-white">What you get free</div>
            <ul className="mt-2 space-y-1 text-brand-100">
              <li>· Unlimited searches</li>
              <li>· Full filter access (carriers, affiliations, AMS, geography)</li>
              <li>· Record counts for every filter combo</li>
              <li>· Save your filters for later</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} Seven16 Group</p>
      </aside>

      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-1 text-sm text-gray-600">
              Free forever. No credit card required.
            </p>
          </div>
          <SignUpForm />
          <p className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
