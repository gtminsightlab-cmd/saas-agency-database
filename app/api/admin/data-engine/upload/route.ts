import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/data-engine/upload
 *
 * v1 scope (this commit):
 *   - super_admin auth check
 *   - multipart parse
 *   - basic validation (size, MIME, extension)
 *   - acknowledge with file metadata
 *
 * v2 scope (deferred):
 *   - SheetJS parse
 *   - Watermark canary check (uses scan_watermark_canaries logic)
 *   - Consumer-email scrub via email_domain_denylist
 *   - Dedupe + merge into agencies/contacts
 *   - Background worker for files > 1MB
 *
 * The route LIVES so that the UI's drag/drop wiring is real, even though the
 * pipeline itself is scaffolding. Trigger-based audit log on any future writes
 * comes free.
 */

const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPTED_MIMES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);
const ACCEPTED_EXT = /\.(xlsx|xls|xlsm)$/i;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth — must be super_admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: isAdmin } = await supabase.rpc("is_super_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "super_admin_required" }, { status: 403 });
  }

  // Parse multipart
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "missing_file", message: "Expected a 'file' field with the workbook." },
      { status: 400 }
    );
  }

  // Validate
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: "file_too_large",
        message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB; max is ${MAX_BYTES / 1024 / 1024} MB.`,
      },
      { status: 413 }
    );
  }
  const mimeOk = ACCEPTED_MIMES.has(file.type) || ACCEPTED_EXT.test(file.name);
  if (!mimeOk) {
    return NextResponse.json(
      {
        error: "bad_file_type",
        message: `File type ${file.type || "<unknown>"} not supported. Use .xlsx / .xls / .xlsm.`,
      },
      { status: 415 }
    );
  }

  // v1: acknowledge the file. We don't open it yet — that's the deferred pipeline step.
  // We DO surface the would-have-been-checked numbers so admin can see the canary count
  // their upload would be screened against.
  const [
    { count: canaryCount },
    { count: domainCount },
  ] = await Promise.all([
    supabase.from("data_load_denylist").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("email_domain_denylist").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json(
    {
      filename: file.name,
      size_bytes: file.size,
      content_type: file.type,
      status: "scaffolded",
      message:
        "File received and validated. The full ingestion pipeline (SheetJS parse → canary filter → consumer-email scrub → dedupe → merge) ships in the next iteration. The xlsx itself was NOT opened and NOT written to the database. Below is what would have been checked.",
      preview: {
        agency_count: null,
        contact_count: null,
        canary_blocked_against: canaryCount ?? 0,
        domains_blocked_against: domainCount ?? 0,
      },
    },
    { status: 200 }
  );
}
