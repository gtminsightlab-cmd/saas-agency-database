import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seven16 Agency Directory — commercial insurance agency leads",
  description:
    "B2B commercial insurance agency directory. Build lists of agencies and contacts by carrier, affiliation, geography, and role. Export CSVs or search free."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
