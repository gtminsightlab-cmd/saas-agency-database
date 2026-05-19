type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

/**
 * Page-level header. Renders inside an <AppShell> below the TopBar.
 * Per D-024: semantic <header> landmark, h1 is the page title (one per page),
 * subtitle is optional, actions slot accepts buttons / CTAs.
 */
export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  );
}
