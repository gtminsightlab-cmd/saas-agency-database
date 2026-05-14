import Link from "next/link";
import { ResetPasswordForm } from "./form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Seven16 <span className="font-light opacity-80">Agency Directory</span>
        </Link>
        <div className="space-y-6 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight">Set a new password.</h1>
          <p className="text-lg text-brand-100">Pick something strong. You&rsquo;ll be signed in automatically.</p>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} Seven16 Group</p>
      </aside>
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Choose a new password</h2>
            <p className="mt-1 text-sm text-gray-600">Minimum 8 characters.</p>
          </div>
          <ResetPasswordForm />
        </div>
      </main>
    </div>
  );
}
