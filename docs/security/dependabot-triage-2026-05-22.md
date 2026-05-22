# Dependabot triage memo — 2026-05-22

**Author:** Claude (post-Sessions 27-32 epic close, parallel to BACKLOG #1 ship)
**Repo:** `saas-agency-database`
**Trigger:** 3 pre-existing GitHub Dependabot alerts carried since SESSION_27 close (banner appears on every `git push` to `main`).
**Source data:** `npm audit --json` + advisory URLs cross-referenced.

> This is decision support, not action. Master O acts at laptop on whichever recommendations he greenlights.

---

## TL;DR

| # | Pkg | Sev | CVSS | Reachable in prod? | Recommendation | Effort |
|---:|---|---|---|---|---|---|
| 1 | `xlsx` (sheetjs) | high | 7.8 + 7.5 | **No** — `scripts/` only | **Accept now**, queue exceljs migration for next touch | ~2-4 hr (deferred) |
| 2 | `next` (via `postcss`) | moderate | n/a | Build-time only, unclear exploit path | **Accept + monitor** Next release notes | 0 (wait) |
| 3 | `ws` | moderate | 4.4 | Transitive (likely deno-runtime or test tool) | **Merge dependabot PR** — already prepared | ~1 min |

**Net actionable today:** 1 of 3 — merge the existing `dependabot/npm_and_yarn/ws-8.20.1` PR. The other two have documented acceptance reasoning.

---

## 1. `xlsx` (sheetjs) — high, two advisories

**Currently installed:** `^0.18.5` (direct dependency)

**Advisories:**
1. **Prototype Pollution in sheetJS** — high, CVSS 7.8 (AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H) — fixed in `>=0.19.3`
   https://github.com/advisories/GHSA-4r6h-8v6p-xvw6
2. **SheetJS Regular Expression Denial of Service (ReDoS)** — high, CVSS 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H) — fixed in `>=0.20.2`
   https://github.com/advisories/GHSA-5pgg-2g8v-p4x9

**Fix availability:** `false` per `npm audit` — sheetjs publishes patched versions to their own CDN at `cdn.sheetjs.com`, not npm. The `xlsx` npm package is intentionally stale on npm because the author moved to a paid model.

**Reachability analysis:**
- Used in `scripts/` only — `load-adlist.ts`, `inspect-adlist.ts`, `harvest-unmatched-carriers.ts`
- **Zero customer-runtime exposure** — these scripts process VENDOR-PROVIDED .xlsx files during one-shot data loads (AdList, etc.), not user uploads
- Attack vector for both advisories: "process attacker-controlled .xlsx file" — only triggered if Master O personally runs a script against a maliciously-crafted file
- Mitigation in current usage: source files come from known vendors (AdList, DOT Intel, etc.) with established lineage

**Recommendation: ACCEPT** with documented justification. Backlog already tracks this:
> "xlsx (SheetJS) prototype-pollution + ReDoS — no upstream patch. Used only in scripts/. Migrate to exceljs someday."

**Future migration trigger:** Next time any `scripts/*adlist*.ts` or `scripts/harvest-*.ts` is touched for a new data load, swap `xlsx` → `exceljs`. `exceljs` is actively maintained on npm, supports the same .xlsx read patterns, and has no known CVEs in the current range.

**Estimated migration effort:** ~2-4 hrs (3 scripts × ~30-60 min each + integration test against an actual AdList file). Not urgent.

**Add to script headers (optional, ~5 min):**
```ts
// SECURITY: This script depends on xlsx@0.18.5 which has unpatched prototype
// pollution + ReDoS advisories. Only load .xlsx files from verified vendor
// sources. Do not pipe user-uploaded files through this code path.
```

---

## 2. `next` — moderate (via `postcss` transitive)

**Currently installed:** `next@^16.2.6` (direct, latest stable Next.js 16)

**Advisory:** Indirect — vulnerability is in `postcss` bundled inside Next's build pipeline. `npm audit` rolls this up under `next` because postcss is a deep-bundled dependency.

**Reported fix availability:** `next@9.3.3` with `isSemVerMajor: true`. This is **not a real fix path** — it would require a 7-major-version regression that breaks App Router, React 19, all the work shipped in Sessions 27-32. Catastrophic.

