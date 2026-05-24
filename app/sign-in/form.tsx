"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { createClient } from "@/lib/supabase/client";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function SignInForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the bot-check challenge below the password field.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: captchaToken ?? undefined }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      if (TURNSTILE_SITE_KEY) {
        turnstileRef.current?.reset();
        setCaptchaToken(null);
      }
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
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
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <a href="/auth/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot password?</a>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || (TURNSTILE_SITE_KEY ? !captchaToken : false)}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
