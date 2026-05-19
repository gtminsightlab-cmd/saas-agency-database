import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
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
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
