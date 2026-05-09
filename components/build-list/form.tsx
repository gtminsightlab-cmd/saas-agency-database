"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MultiSelect, type Option } from "./multi-select";
import {
  FilterSection,
  FilterRow,
  IncludeExcludeToggle,
  AndOrToggle
} from "./filter-section";

export type FilterData = {
  accountTypes: Option[];
  locationTypes: Option[];
  amsOptions: Option[];
  managementLevels: Option[];
  contactTitleRoles: Option[];
  departments: Option[];
  states: Option[];
  metroAreas: Option[];
  carriers: Option[];
  affiliations: Option[];
  industries: Option[]; // SIC
};

type IncEx = "include" | "exclude";
type AndOr = "and" | "or";

export type InitialFilters = Partial<{
  accountType: string[]; accountTypeMode: "contains" | "exact" | "starts_with";
  locationType: string[];
  ams: string[]; amsMode: IncEx;
  premiumMin: string; premiumMax: string;
  revenueMin: string; revenueMax: string;
  empMin: string; empMax: string;
  sizeCombo: AndOr;
  minority: "any" | "yes" | "no";
  accountName: string; accountNameMode: "begins" | "contains";
  mgmtLevels: string[]; mgmtMode: IncEx;
  contactTitles: string[]; contactTitleMode: IncEx;
  departments: string[]; departmentsMode: IncEx;
  country: "US" | "CA";
  states: string[]; statesMode: IncEx;
  metros: string[]; metrosMode: IncEx;
  carriers: string[]; carriersMode: IncEx; carriersCombo: AndOr;
  affiliations: string[]; affiliationsMode: IncEx;
  industries: string[]; industriesMode: IncEx;
}>;