**Reachability analysis:**
- postcss runs at **build time only**, not at runtime
- Exploit would require a maliciously-crafted CSS file processed by postcss
- Our CSS pipeline processes Tailwind generated CSS (controlled) + app-authored CSS (controlled) — no user-submitted CSS gets near postcss
- Realistic exploit risk in our usage: near-zero

**Recommendation: ACCEPT + MONITOR.**
- Don't downgrade Next.
- Watch Next.js release notes (`https://github.com/vercel/next.js/releases`) for any patch release that bumps the bundled postcss.
- Re-run `npm audit` after each `npm install` to confirm the advisory is gone.
- If Vercel/Next ship a patch release within ~30 days, upgrade. If 90+ days, consider overriding the postcss version via npm overrides as an interim measure.

**npm overrides interim option (~5 min if needed):**
Add to `package.json`:
```json
"overrides": {
  "postcss": "^8.4.31"
}
```
Test build before committing. Skip unless the advisory persists past 30 days.

---

## 3. `ws` — moderate, transitive

**Currently installed:** somewhere in the `8.0.0 - 8.20.0` range (transitive — `npm audit` doesn't show direct consumer; likely `puppeteer-core`, `deno`, or a Supabase Realtime path).

**Advisory:** "ws: Uninitialized memory disclosure" — moderate, CVSS 4.4 (AV:N/AC:H/PR:H/UI:N/S:U/C:H/I:N/A:N)
https://github.com/advisories/GHSA-58qx-3vcg-4xpx

**Risk analysis:**
- CVSS vector: **Network** attack, **High** attack complexity, **High** privileges required, no user interaction
- Translation: exploitable only against a network-listening `ws` server (we don't run one), with attacker already having elevated privileges
- Realistic exploit risk in our usage: very low

**Fix availability:** `true` — bump to `ws@8.20.1`. **A Dependabot PR is already open** on branch `dependabot/npm_and_yarn/ws-8.20.1`.

**Recommendation: MERGE THE DEPENDABOT PR.** ~1 min, instant resolution. Vercel will run a preview build, you confirm READY, merge.

---

## Recommended actions (in order)

| # | Action | Where | Effort |
|---:|---|---|---|
| 1 | **Merge `dependabot/npm_and_yarn/ws-8.20.1`** — resolves the only easy-to-fix advisory | GitHub mobile or laptop | ~1 min |
| 2 | (Optional, ~5 min) Add SECURITY header comments to the 3 `scripts/*xlsx*.ts` files documenting the accepted xlsx risk | Future commit, when touched | ~5 min |
| 3 | Watch Next.js release notes for postcss bump; re-run `npm audit` monthly | Bookmark + monthly check | 0 (passive) |

After merging the ws PR + this memo lands: Dependabot count drops 3 → 2 (one high `xlsx` + one moderate `next/postcss`, both with documented acceptance rationale). The "GitHub found 3 vulnerabilities" push banner will become "1 high, 1 moderate" with explicit acceptance memo on file.

---

## Why this isn't "fix everything now"

Best-practice SaaS security posture is **calibrated risk acceptance with documented justification**, not "zero-CVE-or-bust." The 2 we're accepting are:
- **xlsx** — high severity headline, near-zero actual exposure (offline scripts only, controlled inputs). Mitigation = controlled-input discipline + planned migration on next touch.
- **next/postcss** — build-time only, controlled CSS pipeline, the "fix" is catastrophic regression.

A perfectionist "fix everything" stance would mean:
- Rewriting 3 working scripts to swap xlsx → exceljs (no current trigger; AdList loads aren't happening this week)
- Downgrading Next 7 major versions (would burn the entire Sessions 27-32 epic)

Both costs vastly exceed the residual risk. **Accept with documented memo > performative remediation.**

---

## Next refresh trigger

Re-run this analysis after any of:
- Master O merges the `ws` Dependabot PR (drops the count + this memo gets a closing update)
- Next.js ships a patch release (potentially clears the postcss advisory automatically)
- Any new GitHub Dependabot alert appears on the next push to main
- 30 days elapse without movement on the xlsx advisory + we touch an AdList script for any reason (triggers the exceljs migration)
