import Link from "next/link";
import { ForgotPasswordForm } from "./form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Seven16 <span className="font-light opacity-80">Agency Directory</span>
        </Link>
        <div className="space-y-6 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight">
            Reset access in 60 seconds.
          </h1>
          <p className="text-lg text-brand-100">
            Enter the email you signed up with and we&apos;ll send a one-time
            link. No support ticket, no waiting.
          </p>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} Seven16 Group</p>
      </aside>
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Forgot your password?</h2>
            <p className="mt-1 text-sm text-gray-600">
              Enter your email and we&rsquo;ll send a reset link.
            </p>
          </div>
          <ForgotPasswordForm />
          <p className="mt-6 text-sm text-gray-600">
            Remembered it?{" "}
            <Link href="/sign-in" className="font-semibold text-brand-600 hover:text-brand-700">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
