"use client";

import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export function FilterSection({
  title,
  hasValue,
  children,
  defaultOpen = false
}: {
  title: string;
  hasValue?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-lg border border-gray-200 bg-white overflow-hidden"
      open={defaultOpen}
    >
      <summary className="list-none cursor-pointer select-none flex items-center gap-3 px-5 py-4 hover:bg-gray-50">
        <span
          className={clsx(
            "flex h-4 w-4 items-center justify-center rounded-full border flex-none",
            hasValue ? "border-brand-600 bg-brand-600" : "border-gray-300"
          )}
        >
          {hasValue && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
        </span>
        <span className="flex-1 text-left font-semibold text-gray-900">{title}</span>
        <ChevronDown className="chev h-4 w-4 text-gray-400" />
      </summary>
      <div className="border-t border-gray-100 px-5 py-5 space-y-6 bg-white">{children}</div>
    </details>
  );
}

export function FilterRow({
  label,
  description,
  children
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr] md:gap-8 pb-5 last:pb-0 border-b last:border-b-0 border-gray-100">
      <div>
        <div className="font-semibold text-gray-900">{label}</div>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function IncludeExcludeToggle({
  value,
  onChange,
  name
}: {
  value: "include" | "exclude";
  onChange: (v: "include" | "exclude") => void;
  name: string;
}) {
  return (
    <div className="flex items-center gap-6 text-sm">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
          checked={value === "include"}
          onChange={() => onChange("include")}
        />
        Include
      </label>
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
          checked={value === "exclude"}
          onChange={() => onChange("exclude")}
        />
        Exclude
      </label>
    </div>
  );
}

export function AndOrToggle({
  value,
  onChange,
  name
}: {
  value: "and" | "or";
  onChange: (v: "and" | "or") => void;
  name: string;
}) {
  return (
    <div className="flex items-center gap-6 text-sm">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
          checked={value === "and"}
          onChange={() => onChange("and")}
        />
        And
      </label>
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
          checked={value === "or"}
          onChange={() => onChange("or")}
        />
        Or
      </label>
    </div>
  );
}
