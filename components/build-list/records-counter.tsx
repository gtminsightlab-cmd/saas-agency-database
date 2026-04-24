export function RecordsCounter({
  accounts,
  contacts,
  contactsWithEmail
}: {
  accounts: number | null;
  contacts: number | null;
  contactsWithEmail: number | null;
}) {
  return (
    <div className="rounded-lg bg-brand-600 text-white px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="font-semibold">Records Available</span>
      <Stat label="Accounts" n={accounts} />
      <Stat label="Contacts" n={contacts} />
      <Stat label="Contacts with email" n={contactsWithEmail} />
    </div>
  );
}

function Stat({ label, n }: { label: string; n: number | null }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-white/80">{label}</span>
      <span className="inline-flex items-center justify-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold min-w-[3rem]">
        {n == null ? "—" : n.toLocaleString()}
      </span>
    </span>
  );
}
