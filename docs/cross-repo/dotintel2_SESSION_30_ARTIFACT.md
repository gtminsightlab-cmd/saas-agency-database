# Cross-repo artifact — dotintel2 SESSION_30 (SODA Ingest)

**Drafted:** 2026-05-15 (saas-agency-database SESSION_24 tail, under Rule 2(b))
**Target repo:** `C:\Users\GTMin\Projects\dotintel2\`
**Target session:** dotintel2 SESSION_30 (Sub-arc 3A close)
**Predecessor:** dotintel2 SESSION_29 (HEAD `6722f2d`)

> **Rule 2(b) compliance:** This file lives in saas-agency-database's tree. It contains paste-ready prompts and draft code for dotintel2's SESSION_30. **Zero file writes have been made to dotintel2's working tree from saas-agency-database SESSION_24.** When dotintel2 SESSION_30 opens, it reads this artifact and either pastes the script content verbatim or regenerates it against the actual codebase.
>
> The drafts here are v1 — verified against `scripts/csa-ingest-bootstrap.ts` (env pattern), `lib/cache/data-tags.ts` (tag registry), and `supabase/migrations/20260514_csa_schema.sql` (table shapes). Drafts ASSUME postgres.js is already in `package.json` (the Edge Function imports it) and tsx works (the bootstrap uses it). Verify both at session open.

---

## How dotintel2 SESSION_30 uses this file

1. Open Claude Code in `C:\Users\GTMin\Projects\dotintel2\`. Verify `pwd`.
2. Resolve dangling state first (3 untracked files + 2 modified — see §A).
3. Cascade WORKING_AGREEMENT.md Rule 2(b) + Rule 5 amendments from saas-agency-database (see §B — paste-ready edits).
4. Paste §C as the session prompt.
5. Have dotintel2 Claude read §D (script) + §E (migration) + §F (summary SQL) + §G (testing) + §H (gotchas) before executing.

---

## §A — Pre-session cleanup (~5 min)

dotintel2's working tree currently has:

```
 M .gitignore
 M docs/SESSION_28_PROMPT.md
?? docs/KILLING_COMMERCIAL_TRAINING_HUB.md
?? docs/TRAINING_HUB_SESSION_HANDOFF.md
?? scripts/_mcp-mirror-helper.ts
```

The two `*TRAINING_HUB*` `.md` files were dropped in by a parallel "Killing Commercial" project session on 2026-05-13 — planning docs for a future training-hub integration, zero code yet. Decision tree:

- **Commit as planning artifacts** (recommended): `docs/planning/killing-commercial/` subdirectory + a commit `docs(planning): killing commercial training hub planning artifacts from 2026-05-13 parallel session`. Keeps them visible without entering active scope.
- **Ignore via .gitignore**: only if Master O is sure these planning docs shouldn't be tracked. Cheaper but loses the record.
- **Delete**: only if confirmed redundant.

For `scripts/_mcp-mirror-helper.ts` and `docs/SESSION_28_PROMPT.md` modifications — read first, decide based on content. Likely commit if part of the same Killing Commercial session.

`.gitignore` modification: likely benign (probably mirrors saas-agency-database's `.vercel` addition). Commit alongside.

**Do not start Sub-arc 3A SODA work until the tree is clean.**

---

## §B — Cascade WORKING_AGREEMENT.md from saas-agency-database (~5 min)

Two rules amended in saas-agency-database SESSION_24 need to land in dotintel2. The current dotintel2 WORKING_AGREEMENT.md is identical to the pre-amendment saas-agency-database version. Two edits:

**Edit 1 — header note** (find this line):

```
Locked: 2026-05-15.
```

**Replace with:**

```
Locked: 2026-05-15. Rules 2 + 5 amended SESSION_30 (2026-05-15) — Rule 2(b) cross-repo prep artifact exception added; Rule 5 step 1 adds FAMILY_HEALTH.md update per saas-agency-database/docs/context/ANTI_DECAY_PROTOCOL.md Mechanism #1. Cascaded from saas-agency-database SESSION_24 (commits db9731e + f5fc464).
```

**Edit 2 — Rule 2 block** (find this exact block):

```
**Rule 2 — One session per repo at a time.**
Two Claude Code sessions in the same working tree will collide. Run sessions sequentially per repo. Exception: a git worktree (different folder, different branch) is the safe parallel pattern when truly needed.
```

**Replace with the new Rule 2 from `saas-agency-database/docs/WORKING_AGREEMENT.md`** (verbatim copy — Read the saas-agency-database file directly to grab the canonical text rather than re-typing from this artifact, which is a v1 draft).

**Edit 3 — Rule 5 block** (find this exact block):

```
**Rule 5 — Every session ends with: handoff + push + queue.**
Three things, in order, before closing a session:
1. Write the next-numbered `SESSION_<N>_HANDOFF.md`
2. `git push origin main`
3. Write `SESSION_<N+1>_PROMPT.md` with what's queued

Missing any of these = next session starts confused.
```

**Replace with the new Rule 5 from saas-agency-database/docs/WORKING_AGREEMENT.md** (verbatim).

Note: dotintel2 does NOT need its own `FAMILY_HEALTH.md` — that file lives only in saas-agency-database (family hub). Rule 5 step 1 still applies: when dotintel2 SESSION_30 closes with material changes (it will — SODA ingest shipping is material), dotintel2 Claude can either edit saas-agency-database's FAMILY_HEALTH.md directly (Rule 2(b) WRITE clause forbids this — wait, it forbids writes TO dotintel2 FROM saas-agency-database, not the other way) OR flag in handoff for the next saas-agency-database session to refresh.

**Cleanest pattern:** dotintel2 SESSION_30 close note in handoff: "FAMILY_HEALTH.md refresh queued for next saas-agency-database family-hub session." Saves the cross-repo write.

**Edit 4 — Daily session protocol Close row** (find):

```
| **Close** | Update `docs/BACKLOG.md` (mark done, promote next queued to Active) → write the new `SESSION_<N>_HANDOFF.md` → `git push origin main` → write `SESSION_<N+1>_PROMPT.md`. |
```

**Replace with:**

```
| **Close** | Update `docs/BACKLOG.md` (mark done, promote next queued to Active) → if material, flag FAMILY_HEALTH.md refresh in handoff for next saas-agency-database family-hub session → write the new `SESSION_<N>_HANDOFF.md` → `git push origin main` → write `SESSION_<N+1>_PROMPT.md`. |
```

---

## §C — SESSION_30 paste-ready prompt

Paste this verbatim into the first message of dotintel2 SESSION_30 (after §A + §B cleanup are done):

```
This is the SESSION_OPENER for dotintel2 SESSION_30 — Sub-arc 3A close
(SODA-based CSA Ingest pipeline goes live).

═══════════════════════════════════════════════════════════════
STEP 0 — VERIFY WORKING DIRECTORY
═══════════════════════════════════════════════════════════════

