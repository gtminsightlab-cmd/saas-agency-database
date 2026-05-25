"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { requestAccountDeletion } from "./actions";

export function DeleteAccountForm() {
  const [confirmInput, setConfirmInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canSubmit = confirmInput.trim() === "DELETE";

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await requestAccountDeletion(formData);
    if (result && !result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
    // On success the server action calls redirect() and this function never returns;
    // the browser navigates to /account/delete/confirmed.
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="confirm-text" className="block text-sm font-black text-slate-950">
          Type <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">DELETE</span> to confirm
        </label>
        <p className="mt-1 text-xs text-slate-500">Exact match, all caps. Prevents accidental clicks.</p>
        <input
          id="confirm-text"
          name="confirm"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">{error}</div>
      ) : null}

      <SubmitButton canSubmit={canSubmit} />

      <p className="text-xs leading-5 text-slate-500">
        Clicking the button above immediately deactivates your account and signs you out.
        Your data is hard-deleted within 30 days per the policy below.
      </p>
    </form>
  );
}

function SubmitButton({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  const disabled = !canSubmit || pending;
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Processing deletion…" : "Delete my account and data"}
    </button>
  );
}
