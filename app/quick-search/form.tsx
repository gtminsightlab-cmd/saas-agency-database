"use client";

import { useState } from "react";
import { MultiSelect, type Option } from "@/components/build-list/multi-select";
import { FilterRow, IncludeExcludeToggle } from "@/components/build-list/filter-section";

export function QuickSearchForm({
  departments,
  titles
}: {
  departments: Option[];
  titles: Option[];
}) {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [deptIds, setDeptIds] = useState<string[]>([]);
  const [deptMode, setDeptMode] = useState<"include" | "exclude">("include");
  const [titleIds, setTitleIds] = useState<string[]>([]);
  const [titleMode, setTitleMode] = useState<"include" | "exclude">("include");

  function clearAll() {
    setEmail(""); setMobile(""); setName(""); setDomain("");
    setDeptIds([]); setTitleIds([]);
  }

  return (
    <div className="p-5 space-y-5">
      <FilterRow label="Contact Email Address">
        <TextInput value={email} onChange={setEmail} placeholder="Contact Email Address" />
      </FilterRow>
      <FilterRow label="Contact Mobile Phone Number">
        <TextInput value={mobile} onChange={setMobile} placeholder="Contact Mobile Phone Number" />
      </FilterRow>
      <FilterRow label="Contact Name">
        <TextInput value={name} onChange={setName} placeholder="Contact Name" />
      </FilterRow>
      <FilterRow label="Domain/Web Address">
        <TextInput value={domain} onChange={setDomain} placeholder="Domain/Web Address" />
      </FilterRow>
      <FilterRow label="Department Staff">
        <div className="space-y-3">
          <IncludeExcludeToggle name="qs_dept_m" value={deptMode} onChange={setDeptMode} />
          <MultiSelect options={departments} selected={deptIds} onChange={setDeptIds} />
        </div>
      </FilterRow>
      <FilterRow
        label="Contact Title"
        description="Focuses on the contact's job function or role."
      >
        <div className="space-y-3">
          <IncludeExcludeToggle name="qs_title_m" value={titleMode} onChange={setTitleMode} />
          <MultiSelect options={titles} selected={titleIds} onChange={setTitleIds} />
        </div>
      </FilterRow>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={clearAll}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 px-4 py-2"
        >
          Clear Search
        </button>
        <button
          type="button"
          disabled
          className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          title="Available after contact records are loaded"
        >
          Search
        </button>
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
    />
  );
}