Run pwd. Expected: C:\Users\GTMin\Projects\dotintel2

If you see anything under \OneDrive\, STOP and tell Master O to
close + relaunch from the canonical Projects path. Do not proceed.

═══════════════════════════════════════════════════════════════
STEP 1 — READ THESE FILES IN ORDER (Working Agreement Rule 6)
═══════════════════════════════════════════════════════════════

  1. docs/BACKLOG.md (anti-decay layer)
  2. docs/SESSION_29_HANDOFF.md (predecessor — Sub-arc 3A Phase 1+2A
     close + architectural pivot to SODA API)
  3. C:\Users\GTMin\Projects\saas-agency-database\docs\cross-repo\
     dotintel2_SESSION_30_ARTIFACT.md (THIS artifact — contains the
     SODA script draft + migration draft + testing protocol + known
     gotchas, drafted from saas-agency-database SESSION_24 under
     Rule 2(b))
  4. saas-agency-database/docs/context/FAMILY_HEALTH.md (cross-product
     snapshot — dotintel2 SODA close is the active arc dependency on
     the map)
  5. ~/.claude/.../memory/reference_fmcsa_soda_resource_ids.md
     (column conventions + 3 resource IDs)
  6. ~/.claude/.../memory/feedback_fmcsa_no_public_percentile.md
     (recompute pattern + cross-validation against _ac)
  7. ~/.claude/.../memory/feedback_fmcsa_data_refresh_architecture.md
     (6 locked rules — natural keys, truncate+history, plain summary
     tables, centralized tags, source cadence, full universe)
  8. supabase/migrations/20260514_csa_schema.sql (table shapes,
     already deployed)
  9. lib/cache/data-tags.ts (TAGS registry + CSA_REFRESH_TAGS export)
  10. scripts/csa-ingest-bootstrap.ts (env-loading pattern to mirror)

═══════════════════════════════════════════════════════════════
STEP 2 — STATE AT SESSION OPEN
═══════════════════════════════════════════════════════════════

  • HEAD: see `git log -1` (latest = SESSION_29 close OR post-cleanup
    commit if §A pre-work landed)
  • Sub-arc 3A Phase 1 + 2A shipped SESSION_29 (csa.* schema deployed,
    csa-ingest Edge Function deployed + dry-run validated, BASIC bars
    UI wired, lib/uw-scoring.ts integrated, lib/methodology.ts 5
    factors flipped roadmap→live)
  • Data layer EMPTY — `select count(*) from csa.basic_scores` = 0
  • Architectural pivot mid-SESSION_29: SODA API path replaces FMCSA
    bulk-file path. Edge Function stays as fallback.
  • CSA_INGEST_SECRET set in Supabase dashboard ✓
  • SODA endpoints validated, column shapes known
  • No-public-percentile finding: FMCSA dropped percentile from public
    data post-FAST-Act 2015; we recompute via SMS Methodology rank-
    within-Safety-Event-Group

═══════════════════════════════════════════════════════════════
STEP 3 — ACTIVE ARC FOR SESSION_30
═══════════════════════════════════════════════════════════════

**Close Sub-arc 3A — SODA ingest pipeline runs end-to-end against
production data, BASIC bars UI lights up for ~600k carriers.**

Three deliverables:

  (1) scripts/csa-ingest-soda.ts — paginated SODA fetch (3 endpoints)
      → parse → postgres.js direct write → audit row → revalidate.
      Draft in §D of the cross-repo artifact. Verify against:
        - postgres.js in package.json (Edge Function uses it; should
          already be a dep)
        - SUPABASE_DB_URL set in Supabase dashboard or .env.csa-ingest
        - tsx works (bootstrap uses it ✓)

  (2) New migration — csa.recompute_percentiles() function applying
      FMCSA SMS Methodology rank-within-Safety-Event-Group, populates
      csa.basic_scores.percentile. Draft in §E of the cross-repo
      artifact.

  (3) New migration extension — csa.refresh_carrier_safety_summary()
      function repopulating csa.carrier_safety_summary from raw +
      basic_scores. Draft in §F of the cross-repo artifact.

