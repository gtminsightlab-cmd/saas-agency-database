import { AppShell } from "@/components/app/shell";
import { Sparkles } from "lucide-react";

export default function AISupportPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Sparkles className="h-10 w-10 text-brand-600 mx-auto" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">AI Support</h1>
        <p className="mt-3 text-gray-600">
          Ask natural-language questions about your list, get help drafting outreach, or
          auto-match your uploaded book-of-business against the directory.
        </p>
        <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-gray-500 text-sm">
          Coming soon. We&apos;re building an assistant that answers questions like &ldquo;show me
          wholesalers in Texas appointed with AIG&rdquo; and exports the result directly.
        </div>
      </div>
    </AppShell>
  );
}
