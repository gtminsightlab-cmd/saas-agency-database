"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams?.get("email") ?? "";
  const isInvited = searchParams?.get("invited") === "1" || !!prefillEmail;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If the user navigates here with a different email param later, sync it once.
  useEffect(() => {
    if (prefillEmail && prefillEmail !== email) setEmail(prefillEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillEmail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user && !data.session) {
      setInfo(
        "Check your inbox — we sent a confirmation link. Click it to finish setting up your account."
      );
      setLoading(false);
      return;
    }
    router.push("/build-list");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isInvited && (
        <div className="rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900">
          <span className="font-semibold">You&apos;ve been invited to a Seven16 team.</span>{" "}
          Use the email below to join automatically.
        </div>
      )}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Work email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={isInvited}
          aria-readonly={isInvited}
          className={"mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 " + (isInvited ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "")}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}
      {info && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{info}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-xs text-gray-500">
        By creating an account you agree to our{" "}
        <a href="#" className="underline">terms</a> and{" "}
        <a href="#" className="underline">privacy policy</a>.
      </p>
    </form>
  );
}