Plus update /methodology page with the "DOT Intel-calculated
percentile" disclosure block — link to FMCSA SMS Methodology PDF,
show the bucket-rank formula. This is the positioning moat (Carrier
Software's percentile is black-box; ours is transparent + sourced).

After ingest closes: per D-017f, commit to 5 customer-discovery
calls in first 7 days before sinking Sub-arcs 3B / 4 / 5.

═══════════════════════════════════════════════════════════════
STEP 4 — SCOPE THIS SESSION (~5-7 files)
═══════════════════════════════════════════════════════════════

  1. scripts/csa-ingest-soda.ts (NEW)
  2. supabase/migrations/<date>_csa_recompute_percentiles.sql (NEW)
  3. supabase/migrations/<date>_csa_refresh_safety_summary.sql (NEW)
  4. app/(public)/methodology/page.tsx (UPDATE — add CSA disclosure
     block)
  5. docs/BACKLOG.md (Active arc closes; Sub-arc 3B promotes)
  6. docs/SESSION_30_HANDOFF.md (NEW per Rule 5)
  7. docs/SESSION_31_PROMPT.md (NEW per Rule 5)

PLUS pre-session cleanup (§A + §B above) — can be a separate
opening commit before the SESSION_30 body work.

═══════════════════════════════════════════════════════════════
STEP 5 — TESTING PROTOCOL (§G in artifact)
═══════════════════════════════════════════════════════════════

  1. Dry-run all 3 phases (--dry-run flag in §D draft) to verify
     SODA endpoints reachable + field shapes match parser
  2. Real ingest BASIC first (smallest payload, ~600k rows × 5
     basics = ~3M basic_scores rows). Verify count + spot-check 3-5
     known DOT numbers against FMCSA SMS UI.
  3. Real ingest crashes (~smaller dataset)
  4. Real ingest inspections LAST (~5.78M rows, longest run; ~2-4
     hours estimated on 5k batch INSERTs)
  5. Run recompute_percentiles(); cross-validate against _ac flag
     for >95% match. Log mismatch rate to sms_refresh_runs.
  6. Run refresh_carrier_safety_summary(); verify count = distinct
     dot_numbers in basic_scores.
  7. Hit /carriers/<known-dot-with-alerts> on dotcarriers.io
     → BASIC bars render with real data.
  8. Hit /methodology → CSA disclosure block renders.

═══════════════════════════════════════════════════════════════
STEP 6 — DO NOT IN THIS SESSION
═══════════════════════════════════════════════════════════════

  • Touch saas-agency-database tree (Rule 2 — even with Rule 2(b)
    cross-repo prep allowed, this session is the dotintel2 OWNED
    session; reverse direction artifact creation is fine if needed
    but no commits in saas-agency-database from here)
  • Build Sub-arc 3B daily delta refresh (separate session, earn it
    via the 5 discovery calls first per D-017f)
  • Build Phase 2B prospecting filter UI (deferred per SESSION_29
    handoff — customer feedback may invert filter priority)
  • Skip the percentile cross-validation step (this is the
    positioning moat — empirical >95% match is the publishable proof)
  • Apply the Supabase migrations without running advisors after
    (rule 1 from feedback_fmcsa_data_refresh_architecture)

═══════════════════════════════════════════════════════════════
STEP 7 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

  • Plan-before-execute: 7-10 bullets, thumbs-up, then implement
  • Anti-slop on /methodology page copy (specific FMCSA citations,
    no "leverage cutting-edge" filler)
  • Native git from C:\Users\GTMin\Projects\dotintel2\
  • Secrets via .env.csa-ingest (PowerShell $-interpolation gotcha
    documented in bootstrap script comments — same pattern here)
  • At close (Rule 5): update FAMILY_HEALTH.md flag in handoff for
    next saas-agency-database family-hub session to refresh (no
    cross-repo write needed)

═══════════════════════════════════════════════════════════════

Confirm Step 0 + Step 1 reading complete, then propose a 7-10
bullet plan for SESSION_30. Wait for thumbs-up.
```

---

## §D — `scripts/csa-ingest-soda.ts` (v1 draft, ~280 lines)

> **Verify before paste:** `npm ls postgres` in dotintel2 should show `postgres` installed (Edge Function dep). If not, `npm i postgres` first.
>
> **Required env var:** `SUPABASE_DB_URL` (the direct postgres URL, NOT the REST URL — find in Supabase Dashboard → Settings → Database → Connection string → URI). Keep in `.env.csa-ingest`.

```typescript
/**
 * scripts/csa-ingest-soda.ts
 *
 * Sub-arc 3A close — Production CSA Ingest via SODA API.
 *
 * Replaces the FMCSA bulk-file path with data.transportation.gov SODA
 * queries. Writes directly to vbhlacdrcqdqnvftqtin Postgres via
 * SUPABASE_DB_URL using postgres.js — no Edge Function in the critical
 * path. The csa-ingest Edge Function remains deployed as a fallback for
 * one-shot URL ingests.
 *
 * Phases (when --phase=all): basic → inspections → crashes → summary →
 *                            revalidate
 *
 * Usage:
 *   npx tsx ./scripts/csa-ingest-soda.ts \
 *     [--phase=basic|inspections|crashes|summary|all] \
 *     [--limit=50000]              # SODA page size
 *     [--max-pages=999]            # safety cap
 *     [--dry-run]                  # fetch + parse, no DB writes
 *     [--no-revalidate]            # skip /api/cache/revalidate POST
 *
 * Required env (preferred via .env.csa-ingest — PowerShell $-interp
 * silently mangles secrets containing $ in double-quoted strings):
 *   SUPABASE_DB_URL=postgres://postgres:<pwd>@<host>:5432/postgres?sslmode=require
 *
 * Optional env:
 *   APP_BASE_URL=https://www.dotintel.io
 *   CRON_SECRET=<bearer-for-/api/cache/revalidate>
 *   SOCRATA_APP_TOKEN=<free-token-raises-1000-req-hr-cap>
 */

import postgres from 'postgres';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ─── Env-file loading (mirrors scripts/csa-ingest-bootstrap.ts) ────────────
function loadEnvFile(path: string): void {
  const abs = resolve(process.cwd(), path);
  if (!existsSync(abs)) return;
  let content = readFileSync(abs, 'utf8');
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  let loaded = 0;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
    loaded++;
  }
  if (loaded > 0) console.log(`  loaded ${loaded} var${loaded === 1 ? '' : 's'} from ${path}`);
}
loadEnvFile('.env.csa-ingest');
loadEnvFile('.env.local');

// ─── Constants ─────────────────────────────────────────────────────────────
const SODA_BASE = 'https://data.transportation.gov/resource';
const ENDPOINTS = {
  basic:       `${SODA_BASE}/4y6x-dmck.json`,
  inspections: `${SODA_BASE}/rbkj-cgst.json`,
  crashes:     `${SODA_BASE}/4wxs-vbns.json`,
} as const;

const DEFAULT_LIMIT = 50_000;
const DEFAULT_MAX_PAGES = 999;
const SODA_RETRY_LIMIT = 3;
const SODA_RETRY_DELAY_MS = 5_000;
const INSERT_BATCH_SIZE = 5_000;

const BASIC_PREFIX_MAP = {
  unsafe_driving:        'unsafe_driv',
  hos_compliance:        'hos_driv',
  driver_fitness:        'driv_fit',
  controlled_substances: 'contr_subst',
  vehicle_maintenance:   'veh_maint',
} as const;
type BasicName = keyof typeof BASIC_PREFIX_MAP;

// ─── Types ─────────────────────────────────────────────────────────────────
type Phase = 'basic' | 'inspections' | 'crashes' | 'summary';

interface PhaseResult {
  ok: boolean;
  phase: Phase;
  rows: number;
  duration_ms?: number;
  error?: string;
}

interface PageOpts {
  limit: number;
  maxPages: number;
  dryRun: boolean;
}

// SODA returns strings for everything; we coerce on parse.
interface SodaRow { [k: string]: string | undefined; }

// ─── Helpers ───────────────────────────────────────────────────────────────
function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) { console.error(`Missing env: ${name}`); process.exit(1); }
  return v;
}
function parseArg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
}
function parseFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function parseIntOrZero(s: string | undefined): number {
  if (!s) return 0;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}
function parseFloatOrNull(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}
function parseYN(s: string | undefined): boolean {
  return s === 'Y' || s === 'y' || s === 'true';
}
function parseBoolean(s: string | undefined): boolean {
  return s === 'true' || s === 'Y' || s === 'y' || s === '1';
}
// SODA dates come back as "17-JUL-25" — DD-MON-YY. Year is 2-digit.
// Window: 00-69 → 2000s, 70-99 → 1900s. (FMCSA data won't predate 1970.)
const MONTHS: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};
function parseSodaDate(s: string | undefined): string | null {
  if (!s) return null;
  // Some SODA fields are ISO-style "2025-07-17T00:00:00.000" — handle both.
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/.exec(s);
  if (!m) return null;
  const day = Number.parseInt(m[1], 10);
  const mon = MONTHS[m[2].toUpperCase()];
  const yr = Number.parseInt(m[3], 10);
  if (mon === undefined) return null;
  const year = yr < 70 ? 2000 + yr : 1900 + yr;
  return `${year}-${String(mon + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── SODA fetcher ──────────────────────────────────────────────────────────
async function fetchSodaPage<T>(url: string, limit: number, offset: number): Promise<T[]> {
  const u = new URL(url);
  u.searchParams.set('$limit', String(limit));
  u.searchParams.set('$offset', String(offset));
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = process.env.SOCRATA_APP_TOKEN;
  if (token) headers['X-App-Token'] = token;

  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= SODA_RETRY_LIMIT; attempt++) {
    try {
      const res = await fetch(u.toString(), { headers });
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < SODA_RETRY_LIMIT) {
          await new Promise(r => setTimeout(r, SODA_RETRY_DELAY_MS * attempt));
          continue;
        }
        const text = await res.text().catch(() => '');
        throw new Error(`SODA HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      return (await res.json()) as T[];
    } catch (e) {
      lastErr = e;
      if (attempt < SODA_RETRY_LIMIT) {
        await new Promise(r => setTimeout(r, SODA_RETRY_DELAY_MS * attempt));
        continue;
      }
    }
  }
  throw lastErr ?? new Error('unreachable');
}

