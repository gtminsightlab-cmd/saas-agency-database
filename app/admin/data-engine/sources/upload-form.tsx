"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

type UploadResult = {
  filename: string;
  size_bytes: number;
  content_type: string;
  status: "scaffolded" | "parsed" | "merged" | "error";
  message: string;
  preview?: {
    agency_count?: number;
    contact_count?: number;
    canary_blocked?: number;
    consumer_emails_scrubbed?: number;
  };
};

const ACCEPTED = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ACCEPTED_EXT = /\.(xlsx|xls|xlsm)$/i;
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null | undefined) {
    setError(null);
    setResult(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!ACCEPTED.includes(f.type) && !ACCEPTED_EXT.test(f.name)) {
      setError(`That doesn't look like an xlsx/xls file (got ${f.type || "no MIME"}).`);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`File is ${(f.size / 1024 / 1024).toFixed(1)} MB; max is 50 MB. Split the workbook.`);
      return;
    }
    setFile(f);
  }

  async function submit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/data-engine/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as UploadResult & { error?: string };
      if (!res.ok) {
        setError(json.error ?? json.message ?? "Upload failed");
        return;
      }
      setResult(json);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-admin-text">Upload AdList workbook</h2>
        <p className="mt-0.5 text-xs text-admin-text-mute">
          Accepts .xlsx / .xls / .xlsm up to 50 MB.
        </p>
      </header>

      {/* Drop zone */}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        className={[
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragActive
            ? "border-admin-accent bg-admin-accent/5"
            : file
            ? "border-admin-ok/50 bg-admin-ok/5"
            : "border-admin-border bg-admin-surface-2/40",
        ].join(" ")}
      >
        {file ? (
          <div className="flex items-start justify-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-admin-ok shrink-0" />
            <div className="text-left">
              <div className="text-sm font-medium text-admin-text">{file.name}</div>
              <div className="text-xs text-admin-text-mute">
                {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "application/vnd…"}
              </div>
              <button
                type="button"
                onClick={clear}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-admin-text-dim" />
            <div className="mt-3 text-sm text-admin-text">Drop a workbook here</div>
            <div className="mt-1 text-xs text-admin-text-mute">
              or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-admin-accent hover:underline font-semibold"
              >
                pick a file
              </button>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => pickFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>

      {/* Submit button */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {file && !result && (
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md bg-admin-accent px-4 py-2 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {busy ? "Processing…" : "Run pipeline"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-md border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger inline-flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={[
            "mt-4 rounded-md border p-4",
            result.status === "error"
              ? "border-admin-danger/40 bg-admin-danger/10"
              : "border-admin-ok/40 bg-admin-ok/5",
          ].join(" ")}
        >
          <div className="inline-flex items-start gap-2">
            {result.status === "error" ? (
              <AlertCircle className="h-5 w-5 text-admin-danger shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-admin-ok shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-admin-text">
                {result.filename} — {result.status.toUpperCase()}
              </div>
              <p className="mt-1 text-xs text-admin-text-mute">{result.message}</p>
              {result.preview && (
                <ul className="mt-2 grid gap-1 text-xs text-admin-text-mute">
                  {result.preview.agency_count != null && (
                    <li>· {result.preview.agency_count.toLocaleString()} agency rows detected</li>
                  )}
                  {result.preview.contact_count != null && (
                    <li>· {result.preview.contact_count.toLocaleString()} contact rows detected</li>
                  )}
                  {result.preview.canary_blocked != null && (
                    <li>· {result.preview.canary_blocked.toLocaleString()} watermark canaries blocked</li>
                  )}
                  {result.preview.consumer_emails_scrubbed != null && (
                    <li>
                      · {result.preview.consumer_emails_scrubbed.toLocaleString()} consumer emails would be scrubbed
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
