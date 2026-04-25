import { Search, Download, FileSpreadsheet, Code2 } from "lucide-react";

export type Metric = "search" | "export" | "download" | "api_call";

export const METRICS: {
  key: Metric;
  label: string;
  unit: string;
  Icon: typeof Search;
  description: string;
}[] = [
  { key: "search",   label: "Searches",        unit: "queries", Icon: Search,           description: "Build List filters, Quick Search, results-per-page paging" },
  { key: "export",   label: "Exports",         unit: "files",   Icon: FileSpreadsheet,  description: "CSV/XLSX exports of saved lists" },
  { key: "download", label: "List downloads",  unit: "lists",   Icon: Download,         description: "Full saved-list downloads with contacts" },
  { key: "api_call", label: "API calls",       unit: "calls",   Icon: Code2,            description: "Outbound REST API hits (when API access ships)" },
];

export const METRIC_BY_KEY: Record<Metric, (typeof METRICS)[number]> = METRICS.reduce(
  (acc, m) => ({ ...acc, [m.key]: m }),
  {} as Record<Metric, (typeof METRICS)[number]>
);

/** Suggested slider step + max for each metric */
export const SLIDER_CONFIG: Record<Metric, { min: number; max: number; step: number }> = {
  search:   { min: 0, max: 10000,  step: 50  },
  export:   { min: 0, max:   500,  step: 5   },
  download: { min: 0, max:   200,  step: 5   },
  api_call: { min: 0, max: 50000,  step: 100 },
};

/** Tone for utilization (0-1) */
export function utilTone(usage: number, cap: number, isHard: boolean): "ok" | "warn" | "danger" {
  if (cap <= 0) return "ok";
  const r = usage / cap;
  if (r >= 1)   return isHard ? "danger" : "warn";
  if (r >= 0.8) return "warn";
  return "ok";
}