export function BuildListForm({ data, initial }: { data: FilterData; initial?: InitialFilters }) {
  const router = useRouter();

  // ---- Account ----
  const [accountType, setAccountType] = useState<string[]>(initial?.accountType ?? []);
  const [accountTypeMode, setAccountTypeMode] = useState<"contains" | "exact" | "starts_with">(initial?.accountTypeMode ?? "exact");
  const [locationType, setLocationType] = useState<string[]>(initial?.locationType ?? []);
  const [ams, setAms] = useState<string[]>(initial?.ams ?? []);
  const [amsMode, setAmsMode] = useState<IncEx>(initial?.amsMode ?? "include");
  const [premiumMin, setPremiumMin] = useState(initial?.premiumMin ?? "");
  const [premiumMax, setPremiumMax] = useState(initial?.premiumMax ?? "");
  const [revenueMin, setRevenueMin] = useState(initial?.revenueMin ?? "");
  const [revenueMax, setRevenueMax] = useState(initial?.revenueMax ?? "");
  const [empMin, setEmpMin] = useState(initial?.empMin ?? "");
  const [empMax, setEmpMax] = useState(initial?.empMax ?? "");
  const [sizeCombo, setSizeCombo] = useState<AndOr>(initial?.sizeCombo ?? "or");
  const [minority, setMinority] = useState<"any" | "yes" | "no">(initial?.minority ?? "any");
  const [accountName, setAccountName] = useState(initial?.accountName ?? "");
  const [accountNameMode, setAccountNameMode] = useState<"begins" | "contains">(initial?.accountNameMode ?? "begins");

  // ---- Contact Details ----
  const [mgmtLevels, setMgmtLevels] = useState<string[]>(initial?.mgmtLevels ?? []);
  const [mgmtMode, setMgmtMode] = useState<IncEx>(initial?.mgmtMode ?? "include");
  const [contactTitles, setContactTitles] = useState<string[]>(initial?.contactTitles ?? []);
  const [contactTitleMode, setContactTitleMode] = useState<IncEx>(initial?.contactTitleMode ?? "include");
  const [departments, setDepartments] = useState<string[]>(initial?.departments ?? []);
  const [departmentsMode, setDepartmentsMode] = useState<IncEx>(initial?.departmentsMode ?? "include");

  // ---- Geographic ----
  const [country, setCountry] = useState<"US" | "CA">(initial?.country ?? "US");
  const [states, setStates] = useState<string[]>(initial?.states ?? []);
  const [statesMode, setStatesMode] = useState<IncEx>(initial?.statesMode ?? "include");
  const [metros, setMetros] = useState<string[]>(initial?.metros ?? []);
  const [metrosMode, setMetrosMode] = useState<IncEx>(initial?.metrosMode ?? "include");

  // ---- Carriers ----
  const [carriers, setCarriers] = useState<string[]>(initial?.carriers ?? []);
  const [carriersMode, setCarriersMode] = useState<IncEx>(initial?.carriersMode ?? "include");
  const [carriersCombo, setCarriersCombo] = useState<AndOr>(initial?.carriersCombo ?? "or");

  // ---- Affiliates ----
  const [affiliations, setAffiliations] = useState<string[]>(initial?.affiliations ?? []);
  const [affiliationsMode, setAffiliationsMode] = useState<IncEx>(initial?.affiliationsMode ?? "include");

  // ---- Industry ----
  const [industries, setIndustries] = useState<string[]>(initial?.industries ?? []);
  const [industriesMode, setIndustriesMode] = useState<IncEx>(initial?.industriesMode ?? "include");

  const statesForCountry = useMemo(() => {
    return data.states.filter((s) => s.sublabel === country);
  }, [country, data.states]);

  function clearAll() {
    setAccountType([]);
    setLocationType([]);
    setAms([]);
    setPremiumMin(""); setPremiumMax("");
    setRevenueMin(""); setRevenueMax("");
    setEmpMin(""); setEmpMax("");
    setMinority("any");
    setAccountName("");
    setMgmtLevels([]); setContactTitles([]); setDepartments([]);
    setStates([]); setMetros([]);
    setCarriers([]); setAffiliations([]); setIndustries([]);
  }

  function reviewResults() {
    const params = new URLSearchParams();
    const csv = (xs: string[]) => xs.join(",");
    if (accountType.length) params.set("at", csv(accountType));
    if (locationType.length) params.set("lt", csv(locationType));
    if (ams.length) { params.set("ams", csv(ams)); params.set("ams_m", amsMode); }
    if (premiumMin && Number(premiumMin) > 0) params.set("pmin", premiumMin);
    if (premiumMax && Number(premiumMax) > 0) params.set("pmax", premiumMax);
    if (revenueMin && Number(revenueMin) > 0) params.set("rmin", revenueMin);
    if (revenueMax && Number(revenueMax) > 0) params.set("rmax", revenueMax);
    if (empMin && Number(empMin) > 0) params.set("emin", empMin);
    if (empMax && Number(empMax) > 0) params.set("emax", empMax);
    if (minority !== "any") params.set("min", minority);
    if (accountName) { params.set("an", accountName); params.set("an_m", accountNameMode); }
    if (mgmtLevels.length) { params.set("mg", csv(mgmtLevels)); params.set("mg_m", mgmtMode); }
    if (contactTitles.length) { params.set("ct", csv(contactTitles)); params.set("ct_m", contactTitleMode); }
    if (departments.length) { params.set("dp", csv(departments)); params.set("dp_m", departmentsMode); }
    params.set("c", country);
    if (states.length) { params.set("st", csv(states)); params.set("st_m", statesMode); }
    if (metros.length) { params.set("mt", csv(metros)); params.set("mt_m", metrosMode); }
    if (carriers.length) { params.set("cr", csv(carriers)); params.set("cr_m", carriersMode); params.set("cr_c", carriersCombo); }
    if (affiliations.length) { params.set("af", csv(affiliations)); params.set("af_m", affiliationsMode); }
    if (industries.length) { params.set("in", csv(industries)); params.set("in_m", industriesMode); }

    router.push(`/build-list/review?${params.toString()}`);
  }

  return (
    <>
      <div className="space-y-4">
        {/* ======= ACCOUNT ======= */}
        <FilterSection
          title="Account"
          hasValue={
            accountType.length > 0 ||
            locationType.length > 0 ||
            ams.length > 0 ||
            !!accountName ||
            minority !== "any" ||
            !!(premiumMin || premiumMax || revenueMin || revenueMax || empMin || empMax)
          }
          defaultOpen
        >
          <FilterRow
            label="Account Type"
            description="The nature of the account, e.g. Agency, National Brokerage, MGA."
          >
            <div className="space-y-3">
              <div className="flex items-center gap-6 text-sm">
                {(["contains", "exact", "starts_with"] as const).map((m) => (
                  <label key={m} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="at_mode"
                      className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                      checked={accountTypeMode === m}
                      onChange={() => setAccountTypeMode(m)}
                    />
                    {m === "contains" ? "Contains" : m === "exact" ? "Exact Match" : "Starts With"}
                  </label>
                ))}
              </div>
              <MultiSelect options={data.accountTypes} selected={accountType} onChange={setAccountType} />
            </div>
          </FilterRow>

          <FilterRow
            label="Location Type"
            description="The classification of the account's office, e.g. Headquarters, Branch Office."
          >
            <MultiSelect options={data.locationTypes} selected={locationType} onChange={setLocationType} />
          </FilterRow>

          <FilterRow
            label="Agency Management System"
            description="The software used for streamlining operations like client management and policy administration."
          >
            <div className="space-y-3">
              <IncludeExcludeToggle name="ams_m" value={amsMode} onChange={setAmsMode} />
              <MultiSelect options={data.amsOptions} selected={ams} onChange={setAms} />
            </div>
          </FilterRow>

          <FilterRow
            label="Account Size"
            description="Premium Volume / Revenue / Number of Employees. 1 = $1,000,000."
          >
            <div className="space-y-4">
              <RangeRow label="Premium Volume" minVal={premiumMin} maxVal={premiumMax} onMin={setPremiumMin} onMax={setPremiumMax} showAndOr comboValue={sizeCombo} onCombo={setSizeCombo} />
              <RangeRow label="Revenue" minVal={revenueMin} maxVal={revenueMax} onMin={setRevenueMin} onMax={setRevenueMax} showAndOr comboValue={sizeCombo} onCombo={setSizeCombo} />
              <RangeRow label="Number of Employees" minVal={empMin} maxVal={empMax} onMin={setEmpMin} onMax={setEmpMax} />
            </div>
          </FilterRow>

          {/* Minority Owned filter hidden per product decision (signal not actionable enough today) */}

          <FilterRow label="Search by Account Name">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account Name"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="flex items-center gap-4 text-sm">
                {(["begins", "contains"] as const).map((v) => (
                  <label key={v} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="an_m"
                      className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                      checked={accountNameMode === v}
                      onChange={() => setAccountNameMode(v)}
                    />
                    {v === "begins" ? "Begins" : "Contains"}
                  </label>
                ))}
              </div>
            </div>
          </FilterRow>
        </FilterSection>

        {/* ======= CONTACT DETAILS ======= */}
        <FilterSection
          title="Contact Details"
          hasValue={mgmtLevels.length > 0 || contactTitles.length > 0 || departments.length > 0}
        >
          <FilterRow label="Levels of Management">
            <div className="space-y-3">
              <IncludeExcludeToggle name="mg_m" value={mgmtMode} onChange={setMgmtMode} />
              <MultiSelect options={data.managementLevels} selected={mgmtLevels} onChange={setMgmtLevels} />
            </div>
          </FilterRow>
          <FilterRow label="Contacts Title" description="Focuses on the contact's job function or role.">
            <div className="space-y-3">
              <IncludeExcludeToggle name="ct_m" value={contactTitleMode} onChange={setContactTitleMode} />
              <MultiSelect options={data.contactTitleRoles} selected={contactTitles} onChange={setContactTitles} />
            </div>
          </FilterRow>
          <FilterRow label="Department Staff">
            <div className="space-y-3">
              <IncludeExcludeToggle name="dp_m" value={departmentsMode} onChange={setDepartmentsMode} />
              <MultiSelect options={data.departments} selected={departments} onChange={setDepartments} />
            </div>
          </FilterRow>
        </FilterSection>

        {/* ======= GEOGRAPHIC ======= */}
        <FilterSection
          title="Geographic"
          hasValue={states.length > 0 || metros.length > 0}
        >
          <FilterRow label="Country">
            <div className="flex items-center gap-6 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="country"
                  className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                  checked={country === "US"}
                  onChange={() => { setCountry("US"); setStates([]); }}
                />
                United States
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="country"
                  className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                  checked={country === "CA"}
                  onChange={() => { setCountry("CA"); setStates([]); }}
                />
                Canada
              </label>
            </div>
          </FilterRow>
          <FilterRow label="States">
            <div className="space-y-3">
              <IncludeExcludeToggle name="st_m" value={statesMode} onChange={setStatesMode} />
              <MultiSelect options={statesForCountry} selected={states} onChange={setStates} />
            </div>
          </FilterRow>
          <FilterRow label="Metro Areas">
            <div className="space-y-3">
              <IncludeExcludeToggle name="mt_m" value={metrosMode} onChange={setMetrosMode} />
              <MultiSelect options={data.metroAreas} selected={metros} onChange={setMetros} columns={1} />
            </div>
          </FilterRow>
          <FilterRow label="Counties / ZIP Codes" description="Available after you load agency data with address fields.">
            <div className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              Counties cascade from selected States. ZIP code import + 3/5 digit pickers will activate after real agency records are loaded.
            </div>
          </FilterRow>
        </FilterSection>

        {/* ======= CARRIERS ======= */}
        <FilterSection title="Carriers" hasValue={carriers.length > 0}>
          <FilterRow label="Carriers" description="Agencies appointed with these carrier groups or specific legal entities.">
            <div className="space-y-3">
              <IncludeExcludeToggle name="cr_m" value={carriersMode} onChange={setCarriersMode} />
              <AndOrToggle name="cr_c" value={carriersCombo} onChange={setCarriersCombo} />
              <MultiSelect options={data.carriers} selected={carriers} onChange={setCarriers} columns={2} maxVisible={400} />
            </div>
          </FilterRow>
        </FilterSection>

        {/* ======= AFFILIATES ======= */}
        <FilterSection title="Affiliates" hasValue={affiliations.length > 0}>
          <FilterRow label="Affiliations" description="Clusters, networks, and associations the agency belongs to.">
            <div className="space-y-3">
              <IncludeExcludeToggle name="af_m" value={affiliationsMode} onChange={setAffiliationsMode} />
              <MultiSelect options={data.affiliations} selected={affiliations} onChange={setAffiliations} columns={2} maxVisible={300} />
            </div>
          </FilterRow>
        </FilterSection>

        {/* ======= INDUSTRY (hidden — replaced by /verticals page for vertical-practice signal) ======= */}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 mt-6 -mx-4 sm:-mx-6 lg:-mx-8 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={clearAll}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 px-4 py-2"
        >
          Clear Search
        </button>
        <button
          type="button"
          onClick={reviewResults}
          className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Review Results
        </button>
      </div>
    </>
  );
}

function RangeRow({
  label,
  minVal,
  maxVal,
  onMin,
  onMax,
  showAndOr,
  comboValue,
  onCombo
}: {
  label: string;
  minVal: string;
  maxVal: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
  showAndOr?: boolean;
  comboValue?: AndOr;
  onCombo?: (v: AndOr) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-44 text-sm text-gray-700">{label}</div>
      <input
        type="number"
        value={minVal}
        onChange={(e) => onMin(e.target.value)}
        placeholder="From"
        className="w-24 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <input
        type="number"
        value={maxVal}
        onChange={(e) => onMax(e.target.value)}
        placeholder="To"
        className="w-24 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {showAndOr && comboValue && onCombo && (
        <div className="flex items-center gap-4 text-sm pl-2">
          {(["and", "or"] as const).map((v) => (
            <label key={v} className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`size_combo_${label}`}
                className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                checked={comboValue === v}
                onChange={() => onCombo(v)}
              />
              {v === "and" ? "And" : "Or"}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
