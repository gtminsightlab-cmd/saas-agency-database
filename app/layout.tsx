import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { Seven16SupportWidget } from "@/components/support/Seven16SupportWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agency Signal — distribution intelligence for commercial insurance",
  description:
    "Agency Signal maps the writing-company appointment trail behind every U.S. commercial insurance agency so distribution teams can target by verified carrier appointment, not job title. Refreshed monthly against state filings."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster position="top-right" closeButton richColors />
        {/* Seven16 Group Support widget — global mount per 2026-05-24 doctrine
            unlock. Renders only a floating button until clicked; iframe loads
            lazily. Stage 2: public_presales mode (anonymous). Stage 3 will
            swap to per-mode + signed-token context for authed users. */}
        <Seven16SupportWidget productSlug="agencysignal" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
