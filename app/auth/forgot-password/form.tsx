"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { createClient } from "@/lib/supabase/client";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the bot-check challenge below the email field.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
      captchaToken: captchaToken ?? undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      if (TURNSTILE_SITE_KEY) {
        turnstileRef.current?.reset();
        setCaptchaToken(null);
      }
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-md bg-success-50 border border-success-200 p-4 text-sm text-success-700">
        <strong className="block text-success-800">Reset link sent.</strong>
        Check your inbox at <span className="font-medium">{email}</span>. The link expires in 1 hour.
        If you don&rsquo;t see it within a minute, check your spam folder or company email filter.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {TURNSTILE_SITE_KEY && (
        <div className="flex justify-center pt-1">
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken(null)}
            onExpire={() => setCaptchaToken(null)}
            options={{ theme: "light", size: "normal" }}
          />
        </div>
      )}

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <button
        type="submit"
        disabled={loading || (TURNSTILE_SITE_KEY ? !captchaToken : false)}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