// ─── Pagination loop (generic) ─────────────────────────────────────────────
async function fetchAllPages<T extends SodaRow>(
  url: string,
  opts: PageOpts,
  onPage: (batch: T[], pageIdx: number) => void,
): Promise<number> {
  let total = 0;
  let offset = 0;
  for (let page = 0; page < opts.maxPages; page++) {
    const batch = await fetchSodaPage<T>(url, opts.limit, offset);
    if (batch.length === 0) break;
    onPage(batch, page);
    total += batch.length;
    offset += opts.limit;
    if (batch.length < opts.limit) break;
  }
  return total;
}

// ─── Audit helpers ─────────────────────────────────────────────────────────
async function openRefreshRun(
  sql: postgres.Sql, phase: Phase, sourceUrl: string | null,
): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    insert into csa.sms_refresh_runs (phase, source_url, status)
    values (${phase}, ${sourceUrl}, 'running')
    returning id
  `;
  return rows[0].id;
}
async function closeRefreshRun(
  sql: postgres.Sql, id: string, status: 'ok' | 'error',
  rowsLoaded: number, rowsHistory: number, durationMs: number, error?: string,
): Promise<void> {
  await sql`
    update csa.sms_refresh_runs
    set finished_at = now(),
        status = ${status},
        rows_loaded = ${rowsLoaded},
        rows_history_appended = ${rowsHistory},
        duration_ms = ${durationMs},
        error_message = ${error ?? null}
    where id = ${id}::uuid
  `;
}

// ─── Phase: BASIC ──────────────────────────────────────────────────────────
async function loadBasic(sql: postgres.Sql, opts: PageOpts): Promise<PhaseResult> {
  const started = Date.now();
  const runId = await openRefreshRun(sql, 'basic', ENDPOINTS.basic);
  try {
    const allRows: SodaRow[] = [];
    const totalFetched = await fetchAllPages<SodaRow>(ENDPOINTS.basic, opts, (batch, page) => {
      console.log(`  [basic] page ${page + 1}: ${batch.length} carriers (running total: ${allRows.length + batch.length})`);
      allRows.push(...batch);
    });

    // Explode each carrier row into 5 basic_scores rows (one per displayed BASIC).
    const dbRows: Array<{
      dot_number: number;
      basic_name: BasicName;
      measure: number | null;
      percentile: number | null;
      alert: boolean;
      serious_violation: boolean;
      insufficient_data: boolean;
      raw_row: object;
    }> = [];
    for (const r of allRows) {
      const dot = parseIntOrZero(r.dot_number);
      if (dot <= 0) continue;
      for (const [basicName, prefix] of Object.entries(BASIC_PREFIX_MAP) as [BasicName, string][]) {
        const measure = parseFloatOrNull(r[`${prefix}_measure`]);
        const alert = parseYN(r[`${prefix}_ac`]);
        dbRows.push({
          dot_number: dot,
          basic_name: basicName,
          measure,
          percentile: null,                    // populated post-ingest by csa.recompute_percentiles()
          alert,
          serious_violation: false,            // FMCSA serious-violation flag not exposed in SODA BASIC dataset
          insufficient_data: measure === null,
          raw_row: r,
        });
      }
    }

    if (opts.dryRun) {
      console.log(`  [basic] dry-run: ${totalFetched} carriers → would write ${dbRows.length} basic_scores rows`);
      await closeRefreshRun(sql, runId, 'ok', dbRows.length, 0, Date.now() - started);
      return { ok: true, phase: 'basic', rows: dbRows.length, duration_ms: Date.now() - started };
    }

    await sql.begin(async (tx) => {
      await tx`truncate table csa.basic_scores`;
      for (let i = 0; i < dbRows.length; i += INSERT_BATCH_SIZE) {
        const slice = dbRows.slice(i, i + INSERT_BATCH_SIZE);
        await tx`insert into csa.basic_scores ${tx(slice,
          'dot_number', 'basic_name', 'measure', 'percentile',
          'alert', 'serious_violation', 'insufficient_data', 'raw_row')}`;
      }
    });

    await closeRefreshRun(sql, runId, 'ok', dbRows.length, 0, Date.now() - started);
    console.log(`  [basic] ✓ ${totalFetched} carriers → ${dbRows.length} basic_scores rows in ${Date.now() - started}ms`);
    return { ok: true, phase: 'basic', rows: dbRows.length, duration_ms: Date.now() - started };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await closeRefreshRun(sql, runId, 'error', 0, 0, Date.now() - started, msg);
    return { ok: false, phase: 'basic', rows: 0, error: msg };
  }
}

// ─── Phase: inspections ────────────────────────────────────────────────────
async function loadInspections(sql: postgres.Sql, opts: PageOpts): Promise<PhaseResult> {
  const started = Date.now();
  const runId = await openRefreshRun(sql, 'inspections', ENDPOINTS.inspections);
  const publishedAt = new Date();
  try {
    const dbRows: Array<{
      insp_report_number: string;
      dot_number: number | null;
      inspection_date: string | null;
      inspection_level: string | null;
      report_state: string | null;
      vehicle_oos_total: number;
      driver_oos_total: number;
      total_violations: number;
      hazmat_indicator: boolean;
      raw_row: object;
    }> = [];

    const totalFetched = await fetchAllPages<SodaRow>(ENDPOINTS.inspections, opts, (batch, page) => {
      console.log(`  [inspections] page ${page + 1}: ${batch.length} rows (running total: ${dbRows.length + batch.length})`);
      for (const r of batch) {
        const rpt = r.report_number;
        if (!rpt) continue;
        const violSum =
          parseIntOrZero(r.unsafe_viol) + parseIntOrZero(r.fatigued_viol) +
          parseIntOrZero(r.dr_fitness_viol) + parseIntOrZero(r.subt_alcohol_viol) +
          parseIntOrZero(r.vh_maint_viol) + parseIntOrZero(r.hm_viol);
        dbRows.push({
          insp_report_number: rpt,
          dot_number: parseIntOrZero(r.dot_number) || null,
          inspection_date: parseSodaDate(r.insp_date),
          inspection_level: r.insp_level_id ?? null,
          report_state: r.report_state ?? null,
          vehicle_oos_total: parseIntOrZero(r.vehicle_oos_total),
          driver_oos_total: parseIntOrZero(r.driver_oos_total),
          total_violations: violSum,
          hazmat_indicator: parseIntOrZero(r.total_hazmat_sent) > 0,
          raw_row: r,
        });
      }
    });

    if (opts.dryRun) {
      console.log(`  [inspections] dry-run: ${totalFetched} rows fetched, ${dbRows.length} parseable`);
      await closeRefreshRun(sql, runId, 'ok', dbRows.length, 0, Date.now() - started);
      return { ok: true, phase: 'inspections', rows: dbRows.length, duration_ms: Date.now() - started };
    }

    // Truncate-reload raw + append to history (matching published_at)
    let historyAppended = 0;
    await sql.begin(async (tx) => {
      await tx`truncate table csa.inspections_raw`;
      for (let i = 0; i < dbRows.length; i += INSERT_BATCH_SIZE) {
        const slice = dbRows.slice(i, i + INSERT_BATCH_SIZE);
        await tx`insert into csa.inspections_raw ${tx(slice,
          'insp_report_number', 'dot_number', 'inspection_date', 'inspection_level',
          'report_state', 'vehicle_oos_total', 'driver_oos_total',
          'total_violations', 'hazmat_indicator', 'raw_row')}`;
      }
      // History append — same payload + this run's published_at
      const histRows = dbRows.map(r => ({ ...r, published_at: publishedAt }));
      for (let i = 0; i < histRows.length; i += INSERT_BATCH_SIZE) {
        const slice = histRows.slice(i, i + INSERT_BATCH_SIZE);
        await tx`insert into csa.inspections_history ${tx(slice,
          'insp_report_number', 'dot_number', 'inspection_date', 'inspection_level',
          'report_state', 'vehicle_oos_total', 'driver_oos_total',
          'total_violations', 'hazmat_indicator', 'raw_row', 'published_at')}
          on conflict (insp_report_number, published_at) do nothing`;
        historyAppended += slice.length;
      }
    });

    await closeRefreshRun(sql, runId, 'ok', dbRows.length, historyAppended, Date.now() - started);
    console.log(`  [inspections] ✓ ${dbRows.length} raw + ${historyAppended} history in ${Date.now() - started}ms`);
    return { ok: true, phase: 'inspections', rows: dbRows.length, duration_ms: Date.now() - started };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await closeRefreshRun(sql, runId, 'error', 0, 0, Date.now() - started, msg);
    return { ok: false, phase: 'inspections', rows: 0, error: msg };
  }
}

// ─── Phase: crashes ────────────────────────────────────────────────────────
async function loadCrashes(sql: postgres.Sql, opts: PageOpts): Promise<PhaseResult> {
  const started = Date.now();
  const runId = await openRefreshRun(sql, 'crashes', ENDPOINTS.crashes);
  const publishedAt = new Date();
  try {
    const dbRows: Array<{
      report_number: string;
      dot_number: number | null;
      report_date: string | null;
      report_state: string | null;
      fatalities: number;
      injuries: number;
      tow_away: boolean;
      hazmat_involved: boolean;
      raw_row: object;
    }> = [];

    const totalFetched = await fetchAllPages<SodaRow>(ENDPOINTS.crashes, opts, (batch, page) => {
      console.log(`  [crashes] page ${page + 1}: ${batch.length} rows (running total: ${dbRows.length + batch.length})`);
      for (const r of batch) {
        const rpt = r.report_number;
        if (!rpt) continue;
        dbRows.push({
          report_number: rpt,
          dot_number: parseIntOrZero(r.dot_number) || null,
          report_date: parseSodaDate(r.report_date),
          report_state: r.report_state ?? null,
          fatalities: parseIntOrZero(r.fatalities),
          injuries: parseIntOrZero(r.injuries),
          tow_away: parseBoolean(r.tow_away),
          hazmat_involved: false,  // SODA crash dataset doesn't carry hazmat directly; derive later if needed
          raw_row: r,
        });
      }
    });

    if (opts.dryRun) {
      console.log(`  [crashes] dry-run: ${totalFetched} fetched, ${dbRows.length} parseable`);
      await closeRefreshRun(sql, runId, 'ok', dbRows.length, 0, Date.now() - started);
      return { ok: true, phase: 'crashes', rows: dbRows.length, duration_ms: Date.now() - started };
    }

    let historyAppended = 0;
    await sql.begin(async (tx) => {
      await tx`truncate table csa.crashes_raw`;
      for (let i = 0; i < dbRows.length; i += INSERT_BATCH_SIZE) {
        const slice = dbRows.slice(i, i + INSERT_BATCH_SIZE);
        await tx`insert into csa.crashes_raw ${tx(slice,
          'report_number', 'dot_number', 'report_date', 'report_state',
          'fatalities', 'injuries', 'tow_away', 'hazmat_involved', 'raw_row')}`;
      }
      const histRows = dbRows.map(r => ({ ...r, published_at: publishedAt }));
      for (let i = 0; i < histRows.length; i += INSERT_BATCH_SIZE) {
        const slice = histRows.slice(i, i + INSERT_BATCH_SIZE);
        await tx`insert into csa.crashes_history ${tx(slice,
          'report_number', 'dot_number', 'report_date', 'report_state',
          'fatalities', 'injuries', 'tow_away', 'hazmat_involved', 'raw_row', 'published_at')}
          on conflict (report_number, published_at) do nothing`;
        historyAppended += slice.length;
      }
    });

    await closeRefreshRun(sql, runId, 'ok', dbRows.length, historyAppended, Date.now() - started);
    console.log(`  [crashes] ✓ ${dbRows.length} raw + ${historyAppended} history in ${Date.now() - started}ms`);
    return { ok: true, phase: 'crashes', rows: dbRows.length, duration_ms: Date.now() - started };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await closeRefreshRun(sql, runId, 'error', 0, 0, Date.now() - started, msg);
    return { ok: false, phase: 'crashes', rows: 0, error: msg };
  }
}

// ─── Phase: summary (calls SQL functions defined in §E + §F) ───────────────
async function loadSummary(sql: postgres.Sql): Promise<PhaseResult> {
  const started = Date.now();
  const runId = await openRefreshRun(sql, 'summary', null);
  try {
    await sql`select csa.recompute_percentiles()`;
    await sql`select csa.refresh_carrier_safety_summary()`;
    const [{ count }] = await sql<{ count: number }[]>`
      select count(*)::int as count from csa.carrier_safety_summary
    `;
    await closeRefreshRun(sql, runId, 'ok', count, 0, Date.now() - started);
    console.log(`  [summary] ✓ ${count} carrier summary rows in ${Date.now() - started}ms`);
    return { ok: true, phase: 'summary', rows: count, duration_ms: Date.now() - started };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await closeRefreshRun(sql, runId, 'error', 0, 0, Date.now() - started, msg);
    return { ok: false, phase: 'summary', rows: 0, error: msg };
  }
}

// ─── Revalidate ────────────────────────────────────────────────────────────
async function revalidate(): Promise<void> {
  const base = process.env.APP_BASE_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.log('[revalidate] skipped (APP_BASE_URL or CRON_SECRET not set)');
    return;
  }
  const tags = ['csa-safety-all', 'csa-basics-all', 'csa-inspections-all', 'csa-crashes-all'];
  const res = await fetch(`${base.replace(/\/$/, '')}/api/cache/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ tags }),
  });
  console.log(`[revalidate] ${res.ok ? '✓' : '✗'} ${res.status}`);
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const dbUrl = mustEnv('SUPABASE_DB_URL');
  const opts: PageOpts = {
    limit: parseArg('limit') ? Number.parseInt(parseArg('limit')!, 10) : DEFAULT_LIMIT,
    maxPages: parseArg('max-pages') ? Number.parseInt(parseArg('max-pages')!, 10) : DEFAULT_MAX_PAGES,
    dryRun: parseFlag('dry-run'),
  };
  const phaseArg = (parseArg('phase') ?? 'all') as Phase | 'all';
  const noRevalidate = parseFlag('no-revalidate');

  const phases: Phase[] =
    phaseArg === 'all'
      ? ['basic', 'inspections', 'crashes', 'summary']
      : [phaseArg as Phase];

  console.log(`csa-ingest-soda — phases: ${phases.join(' → ')}`);
  console.log(`  limit=${opts.limit}, max-pages=${opts.maxPages}, dry-run=${opts.dryRun}`);
  console.log('');

  const sql = postgres(dbUrl, { ssl: 'require', max: 4, idle_timeout: 30 });

  const results: PhaseResult[] = [];
  try {
    for (const phase of phases) {
      console.log(`── ${phase.toUpperCase()} ──`);
      if (phase === 'basic')             results.push(await loadBasic(sql, opts));
      else if (phase === 'inspections')  results.push(await loadInspections(sql, opts));
      else if (phase === 'crashes')      results.push(await loadCrashes(sql, opts));
      else if (phase === 'summary')      results.push(await loadSummary(sql));
      const last = results[results.length - 1];
      if (!last.ok) {
        console.error(`✗ ${phase} failed — aborting.`);
        break;
      }
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  console.log('');
  console.log('── results ──');
  for (const r of results) {
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.phase}: ${r.rows.toLocaleString()} rows in ${r.duration_ms ?? 0}ms${r.error ? ` — ${r.error}` : ''}`);
  }

  const allOk = results.every(r => r.ok);
  if (allOk && !noRevalidate) {
    console.log('');
    await revalidate();
  }

  process.exit(allOk ? 0 : 1);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
```

---

## §E — Migration `<date>_csa_recompute_percentiles.sql`

Naming convention: use the date dotintel2 SESSION_30 runs (e.g. `20260516_csa_recompute_percentiles.sql`).

```sql
-- csa.recompute_percentiles()
--
-- Implements FMCSA SMS Methodology rank-within-Safety-Event-Group for the
-- five publicly displayed BASICs. Populates csa.basic_scores.percentile
-- after a fresh ingest. Cross-validates against the published _ac flag —
-- mismatch rate logged to csa.sms_refresh_runs.error_message of the latest
-- 'summary' run.
--
-- Version: v1 (bucket-based SEGs, not the 2023 Proportionate Percentiles
-- refinement). Defensible per SMS Methodology PDF; refine if mismatch rate
-- exceeds 5% after first ingest.
--
-- Per FMCSA SMS Methodology:
--   - Safety Event Group is defined by inspection count (variable depending
--     on BASIC).
--   - For unsafe_driving / hos_compliance / driver_fitness: SEG by total
--     insp_total. Minimum-data floor: 3.
--   - For vehicle_maintenance: SEG by vehicle_insp_total. Floor: 5.
--   - For controlled_substances: SEG by driver_insp_total. Floor: 5.
--   - Within bucket, rank by measure value ascending; percentile = rank/count*100.
--   - Below floor → percentile null + insufficient_data flag.
--
-- For v1 we use 5 quintile buckets per BASIC based on the carrier
-- population's inspection-count distribution. The 2023 Proportionate
-- Percentiles refinement uses exact inspection count instead of buckets —
-- defer to v2.

create or replace function csa.recompute_percentiles()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match_count integer := 0;
  v_total_with_alert integer := 0;
  v_mismatch_rate numeric;
begin
  -- Step 1: clear existing percentile values
  update csa.basic_scores set percentile = null where percentile is not null;

  -- Step 2: build SEG buckets + rank within bucket per BASIC.
  -- The CTE pattern: for each basic_name + insp-count bucket, percent_rank()
  -- gives us a 0-1 score; multiply by 100 for percentile.
  --
  -- The insp_count comes from raw_row JSON (we stored the full SODA payload).
  -- Field names per BASIC:
  --   unsafe_driving, hos_compliance, driver_fitness → 'insp_total'
  --   vehicle_maintenance → 'vehicle_insp_total'
  --   controlled_substances → 'driver_insp_total'

  with insp_lookup as (
    select
      dot_number,
      basic_name,
      case basic_name
        when 'unsafe_driving'        then (raw_row->>'insp_total')::numeric
        when 'hos_compliance'        then (raw_row->>'insp_total')::numeric
        when 'driver_fitness'        then (raw_row->>'insp_total')::numeric
        when 'vehicle_maintenance'   then (raw_row->>'vehicle_insp_total')::numeric
        when 'controlled_substances' then (raw_row->>'driver_insp_total')::numeric
      end as insp_count,
      case basic_name
        when 'unsafe_driving'        then 3
        when 'hos_compliance'        then 3
        else 5
      end as min_floor
    from csa.basic_scores
    where measure is not null
  ),
  qualified as (
    select
      l.dot_number,
      l.basic_name,
      l.insp_count,
      -- Bucket by quintile within each BASIC's qualified population
      ntile(5) over (
        partition by l.basic_name
        order by l.insp_count
      ) as seg_bucket
    from insp_lookup l
    where l.insp_count is not null
      and l.insp_count >= l.min_floor
  ),
  ranked as (
    select
      q.dot_number,
      q.basic_name,
      percent_rank() over (
        partition by q.basic_name, q.seg_bucket
        order by bs.measure
      ) * 100 as pct
    from qualified q
    join csa.basic_scores bs
      on bs.dot_number = q.dot_number and bs.basic_name = q.basic_name
  )
  update csa.basic_scores bs
  set percentile = r.pct
  from ranked r
  where bs.dot_number = r.dot_number
    and bs.basic_name = r.basic_name;

  -- Step 3: cross-validate against _ac flag.
  -- Intervention thresholds per FMCSA SMS Methodology:
  --   65th percentile: unsafe_driving, hos_compliance (Crash Indicator
  --                    also 65 but not in v1 scope)
  --   80th percentile: driver_fitness, controlled_substances,
  --                    vehicle_maintenance, hazmat_compliance
  --
  -- Our computed (percentile >= threshold) should match alert flag for >95%
  -- of carriers with sufficient data. Lower → methodology drift; investigate.

  select
    count(*) filter (
      where (
        (basic_name in ('unsafe_driving','hos_compliance') and percentile >= 65 and alert = true)
        or (basic_name in ('unsafe_driving','hos_compliance') and percentile < 65 and alert = false)
        or (basic_name in ('driver_fitness','controlled_substances','vehicle_maintenance') and percentile >= 80 and alert = true)
        or (basic_name in ('driver_fitness','controlled_substances','vehicle_maintenance') and percentile < 80 and alert = false)
      )
    ),
    count(*) filter (where percentile is not null)
  into v_match_count, v_total_with_alert
  from csa.basic_scores;

  if v_total_with_alert > 0 then
    v_mismatch_rate := round(100.0 - (v_match_count::numeric * 100 / v_total_with_alert), 2);
  else
    v_mismatch_rate := null;
  end if;

  -- Log mismatch rate to the most-recent summary refresh run
  update csa.sms_refresh_runs
  set error_message = case
        when v_mismatch_rate is null then 'percentile cross-validation: no rows with percentile'
        when v_mismatch_rate <= 5 then format('percentile cross-validation: %s%% mismatch (within threshold)', v_mismatch_rate)
        else format('percentile cross-validation: %s%% mismatch (EXCEEDS 5%% threshold — investigate methodology drift)', v_mismatch_rate)
      end
  where id = (
    select id from csa.sms_refresh_runs
    where phase = 'summary' and status = 'running'
    order by started_at desc
    limit 1
  );
end;
$$;

grant execute on function csa.recompute_percentiles() to service_role;
```

---

## §F — Migration `<date>_csa_refresh_safety_summary.sql`

```sql
-- csa.refresh_carrier_safety_summary()
--
-- Rebuilds csa.carrier_safety_summary from raw + basic_scores.
-- One row per DOT carrier. Called by the summary phase of csa-ingest-soda.ts.
-- Runs AFTER recompute_percentiles() so the per-BASIC pct columns reflect
-- the freshly computed values.
--
-- Plain-table rebuild (per feedback_fmcsa_data_refresh_architecture rule 3 —
-- publisher + aggregate share cadence; materialized view would be wrong tool).

create or replace function csa.refresh_carrier_safety_summary()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_24mo_cutoff date := (now() - interval '24 months')::date;
begin
  truncate table csa.carrier_safety_summary;

  insert into csa.carrier_safety_summary (
    dot_number,
    basics_alert_count,
    unsafe_driving_alert, hos_compliance_alert, driver_fitness_alert,
    controlled_substances_alert, vehicle_maintenance_alert,
    unsafe_driving_pct, hos_compliance_pct, driver_fitness_pct,
    controlled_substances_pct, vehicle_maintenance_pct,
    inspections_24mo, inspections_with_violations_24mo,
    vehicle_oos_count_24mo, driver_oos_count_24mo,
    vehicle_oos_rate_24mo, driver_oos_rate_24mo,
    crashes_24mo, fatal_crashes_24mo, injury_crashes_24mo, tow_away_crashes_24mo,
    refreshed_at
  )
  select
    dots.dot_number,
    -- BASIC alert rollup (5 public BASICs)
    coalesce(
      (case when bs_uds.alert then 1 else 0 end)
      + (case when bs_hos.alert then 1 else 0 end)
      + (case when bs_df.alert  then 1 else 0 end)
      + (case when bs_cs.alert  then 1 else 0 end)
      + (case when bs_vm.alert  then 1 else 0 end),
      0
    ) as basics_alert_count,
    coalesce(bs_uds.alert, false), coalesce(bs_hos.alert, false), coalesce(bs_df.alert, false),
    coalesce(bs_cs.alert, false),  coalesce(bs_vm.alert, false),
    bs_uds.percentile, bs_hos.percentile, bs_df.percentile,
    bs_cs.percentile,  bs_vm.percentile,
    -- 24-month inspection rollups
    coalesce(insp.total_insp, 0),
    coalesce(insp.insp_with_viol, 0),
    coalesce(insp.veh_oos, 0),
    coalesce(insp.drv_oos, 0),
    case when insp.total_insp > 0 then round(insp.veh_oos::numeric / insp.total_insp * 100, 2) end,
    case when insp.total_insp > 0 then round(insp.drv_oos::numeric / insp.total_insp * 100, 2) end,
    -- 24-month crash rollups
    coalesce(cr.total_cr, 0),
    coalesce(cr.fatal_cr, 0),
    coalesce(cr.injury_cr, 0),
    coalesce(cr.tow_cr, 0),
    now()
  from (
    -- All DOTs that appear anywhere in CSA data
    select distinct dot_number from csa.basic_scores where dot_number is not null
    union
    select distinct dot_number from csa.inspections_raw where dot_number is not null
    union
    select distinct dot_number from csa.crashes_raw where dot_number is not null
  ) dots
  left join csa.basic_scores bs_uds on bs_uds.dot_number = dots.dot_number and bs_uds.basic_name = 'unsafe_driving'
  left join csa.basic_scores bs_hos on bs_hos.dot_number = dots.dot_number and bs_hos.basic_name = 'hos_compliance'
  left join csa.basic_scores bs_df  on bs_df.dot_number  = dots.dot_number and bs_df.basic_name  = 'driver_fitness'
  left join csa.basic_scores bs_cs  on bs_cs.dot_number  = dots.dot_number and bs_cs.basic_name  = 'controlled_substances'
  left join csa.basic_scores bs_vm  on bs_vm.dot_number  = dots.dot_number and bs_vm.basic_name  = 'vehicle_maintenance'
  left join (
    select
      dot_number,
      count(*) as total_insp,
      count(*) filter (where total_violations > 0) as insp_with_viol,
      sum(vehicle_oos_total) as veh_oos,
      sum(driver_oos_total) as drv_oos
    from csa.inspections_raw
    where inspection_date >= v_24mo_cutoff
    group by dot_number
  ) insp on insp.dot_number = dots.dot_number
  left join (
    select
      dot_number,
      count(*) as total_cr,
      count(*) filter (where fatalities > 0) as fatal_cr,
      count(*) filter (where injuries > 0) as injury_cr,
      count(*) filter (where tow_away = true) as tow_cr
    from csa.crashes_raw
    where report_date >= v_24mo_cutoff
    group by dot_number
  ) cr on cr.dot_number = dots.dot_number;
end;
$$;

grant execute on function csa.refresh_carrier_safety_summary() to service_role;
```

---

## §G — Testing protocol

**Pre-flight (in dotintel2):**
```powershell
# 1. Verify postgres.js is installed
npm ls postgres

# 2. Verify SUPABASE_DB_URL is set (Settings → Database → Connection URI in Supabase dashboard)
#    Drop into .env.csa-ingest (NOT shell — PowerShell mangles $ in passwords).

# 3. Dry-run ALL phases at smallest scope
npx tsx ./scripts/csa-ingest-soda.ts --phase=basic --limit=1000 --max-pages=1 --dry-run
npx tsx ./scripts/csa-ingest-soda.ts --phase=crashes --limit=1000 --max-pages=1 --dry-run
npx tsx ./scripts/csa-ingest-soda.ts --phase=inspections --limit=1000 --max-pages=1 --dry-run
```

Each should print:
- "loaded N vars from .env.csa-ingest"
- "[<phase>] page 1: 1000 rows (running total: 1000)"
- "[<phase>] dry-run: 1000 fetched, N parseable"
- "✓ <phase>: N rows in <ms>ms"

If parse errors fire, check §H gotchas.

**Real ingest (after dry-run passes):**
```powershell
# Apply migrations first
# (use Supabase MCP apply_migration in Claude)

# BASIC first (smallest payload, ~600k carriers × 5 = ~3M rows)
npx tsx ./scripts/csa-ingest-soda.ts --phase=basic

# Verify in Supabase SQL editor:
# select count(*) from csa.basic_scores;     -- expect ~3M
# select count(distinct dot_number) from csa.basic_scores;  -- expect ~600k
# select * from csa.basic_scores where dot_number = <known-dot> order by basic_name;

# Crashes (medium)
npx tsx ./scripts/csa-ingest-soda.ts --phase=crashes

# Inspections (~5.78M rows — longest run, est 2-4 hours on 5k batch INSERTs)
npx tsx ./scripts/csa-ingest-soda.ts --phase=inspections

# Summary (runs both SQL functions + reads count)
npx tsx ./scripts/csa-ingest-soda.ts --phase=summary

# Then verify percentile cross-validation in latest sms_refresh_runs:
# select phase, status, rows_loaded, duration_ms, error_message
# from csa.sms_refresh_runs order by started_at desc limit 5;
#
# error_message on the summary row will say:
# "percentile cross-validation: <X>% mismatch (within threshold)"
# Expect X <= 5%. If higher, investigate before publishing /methodology.
```

**UI verification:**
1. Hit `https://www.dotintel.io/carriers/<known-dot-with-alerts>` — BASIC bars render with real measure/percentile/alert states.
2. Hit `https://www.dotintel.io/methodology` — the new CSA disclosure block renders with bucket-rank formula + FMCSA SMS Methodology PDF link.

---

## §H — Known gotchas + open questions

1. **PowerShell `$` interpolation in DB URL passwords.** If `SUPABASE_DB_URL` contains a literal `$` (Supabase autogenerates these in autogen passwords sometimes), shell-set env vars get mangled. ALWAYS use `.env.csa-ingest` — the env-loader strips quotes and treats content as literal.

2. **SODA date format inconsistency.** Most BASIC + inspection rows use `DD-MON-YY` (e.g. `"17-JUL-25"`). Some Crash rows have been observed using ISO `"2025-07-17T00:00:00.000"`. The `parseSodaDate()` helper handles both.

3. **Inspection volume.** ~5.78M rows. At 50k/page + 5k batch INSERTs, ~2-4 hours runtime. If too slow:
   - Bump batch size to 10k or use `COPY ... FROM STDIN` (`postgres.js` supports it via `sql.copy(...)`)
   - Run inspections last; the BASIC bars UI lights up after BASIC + summary phases without inspection raw data
4. **SODA rate limit (anonymous): 1000 req/hr per IP.** 116 inspection pages stays well under. If running in parallel with crashes / other tools, might hit it — wait an hour and resume from the failed offset (currently the script doesn't checkpoint; v2 would add a `--resume-offset=N` flag).

5. **Percentile cross-validation drift.** If mismatch rate >5% after first ingest:
   - Check parser for `parseYN()` capturing both `Y` and uppercase variants
   - Check whether SODA is returning a different `_ac` field name in production than the schema doc suggests
   - Consider upgrading to 2023 Proportionate Percentiles (exact inspection count, no buckets) — defer to v2
6. **`csa.basic_scores.serious_violation` is hardcoded false.** SODA BASIC dataset doesn't expose this flag. If we need it, source from violation-level dataset (`8mt8-2mdr`) — out of v1 scope.

7. **Hazmat indicator on crashes is hardcoded false.** SODA crash schema doesn't directly expose hazmat involvement. Could derive by joining to inspection rows on the same date+DOT — defer to v2.

8. **Crash Indicator + Hazmat Compliance BASICs are NOT in v1 scope.** Schema allows them (basic_name CHECK constraint covers all 7) but the SODA AB PassProperty dataset doesn't expose them publicly. Wait until FMCSA exposes them OR we derive from raw crashes (Crash Indicator) and HM_VIOL on inspections (Hazmat Compliance).

9. **Open question:** Should the script support `--published-at=<date>` to override `now()` for backfills? v1 hardcodes `now()`. v2 add the flag if/when we backfill from historical SODA snapshots.

10. **Memory footprint.** The script accumulates all rows in memory before the TRUNCATE+INSERT transaction. For inspections at 5.78M rows × ~500 bytes each, that's ~3 GB RAM. Should be fine on Master O's machine but flag if Node heap errors fire. v2 fix: stream pages directly into batches without accumulating.

---

## §I — When dotintel2 SESSION_30 closes

Per Working Agreement Rule 5 (after dotintel2 cascades the amendment in §B):

1. Update `dotintel2/docs/BACKLOG.md`:
   - Active arc closes (Sub-arc 3A done)
   - Promote Sub-arc 3B daily delta to active
   - Add Done entry
2. **Flag FAMILY_HEALTH.md refresh in the handoff** — the active arc row for dotintel2 needs updating in saas-agency-database's `docs/context/FAMILY_HEALTH.md`, but dotintel2 SESSION_30 doesn't write that file (Rule 2(b) clause 1). Instead, the SESSION_30 handoff has a "Cross-product implications" section noting the needed FAMILY_HEALTH update; the next saas-agency-database family-hub session picks it up.
3. Write `dotintel2/docs/SESSION_30_HANDOFF.md`.
4. `git push origin main`.
5. Write `dotintel2/docs/SESSION_31_PROMPT.md` — Sub-arc 3B daily delta refresh, after 5 customer-discovery calls per D-017f.

---

*End cross-repo artifact for dotintel2 SESSION_30. Drafted 2026-05-15 from saas-agency-database SESSION_24 under Rule 2(b). Zero writes to dotintel2 tree from this session.*
